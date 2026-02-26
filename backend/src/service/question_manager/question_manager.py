import base64
import mimetypes
from pathlib import Path
from typing import (
    Dict,
    List,
    Optional,
    Sequence,
    Set,
    Tuple,
    Union,
)

from google.cloud.storage.blob import Blob
from src.data import QuestionDB
from src.model.question import Question, QuestionData
from src.service.storage.base import Storage
from src.types import ID
from src.utils import safe_dir_name
from src.core import logger
from src.model.files import FileData


class QuestionManager:
    """Service that coordinates storage and database operations for questions."""

    # ============================================================
    # Constructor
    # ============================================================
    def __init__(
        self,
        qdb: QuestionDB,
        storage: Storage,
        image_location="clientFiles",
        client_file_extensions: Set[str] = {
            ".png",
            ".jpg",
            ".jpeg",
            ".pdf",
        },
    ):
        """_summary_

        Args:
            qdb (QuestionManager): Manages database interactions for creating and committing the question.
            storage (Storage):  Handles file system or cloud storage initialization for the question.
            STORAGE_TYPE (StorageType): Wether we are working with the cloud or local storage
        """
        self.qdb = qdb
        self.storage = storage
        self.client_path = image_location
        self.client_ext = client_file_extensions

    # ============================================================
    # Question Lifecycle
    # ============================================================

    # Question Lifecycle
    async def create_question(
        self,
        question_data: QuestionData | dict,
        files: Optional[List[FileData]] = None,
        handle_images: bool = True,
    ) -> Question:
        try:

            question_data = QuestionData.model_validate(question_data)
            question = await self.qdb.create_question(question_data)

            if not question_data.base_path:
                raise ValueError("Base path missing")

            question_path = self._question_dir(
                question_data.base_path,
                question,
            )

            storage_path = self.storage.create_dir(question_path)
            logger.info(f"[QM] Created storage path for question {storage_path} ")
            assert self.storage.exists(storage_path)

            await self.qdb.set_question_path(
                question.id,
                self.storage.get_storage_type(),
                question_path,
            )

            if files:
                await self.handle_question_files(
                    files,
                    question_path,
                    handle_images,
                )

            return question
        except Exception as e:
            raise ValueError(f"[QM] Failed to create question {e}")

    async def delete_question(self, qid: ID) -> None:
        question = await self.qdb.get_question(qid)
        if not question:
            raise ValueError(
                "[QuestionManager] Question could not be retrieved. Quesiton is None"
            )
        # Delete the entire storage
        src = await self._resolve_question_path(qid)
        self.storage.delete(src)
        await self.qdb.delete_question(qid)

    async def handle_storage_update(self, qid: ID, destination: str) -> str:
        src = await self._resolve_question_path(qid)
        logger.info(f"[QM] Handling storage update This is the src {src}")
        destination = self.storage.create_dir(destination)
        self.storage.move(src, destination)
        logger.info(
            f"[QM] Changing question storage from old: {src}->new:{destination}"
        )
        await self.qdb.set_question_path(
            qid,
            self.storage.get_storage_type(),
            destination,
        )
        return destination

    # ============================================================
    # File Reading / Writing
    # ============================================================
    async def read_question_file(self, qid: ID, filename: str):
        try:
            path = await self._resolve_question_path(qid)
            return self.storage.read(self._file_target(path, filename))
        except Exception as e:
            raise ValueError(
                f"Failed to read question file {filename} for question {e}"
            )

    async def write_question_file(self, qid: ID, filename: str, data):
        path = await self._resolve_question_path(qid)
        return self.storage.write(
            self._file_target(path, filename),
            data,
        )

    async def delete_file(self, qid: ID, filename: str) -> bool:
        """
        Delete a given file from storage.
        """
        path = await self._resolve_question_path(qid)
        self.storage.delete(self._file_target(path, filename))
        return True

    # ============================================================
    # Retrieval
    # ============================================================

    async def retrieve_question_files(self, qid: ID) -> Sequence[str]:
        question_path = await self._resolve_question_path(qid)
        return [str(p) for p in self.storage.list(question_path)]

    async def retrieve_available_question(
        self, offset: int = 0, limit: int = 100
    ) -> Sequence[Question | QuestionData]:
        all_questions = await self.qdb.get_all_questions(
            offset,
            limit,
            method="default",
            storage_type=self.storage.get_storage_type(),
        )
        return all_questions

    # ============================================================
    # Upload Handling
    # ============================================================

    async def upload_files_to_question(
        self,
        qid: ID,
        files: List[FileData],
        auto_handle_images: bool = True,
    ) -> Dict:
        try:
            question_path = await self._resolve_question_path(qid)
            return await self.handle_question_files(
                files, question_path, auto_handle_images
            )
        except Exception as e:
            raise ValueError(f"Failed to upload files to question {e}")

    async def handle_question_files(
        self,
        files: List[FileData],
        storage_path: str,
        auto_handle_images: bool = True,
    ) -> Dict:
        """
        Save a set of uploaded files.
        """

        client_files, other_files = self._split_files(files)

        if auto_handle_images:
            uploaded_client = self._batch_save_files(
                f"{storage_path}/{self.client_path}",
                client_files,
            )
            uploaded_other = self._batch_save_files(
                storage_path,
                other_files,
            )
            return {
                "status": "ok",
                "client_files": uploaded_client,
                "other_files": uploaded_other,
            }
        uploaded_all = self._batch_save_files(storage_path, files)
        return {
            "status": "ok",
            "files": uploaded_all,
        }

    async def get_question_filedata(
        self,
        qid: ID,
    ) -> List[FileData]:

        question_path = await self._resolve_question_path(qid)
        filenames = self.storage.list(question_path)

        results: List[FileData] = []

        for filepath in filenames:
            filepath = self._norm_path(filepath)
            mime_type, _ = mimetypes.guess_type(filepath)
            content = self.storage.read(filepath)

            if isinstance(content, (bytes | bytearray)):
                encoded = content.decode("utf-8")
            else:
                encoded = content

            results.append(
                FileData(
                    filename=Path(filepath).name,
                    content=encoded,
                    mime_type=mime_type or "application/octet-stream",
                )
            )

        return results

    # ============================================================
    # Helpers
    # ============================================================
    def _batch_save_files(self, dest: str, files: List[FileData]):
        for f in files:
            target = f"{dest}/{f.filename}"
            self.storage.write(target, f.content)

    # ============================================================
    # Private
    # ============================================================

    def _question_dir(self, base_path: str, question: Question) -> str:
        if base_path.endswith("/"):
            return f"{base_path}{safe_dir_name(f'{question.title}_{str(question.id)[:8]}')}"
        else:
            return f"{base_path}/{safe_dir_name(f'{question.title}_{str(question.id)[:8]}')}"

    def _file_target(self, question_path: str, filename: str) -> str:
        return f"{question_path.rstrip('/')}/{filename}"

    async def _resolve_question_path(self, qid: ID) -> str:
        path = await self.qdb.get_question_path(qid, self.storage.get_storage_type())

        if not path:
            raise ValueError("Question path not found")

        if not self.storage.exists(path):
            raise ValueError("Question storage path does not exist")

        return path

    def _split_files(
        self, files: List[FileData]
    ) -> Tuple[List[FileData], List[FileData]]:
        client_files = []
        other_files = []
        for f in files:
            if not f.filename:
                raise ValueError("[QuestionManager] File must have a filename")

            ext = Path(f.filename).suffix.lower()
            if ext in self.client_ext:
                client_files.append(f)
            else:
                other_files.append(f)
        return client_files, other_files

    def _norm_path(self, value: Union[str, Path, Blob]) -> str:
        """
        Normalize input into a StoragePath.

        Accepts:
            - str
            - pathlib.Path
            - StoragePath

        Returns:
            StoragePath (normalized).
        """
        if isinstance(value, str):
            return Path(value).as_posix()
        if isinstance(value, Path):
            return value.as_posix()
        if isinstance(value, Blob):
            if not value.name:
                raise ValueError(f"Cannot determine blob: {value}")
            return Path(value.name).as_posix()

        raise TypeError(f"Unsupported path type: {type(value)}")
