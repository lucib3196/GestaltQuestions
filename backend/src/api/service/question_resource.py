from functools import lru_cache
from typing import Annotated, Dict, List, Optional
from pathlib import Path
from uuid import UUID

# --- Third-Party ---
from fastapi import Depends, HTTPException
from starlette import status

# --- Internal ---
from src.api.core import logger
from src.api.dependencies import StorageType, StorageTypeDep
from src.api.models import QuestionData
from src.api.models.models import Question
from src.api.models.response_models import FileData
from src.api.service.question_manager import QuestionManager, QuestionManagerDependency
from src.api.service.storage_manager import StorageDependency, StorageService
from src.utils import safe_dir_name
from src.api.models.response_models import FileData, SuccessFileResponse

client_file_extensions = {
    ".png",
    ".jpg",
    ".jpeg",
    ".pdf",
}


class QuestionResourceService:
    """Service that coordinates storage and database operations for questions."""

    def __init__(
        self,
        qm: QuestionManager,
        storage_manager: StorageService,
        storage_type: StorageType,
        image_location="clientFiles",
    ):
        """_summary_

        Args:
            qm (QuestionManager): Manages database interactions for creating and committing the question.
            storage_manager (StorageService):  Handles file system or cloud storage initialization for the question.
            storage_type (StorageType): Wether we are working with the cloud or local storage
        """
        self.qm = qm
        self.storage_manager = storage_manager
        self.storage_type = storage_type
        self.client_path = image_location

    async def create_question(
        self,
        question_data: QuestionData | dict,
        files: Optional[List[FileData]] = None,
        handle_images: bool = True,
    ) -> Question:
        """Create a question and optionally save associated files.

            This function performs three main operations:
            1. Creates a new `Question` entry in the database via the `QuestionManagerDependency`.
            2. Generates a sanitized directory name for the question based on its title and ID.
            3. Initializes the appropriate storage path (local or cloud) and updates the database record
            with the correct relative path reference.
        args:
        question (QuestionData): Input data model containing details of the question to be created.
        Returns:
            Question: The created `Question` SQLModel instance with updated storage path information.
        Raises:
            Exception: Propagates any error encountered during creation or storage initialization.
        """
         # --- Step 0: Validate input ---
        question_data = QuestionData.model_validate(question_data,)
        logger.info(f"[QuestionResourceService] Creating '{question_data.title}'")

        # --- Step 1: Create DB record ---
        qcreated = await self.qm.create_question(question_data)
        logger.debug(f"[QuestionResourceService] DB entry created (ID={qcreated.id})")

        # --- Step 2: Build folder name ---
        path_name = safe_dir_name(f"{qcreated.title}_{str(qcreated.id)[:8]}")

        # StorageManager creates actual folder and returns the path string or Path
        path = self.storage_manager.create_storage_path(path_name)

        # --- Step 3: Derive relative + absolute paths ---
        relative_path = self.storage_manager.get_storage_path(path, relative=True)
        absolute_path = self.storage_manager.get_storage_path(path, relative=False)

        logger.info(
            f"[QuestionResourceService] Paths ready — relative='{relative_path}', absolute='{absolute_path}'"
        )

        # --- Step 4: Always store relative path in the DB ---
        self.qm.set_question_path(qcreated.id, relative_path, self.storage_type)  # type: ignore
        self.qm.session.commit()

        logger.info(
            f"[QuestionResourceService] Stored relative path '{relative_path}' in DB for question {qcreated.id}"
        )

        # --- Step 5: Save files using absolute filesystem path ---
        await self.handle_question_files(files or [], absolute_path, handle_images)

        logger.info(
            f"[QuestionResourceService] Files saved successfully for '{qcreated.title}'"
        )

        return qcreated

    async def upload_files_to_question(
        self,
        question_id: str | UUID,
        files: List[FileData],
        auto_handle_images: bool = True,
    ) -> Dict:
        question = self.qm.get_question(question_id)
        if not question:
            logger.warning("Question with ID %s not found", id)
            raise HTTPException(status_code=404, detail=f"Question {id} not found")
        path = self.qm.get_question_path(question_id, self.storage_type)  # type: ignore
        # Get the absolute path
        abs_path = self.storage_manager.get_storage_path(path, relative=False)
        logger.info("Resolved question storage path: %s", abs_path)
        return await self.handle_question_files(files, abs_path, auto_handle_images)

    async def handle_question_files(
        self,
        files: List[FileData],
        storage_path: str | Path,
        auto_handle_images: bool = True,
    ) -> Dict:

        storage_path = Path(storage_path)
        client_files_dir = storage_path / self.client_path

        # Split files into client (images/docs) vs others
        client_files = []
        other_files = []

        for f in files:
            if not f.filename:
                raise HTTPException(
                    status_code=status.HTTP_406_NOT_ACCEPTABLE,
                    detail="File must have a filename",
                )

            ext = Path(f.filename).suffix.lower()
            (client_files if ext in client_file_extensions else other_files).append(f)

        # Helper to write a batch of files
        def save_batch(target_dir: Path, batch: List[FileData]):
            return [
                self.storage_manager.save_file(
                    target_dir, f.filename, content=f.content
                )
                for f in batch
            ]

        # Auto mode → split outputs
        if auto_handle_images:
            uploaded_client = save_batch(client_files_dir, client_files)
            uploaded_other = save_batch(storage_path, other_files)

            return {
                "status": "ok",
                "detail": f"Uploaded {len(files)} files",
                "client_files": uploaded_client,
                "other_files": uploaded_other,
            }

        # Non-auto → all go to same folder
        uploaded_all = save_batch(storage_path, files)

        return {
            "status": "ok",
            "detail": f"Uploaded {len(files)} files",
            "files": uploaded_all,
        }

    async def get_question_files(self, question_id: str | UUID):
        question_path = self.qm.get_question_path(question_id, self.storage_type)  # type: ignore
        assert question_path
        print("This is the question path to get the files from", question_path)
        files = self.storage_manager.list_files(question_path)
        return SuccessFileResponse(
            status=200, detail="Retrieved files ok", filenames=files
        )
        
    async def get_question_file(self,question_id: str|UUID, filename: str):
        question_path = self.qm.get_question_path(question_id, self.storage_type)  # type: ignore
        assert question_path
        file = self.storage_manager.get_file(question_path,filename)
        return file
        
        
    async def delete_file(self, filename:str):
        pass
        


@lru_cache
def get_question_resource(
    qm: QuestionManagerDependency,
    storage: StorageDependency,
    storage_type: StorageTypeDep,
):
    return QuestionResourceService(qm, storage, storage_type)


QuestionResourceDepencency = Annotated[
    QuestionResourceService, Depends(get_question_resource)
]
