import asyncio
from collections.abc import Sequence

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.question import (
    Question,
    QuestionCreate,
    QuestionFilter,
    QuestionRead,
    QuestionUpdate,
)
from backend.shared import ID
from backend.storage import FileData, UploadFileDataConverter

from .dependencies import DevQManager

router = APIRouter(
    prefix="/questions",
    tags=["Questions"],
)


class WriteFilePayload(BaseModel):
    content: str


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_question(
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
    payload: QuestionCreate,
) -> Question:
    try:
        return await dev_q_manager.create_question(current_user, payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create question: {e}",
        ) from e


@router.post("/filter")
async def filter(
    current_user: CurrentUser,
    filter: QuestionFilter,
    dev_q_manager: DevQManager,
) -> Sequence[QuestionRead]:
    try:
        return await dev_q_manager.filter_questions(current_user, filter)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete question file: {e}",
        ) from e


@router.get("/{question_id}")
async def get_question(
    question_id: ID,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
) -> QuestionRead | Question:
    try:
        return await dev_q_manager.get_question(
            current_user, question_id, method="full"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to get question: {e}",
        ) from e


@router.patch("/{question_id}")
async def update_question(
    question_id: ID,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
    update: QuestionUpdate,
) -> QuestionRead:
    try:
        return await dev_q_manager.update_question(current_user, question_id, update)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update question: {e}",
        ) from e


@router.delete("/{question_id}")
async def delete_question(
    question_id: ID,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
) -> bool:
    try:
        return await dev_q_manager.delete_question(current_user, question_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete question: {e}",
        ) from e


@router.post("/{question_id}/copy")
async def copy_question(
    question_id: ID,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
):
    try:
        return await dev_q_manager.copy_question(question_id, current_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}"
        ) from e






@router.get("/{question_id}/files")
async def get_question_files(
    question_id: ID,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
) -> Sequence[str]:
    try:
        return await dev_q_manager.get_question_files(current_user, question_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to list question files: {e}",
        ) from e


@router.get("/{question_id}/filedata")
async def get_question_filedata(
    question_id: ID,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
) -> Sequence[FileData]:
    try:
        return await dev_q_manager.get_question_filedata(current_user, question_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to list question files: {e}",
        ) from e


@router.post("/{question_id}/files", status_code=status.HTTP_201_CREATED)
async def upload_files(
    question_id: ID,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
    files: list[UploadFile],
) -> list[str]:
    try:
        converter = UploadFileDataConverter()
        file_data = await asyncio.gather(
            *[converter.convert_to_filedata(file) for file in files]
        )
        return await dev_q_manager.upload_files(current_user, question_id, file_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload question files: {e}",
        ) from e


@router.get("/{question_id}/files/{filename}")
async def read_file(
    question_id: ID,
    filename: str,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
) -> bytes | None:
    try:
        return await dev_q_manager.read_file(current_user, question_id, filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to read question file: {e}",
        ) from e


@router.put("/{question_id}/files/{filename}")
async def write_file(
    question_id: ID,
    filename: str,
    data: WriteFilePayload,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
):
    try:
        return await dev_q_manager.write_file(
            current_user, question_id, filename, data.content
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to write question file: {e}",
        ) from e


@router.delete("/{question_id}/files/{filename}")
async def delete_file(
    question_id: ID,
    filename: str,
    current_user: CurrentUser,
    dev_q_manager: DevQManager,
):
    try:
        return await dev_q_manager.delete_file(current_user, question_id, filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete question file: {e}",
        ) from e
