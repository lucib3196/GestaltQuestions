import asyncio
import json
import mimetypes
from pathlib import Path
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import ValidationError
from starlette import status


from src.core import logger
from src.web.dependencies import StorageTypeDep
from src.types import FileData, SuccessDataResponse, Response, QuestionData
from src.model.question import Question
from src.service import FileService
from src.web.dependencies import StorageDependency, QuestionManagerDependency
from src.utils import encode_image

router = APIRouter(
    prefix="/questions",
    tags=["questions", "files"],
)

CLIENT_FILE_DIR = "clientFiles"


def get_file(files: list[UploadFile], name: str) -> UploadFile | None:
    for f in files:
        if f.filename == name:
            return f
    return None


# Create question with a payload
@router.post("/files")
async def create_question_file_upload(
    qr: QuestionManagerDependency,
    files: List[UploadFile],
    question_data: Optional[str] = Form(None),
    auto_handle_images: bool = True,
) -> Question:

    # Check payload first
    if not question_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Question data is None"
        )
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Files data is None"
        )

    # Try to validate the model
    try:
        if isinstance(question_data, str):
            question_data = json.loads(question_data)
        qdata = QuestionData.model_validate(question_data)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to validate the question data {e}",
        )
    # Try to convert the question files

    try:
        fm = FileService()
        tasks = [fm.convert_to_filedata(f) for f in (files or [])]
        fdata = await asyncio.gather(*tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert the files {e}")

    # Finally create the question
    try:
        qcreated = await qr.create_question(qdata, fdata, auto_handle_images)
        return qcreated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create question {e} from uploaded files"
        )


# --------------------------
# ---------Retrieving--------
# --------------------------


@router.get("/files/{qid}")
async def get_question_file_names(
    qid: str | UUID,
    qr: QuestionManagerDependency,
) -> List[str]:
    try:
        return await qr.get_question_file_names(qid)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not retrieve file names: {e}",
        )


@router.get("/filedata/{qid}")
async def get_filedata(
    qid: str | UUID,
    qm: QuestionManagerDependency,
    storage: StorageDependency,
    STORAGE_TYPE: StorageTypeDep,
) -> List[FileData]:
    try:
        file_paths = [Path(f) for f in await qm.get_question_filepaths(qid)]
        file_data = []
        for f in file_paths:
            if not f.is_file():
                continue
            try:
                mime_type, _ = mimetypes.guess_type(f.name)
                if mime_type and (
                    mime_type.startswith("text")
                    or mime_type.startswith("application/json")
                ):
                    content = f.read_text(encoding="utf-8")
                else:
                    content = encode_image(f)
                    logger.debug("Encoded image just fine")

                file_data.append(
                    FileData(
                        filename=f.name,
                        content=content,
                        mime_type=mime_type or "application/octet-stream",
                    )
                )
            except Exception as e:
                logger.warning(f"Could not read file {f}: {e}")
                file_data.append(
                    FileData(filename=f.name, content="Could not read file")
                )

        return file_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not get file data {e}")


@router.delete("/files/{qid}/{filename}")
async def delete_file(qid: str | UUID, filename: str, qr: QuestionManagerDependency):
    try:
        return await qr.delete_file(qid, filename)
    except HTTPException:
        raise


@router.get("/files/{qid}/{filename}")
async def read_question_file(
    qid: str | UUID, filename: str, qr: QuestionManagerDependency
) -> str | None:

    try:
        return await qr.read_file(qid, filename)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read file {filename}: {e}",
        )


# Update
@router.put("/files/{qid}/{filename}")
async def update_file(
    qid: str | UUID,
    filename: str,
    new_content: str | dict,
    qr: QuestionManagerDependency,
) -> SuccessDataResponse:
    try:
        return await qr.update_file(qid, filename, new_content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not write file content: {e}",
        )


@router.post("/{id}/upload_files")
async def upload_files_to_question(
    id: str | UUID,
    files: list[UploadFile],
    qr: QuestionManagerDependency,
    auto_handle_images: bool = True,
) -> dict:
    """
    Upload and attach additional files to an existing question.

    This endpoint allows clients to upload new files—such as HTML files, scripts,
    metadata, or images—to an already-existing question. All uploaded files are
    converted into internal `FileData` objects and saved to the appropriate storage
    location (local or cloud) via `QuestionManager`.

    When `auto_handle_images` is enabled, image-like or client-facing assets
    (e.g., `.png`, `.jpg`, `.jpeg`, `.pdf`) are automatically routed into a
    dedicated `clientFiles` directory within the question's storage path.
    All other files are stored directly in the question's root folder.

    Args:
        id: The unique identifier of the question to attach files to.
        files: A list of `UploadFile` objects received from the client.
        fm: FileService dependency used to convert `UploadFile` → `FileData`.
        qr: QuestionResource service responsible for saving files to storage.
        auto_handle_images: Whether to automatically separate client-facing image
            and document files into the `clientFiles` directory. Defaults to True.

    Returns:
        dict: A response structure containing upload details, such as file paths
            and counts of uploaded files.

    Raises:
        HTTPException(404): If the target question does not exist.
        HTTPException(500): For unexpected failures during file processing
            or storage operations.
    """
    try:
        tasks = [FileService().convert_to_filedata(f) for f in (files or [])]
        fdata = await asyncio.gather(*tasks)
        return await qr.upload_files_to_question(id, fdata, auto_handle_images)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error uploading files for question %s: %s", id, e)
        raise HTTPException(
            status_code=500,
            detail=f"Could not process file uploads: {e}",
        )


@router.post("/files/{qid}/download")
async def download_question(
    qid: str | UUID,
    qr: QuestionManagerDependency,
):
    try:
        question = qr.qm.get_question(qid)
        data = await qr.get_question_filepaths(qid)
        folder_name = f"{question.title}_download"

        zip_bytes = await FileService().download_zip(
            files=[Path(f) for f in data.filenames], folder_name=folder_name
        )

        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{folder_name}.zip"'
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not get files {e}",
        )


@router.post("/files/{qid}/{filename}/download")
async def download_question_file(
    qid: str | UUID,
    filename: str,
    qm: QuestionManagerDependency,
    qr: QuestionManagerDependency,
):
    try:
        question = qm.get_question(qid)
        folder_name = f"{question.title}_download"
        file_path = await qr.get_question_file(qid, filename)

        zip_bytes = await FileService().download_zip(
            files=[file_path], folder_name=folder_name
        )

        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={folder_name}.zip"},
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read file {filename}: {e}",
        )


@router.post("/upload_zip")
async def upload_zip(file: UploadFile, storage: StorageDependency):
    save_path = storage.get_base_path()
    return await FileService().upload_zip_and_extract(file, save_path)
