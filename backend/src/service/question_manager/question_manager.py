import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
import asyncio
from fastapi import HTTPException
from starlette import status
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
from src.model.question import Question
from src.service import StorageService
from src.service.file_service import FileService
from src.types import (
    FileData,
    QuestionData,
)
from src.utils import safe_dir_name, to_serializable
from src.types import STORAGE_TYPE, ID


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
        question_id: ID,
        files: List[FileData],
        auto_handle_images: bool = True,
    ) -> Dict:
        """
        Upload a batch of files to a question.

        Performs:
        - Question existence check
        - Resolves absolute storage path (local/cloud)
        - Delegates saving to `handle_question_files()`
        """
        logger.debug("Starting upload for question_id=%s", question_id)

        question = await self.qdb.get_question(question_id)
        if not question:
            logger.warning("Upload failed — question %s not found", question_id)
            raise HTTPException(
                status_code=404, detail=f"Question {question_id} not found"
            )
        abs_path = await self.get_question_path(question.id, relative=False)
        if abs_path is None:
            raise ValueError("Cannot determine path to save questions")
        return await self.handle_question_files(files, abs_path, auto_handle_images)

    # Getting files
    async def get_question_file_names(self, qid: ID) -> List[str]:
        """
        Return a list of stored filenames for a question.
        """
        question_path = await self.get_question_path(qid, relative=False)
        if question_path is None:
            raise ValueError("Could not get question path. Question path is None")
        files = self.storage_manager.list_file_names(question_path)
        image_path = Path(question_path) / self.client_path
        files.extend(self.storage_manager.list_file_names(image_path))
        return files

    async def get_question_filepaths(self, qid: ID) -> List[str]:
        logger.debug("Fetching filepath list for question_id=%s", qid)
        question_path = await self.get_question_path(qid, relative=False)
        if question_path is None:
            raise ValueError("Could not get question path. Question path is None")

        filepaths = self.storage_manager.list_file_paths(question_path)
        logger.debug("Found %d files for question_id=%s", len(filepaths), qid)
        return filepaths

    async def get_question_filedata(self, qid: ID) -> List[FileData]:
        try:
            filenames = await self.get_question_file_names(qid)
            data = []
            for f in filenames:
                mime_type, _ = mimetypes.guess_type(f)
                if mime_type and (
                    mime_type.startswith("text")
                    or mime_type.startswith("application/json")
                ):
                    content = await self.read_file(qid, f)
                else:
                    image_data = await self.read_file(qid, f)
                    assert image_data
                    content = base64.b64encode(image_data.encode("utf-8")).decode(
                        "utf-8"
                    )
                data.append(
                    FileData(
                        filename=f,
                        content=content,
                        mime_type=mime_type or "application/octet-stream",
                    )
                )
            return data
        except Exception as e:
            raise ValueError(f"Failed to get filedata for question  {e}")

    async def get_question_file(self, qid: ID, filename: str):
        """
        Resolve the exact path/identifier for a stored file.
        """
        logger.debug("Resolving file '%s' for question_id=%s", filename, qid)
        question_path = await self.get_question_path(qid, relative=False)
        if question_path is None:
            raise ValueError("Could not get question path. Question path is None")

        # Direct images to client folder
        if await FileService().is_image(filename):
            filepath = Path(question_path) / self.client_path / filename
        else:
            filepath = Path(question_path) / filename
        return self.storage_manager.get_file_path(filepath)

    # Reading and writting and deleting files
    async def read_file(self, qid: ID, filename: str) -> str | None:
        """
        Read a file and return its text contents.
        """
        logger.debug("Reading file '%s' for question_id=%s", filename, qid)
        file = await self.get_question_file(qid, filename)
        raw_data = self.storage_manager.read_file(file)
        if raw_data:
            return raw_data.decode("utf-8")

    async def update_file(self, qid: ID, filename: str, content: str | dict) -> bool:
        """
        Overwrite an existing file for a question.
        """
        logger.debug("Updating file '%s' for question_id=%s", filename, qid)

        if isinstance(content, dict):
            content = json.dumps(content, indent=2)
        path = await self.get_question_path(qid)
        if path is None:
            raise ValueError("Could not update file,Question path is none")
        self.storage_manager.save_file(
            target=path, filename=filename, content=content, overwrite=True
        )
        return True

    def _norm_path(self, value: Union[str, Path, Blob]) -> str:
        """
        Delete a given file from storage.
        """
        logger.debug("Deleting file '%s' for question_id=%s", filename, qid)
        file = await self.get_question_file(qid, filename)
        self.storage_manager.delete_file(file)
        logger.info("Deleted file '%s' for question_id=%s", filename, qid)
        return True

    # helpers
    async def save_batch_files(
        self, target_dir: str | Path, files: List[FileData]
    ) -> List[str | Path]:
        return [
            self.storage_manager.save_file(
                target=target_dir, filename=f.filename, content=f.content
            )
            for f in files
        ]
