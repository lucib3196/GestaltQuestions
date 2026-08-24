from collections.abc import Sequence
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.developer.exceptions import DeveloperAccessDenied
from backend.question import Question
from backend.question.collections import (
    QuestionAlreadyInCollectionError,
    QuestionCollection,
    QuestionCollectionError,
    QuestionCollectionLink,
    QuestionCollectionNotFoundError,
)
from backend.question.collections.schema import QuestionCollectionRead
from backend.shared import ID

from .dependencies import DevCollectionManager

router = APIRouter(
    prefix="/collections",
    tags=["Collections"],
)


class CreateCollectionPayload(BaseModel):
    title: str
    parent_id: str | UUID | None = None


class UpdateCollectionPayload(BaseModel):
    title: str | None = None
    parent_id: str | UUID | None = None


class CollectionQuestionPayload(BaseModel):
    question_id: str | UUID


@router.post(
    "/",
    response_model=QuestionCollection,
    status_code=status.HTTP_201_CREATED,
)
async def create_collection(
    current_user: CurrentUser,
    collections: DevCollectionManager,
    payload: CreateCollectionPayload,
) -> QuestionCollection:
    try:
        return await collections.create_collection(
            current_user,
            title=payload.title,
        )
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
)
async def get_collections(
    current_user: CurrentUser,
    collections: DevCollectionManager,
    offset: int | None = None,
    limit: int | None = 10,
) -> Sequence[QuestionCollection] | Sequence[QuestionCollectionRead]:
    try:
        return await collections.list_collections_from_owner(
            current_user, offset, limit
        )
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get(
    "/search",
    response_model=list[QuestionCollectionRead],
    status_code=status.HTTP_200_OK,
)
async def search_collections(
    current_user: CurrentUser,
    collections: DevCollectionManager,
    collection_id: ID | None = None,
    title: str | None = None,
    offset: int | None = None,
    limit: int | None = 10,
) -> Sequence[QuestionCollectionRead] | Sequence[QuestionCollection]:
    try:
        return await collections.search_collections(
            current_user,
            collection_id=collection_id,
            title=title,
            offset=offset,
            limit=limit,
        )
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get("/{collection_id}", response_model=QuestionCollection)
async def get_collection(
    collection_id: ID,
    current_user: CurrentUser,
    collections: DevCollectionManager,
) -> QuestionCollection:
    try:
        return await collections.get_collection(current_user, collection_id)
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.patch("/{collection_id}", response_model=QuestionCollection)
async def update_collection(
    collection_id: ID,
    current_user: CurrentUser,
    collections: DevCollectionManager,
    payload: UpdateCollectionPayload,
) -> QuestionCollection:
    try:
        return await collections.update_collection(
            current_user,
            collection_id,
            title=payload.title,
            parent_id=payload.parent_id,
        )
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete("/{collection_id}", response_model=bool)
async def delete_collection(
    collection_id: ID,
    current_user: CurrentUser,
    collections: DevCollectionManager,
) -> bool:
    try:
        return await collections.delete_collection(current_user, collection_id)
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.post(
    "/{collection_id}/questions",
    response_model=QuestionCollectionLink,
    status_code=status.HTTP_201_CREATED,
)
async def add_question_to_collection(
    collection_id: ID,
    current_user: CurrentUser,
    collections: DevCollectionManager,
    payload: CollectionQuestionPayload,
) -> QuestionCollectionLink:
    try:
        return await collections.add_question(
            current_user,
            collection_id,
            payload.question_id,
        )
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except QuestionAlreadyInCollectionError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get(
    "/{collection_id}/questions",
    response_model=list[Question],
)
async def get_collection_questions(
    collection_id: ID,
    current_user: CurrentUser,
    collections: DevCollectionManager,
) -> Sequence[Question]:
    try:
        return await collections.get_questions_in_collection(
            current_user, collection_id
        )
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete("/{collection_id}/questions/{question_id}", response_model=bool)
async def remove_question_from_collection(
    collection_id: ID,
    question_id: ID,
    current_user: CurrentUser,
    collections: DevCollectionManager,
) -> bool | None:
    try:
        return await collections.remove_question(
            current_user,
            collection_id,
            question_id,
        )
    except DeveloperAccessDenied as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except QuestionCollectionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
