import asyncio
from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.question.collections.exceptions import (
    QuestionCollectionNotFoundError,
    QuestionCollectionOperationError,
)
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionBookmark,
    Status,
)
from backend.question.collections.schema import QuestionCollectionRead
from backend.question.collections.services.question_collection_reader import (
    QuestionCollectionReader,
)


class CollectionBookmarkService:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._collections = QuestionCollectionReader(session)

    async def list_bookmarks(
        self, user_id: UUID
    ) -> Sequence[QuestionCollectionRead]:
        try:
            stmt = (
                select(QuestionCollection)
                .join(
                    QuestionCollectionBookmark,
                    QuestionCollectionBookmark.collection_id
                    == QuestionCollection.id,
                )
                .where(
                    QuestionCollectionBookmark.user_id == user_id,
                    QuestionCollection.status == Status.PUBLISHED,
                )
                .order_by(QuestionCollectionBookmark.created_at.desc())
            )
            collections = self._session.exec(stmt).all()
            return await asyncio.gather(
                *[
                    self._collections.get_collection_detail_read(collection)
                    for collection in collections
                ]
            )
        except SQLAlchemyError as e:
            raise QuestionCollectionOperationError("retrieve bookmarks", str(e)) from e

    async def add_bookmark(
        self, user_id: UUID, collection_id: UUID
    ) -> bool:
        collection = self._session.get(QuestionCollection, collection_id)
        if collection is None or collection.status != Status.PUBLISHED:
            raise QuestionCollectionNotFoundError(str(collection_id))

        bookmark_id = (user_id, collection_id)
        if self._session.get(QuestionCollectionBookmark, bookmark_id) is not None:
            return True

        try:
            self._session.add(
                QuestionCollectionBookmark(
                    user_id=user_id,
                    collection_id=collection_id,
                )
            )
            self._session.commit()
            return True
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("bookmark", str(e)) from e

    async def remove_bookmark(
        self, user_id: UUID, collection_id: UUID
    ) -> bool:
        bookmark = self._session.get(
            QuestionCollectionBookmark, (user_id, collection_id)
        )
        if bookmark is None:
            return True

        try:
            self._session.delete(bookmark)
            self._session.commit()
            return True
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("remove bookmark", str(e)) from e
