import asyncio
from collections.abc import Sequence
from typing import Generic, Literal

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.authorization import ProfileT
from backend.question import Question
from backend.question.collections.exceptions import (
    QuestionCollectionNotFoundError,
    QuestionCollectionOperationError,
)
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.question.collections.schema import QuestionCollectionRead
from backend.shared import ID
from backend.utils import convert_uuid

from .utils import require_profile_id


class QuestionCollectionReader(Generic[ProfileT]):
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_collection(self, collection: QuestionCollection | ID) -> QuestionCollection:
        collection_id = (
            collection.id if isinstance(collection, QuestionCollection) else collection
        )

        if collection_id is None:
            raise QuestionCollectionNotFoundError()

        db_collection = self._session.get(
            QuestionCollection,
            convert_uuid(collection_id),
        )

        if db_collection is None:
            raise QuestionCollectionNotFoundError(str(collection_id))

        return db_collection

    async def get_collection_detail_read(
        self, collection: QuestionCollection | ID
    ) -> QuestionCollectionRead:
        collection = self.get_collection(collection)
        questions = self.get_questions_in_collection(collection)
        question_ids = [q.id for q in questions if q.id is not None]
        return QuestionCollectionRead.from_collection(
            collection=collection,
            question_ids=question_ids,
        )

    def get_collections_containing_question(
        self, question: Question
    ) -> Sequence[QuestionCollection]:
        try:
            stmt = (
                select(QuestionCollection)
                .join(
                    QuestionCollectionLink,
                    QuestionCollectionLink.collection_id == QuestionCollection.id,  # type: ignore
                )
                .where(QuestionCollectionLink.question_id == question.id)
            )
            return self._session.exec(stmt).all()
        except SQLAlchemyError as e:
            raise Exception(f"Failed to fetch {e}") from e

    def get_questions_in_collection(
        self, collection: QuestionCollection
    ) -> Sequence[Question]:
        try:
            stmt = (
                select(Question)
                .join(
                    QuestionCollectionLink,
                    QuestionCollectionLink.question_id == Question.id,  # type: ignore
                )
                .where(QuestionCollectionLink.collection_id == collection.id)
            )
            return self._session.exec(stmt).all()
        except SQLAlchemyError as e:
            raise Exception(f"Failed to fetch {e}") from e

    def get_collection_by_owner(
        self,
        owner: ProfileT,
        collection_id: ID,
    ) -> QuestionCollection | None:
        owner_id = require_profile_id(owner)
        try:
            stmt = select(QuestionCollection).where(
                QuestionCollection.id == convert_uuid(collection_id),
                QuestionCollection.owner_id == owner_id,
            )
            return self._session.exec(stmt).first()
        except SQLAlchemyError as e:
            raise QuestionCollectionOperationError("retrieve", str(e)) from e

    async def list_collections_by_owner(
        self,
        owner: ProfileT,
        offset: int | None = None,
        limit: int | None = 10,
        method: Literal["default", "detail-read"] = "default",
    ) -> Sequence[QuestionCollection] | Sequence[QuestionCollectionRead]:
        try:
            owner_id = require_profile_id(owner)
            stmt = (
                select(QuestionCollection)
                .where(
                    QuestionCollection.owner_id == owner_id,
                )
                .order_by(QuestionCollection.created_at.desc())  # type: ignore[attr-defined]
                .offset(offset)
                .limit(limit)
            )
            collections = self._session.exec(stmt).all()
            if method == "default":
                return collections
            return await asyncio.gather(
                *[self.get_collection_detail_read(c) for c in collections]
            )

        except SQLAlchemyError as e:
            raise QuestionCollectionOperationError("retrieve", str(e)) from e

    async def search_collections_from_owner(
        self,
        owner: ProfileT,
        *,
        collection_id: ID | None = None,
        title: str | None = None,
        offset: int | None = None,
        limit: int | None = 10,
        method: Literal["default", "detail-read"] = "default",
    ) -> Sequence[QuestionCollection] | Sequence[QuestionCollectionRead]:
        owner_id = require_profile_id(owner)
        try:
            stmt = select(QuestionCollection).where(
                QuestionCollection.owner_id == owner_id,
            )

            if collection_id is not None:
                stmt = stmt.where(
                    QuestionCollection.id == convert_uuid(collection_id),
                )

            if title:
                stmt = stmt.where(
                    QuestionCollection.title.ilike(f"%{title}%")  # type: ignore[attr-defined]
                )

            stmt = stmt.order_by(
                QuestionCollection.created_at.desc()  # type: ignore[attr-defined]
            )

            if offset is not None:
                stmt = stmt.offset(offset)

            if limit is not None:
                stmt = stmt.limit(limit)

            collections = self._session.exec(stmt).all()
            if method == "default":
                return collections
            return await asyncio.gather(
                *[self.get_collection_detail_read(c) for c in collections]
            )

        except SQLAlchemyError as e:
            raise QuestionCollectionOperationError("retrieve", str(e)) from e


if __name__ == "__main__":
    from sqlmodel import Session

    from backend.database.config import engine

    with Session(engine) as session:
        q1 = Question(title="Title")
        q2 = Question(title="Title2")
        session.add(q1)
        session.add(q2)

        collection = QuestionCollection(title="MyCollection")
        session.add(collection)
        collection2 = QuestionCollection(title="MyCollection2")
        session.add(collection2)
        # Push parent rows into the transaction without committing.
        session.flush()
        session.add(
            QuestionCollectionLink(collection_id=collection.id, question_id=q1.id)  # type: ignore
        )
        session.add(
            QuestionCollectionLink(collection_id=collection2.id, question_id=q1.id)  # type: ignore
        )
        session.flush()

        reader = QuestionCollectionReader(session)
        results = reader.get_collections_containing_question(q1)
        print("Query Results", results)
        print("Results length", len(results))

        results = reader.get_questions_in_collection(collection)
        print("Query Results", results)
        print("Results length", len(results))

        session.rollback()
