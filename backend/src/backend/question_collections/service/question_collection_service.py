from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Generic
from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import Session, select

from backend.access_policy import ProfileT
from backend.question import Question, QuestionNotFoundError
from backend.question_collections.exceptions import (
    QuestionAlreadyInCollectionError,
    QuestionCollectionDeleteError,
    QuestionCollectionNotFoundError,
    QuestionCollectionOperationError,
    QuestionCollectionValidationError,
)
from backend.question_collections.model import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.question_collections.schema import QuestionCollectionRead
from backend.shared import ID
from backend.utils import convert_uuid


class _UnsetType:
    pass


_UNSET = _UnsetType()


class QuestionCollectionService(Generic[ProfileT]):
    def __init__(self, session: Session) -> None:
        self._session = session

    async def create_collection(
        self, owner: ProfileT, title: str, parent: QuestionCollection | None = None
    ):
        owner_id = self._require_profile_id(owner)
        self._validate_parent(parent, owner_id)
        try:
            collection = QuestionCollection(
                title=title,
                owner_id=owner_id,
                parent=parent,
                parent_id=parent.id if parent else None,
            )
            self._session.add(collection)
            self._session.commit()
            self._session.refresh(collection)
            return collection
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("create", str(e)) from e

    async def delete_collection(
        self, owner: ProfileT, collection: QuestionCollection | ID
    ) -> bool :
        collection = self.get_collection(collection)
        owner_id = self._require_profile_id(owner)

        if not collection.owner_id == owner_id:
            raise QuestionCollectionDeleteError(
                collection_id=str(collection.id), owner_id=str(owner_id)
            )
        try:
            self._session.delete(collection)
            self._session.commit()
            return True
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("delete", str(e)) from e

    async def update_collection(
        self,
        owner: ProfileT,
        collection: QuestionCollection | ID,
        title: str | None = None,
        parent: QuestionCollection | None | _UnsetType = _UNSET,
    ) -> QuestionCollection:
        owner_id = self._require_profile_id(owner)
        collection = self.get_collection(collection)
        self._validate_collection_owner(collection, owner_id)

        if not isinstance(parent, _UnsetType):
            self._validate_parent(parent, owner_id)

            if parent and parent.id == collection.id:
                raise QuestionCollectionValidationError(
                    "Collection cannot be its own parent"
                )
        try:
            if title is not None:
                collection.title = title

            if not isinstance(parent, _UnsetType):
                collection.parent = parent
                collection.parent_id = parent.id if parent else None
            collection.updated_at = datetime.now(UTC)

            self._session.commit()
            self._session.refresh(collection)
            return collection
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("update", str(e)) from e

    async def add_question(
        self, collection: QuestionCollection | ID, question: Question | ID
    ) -> QuestionCollectionLink:
        collection = self.get_collection(collection)
        question = self.get_question(question)

        try:
            assert question.id
            assert collection.id
            link = QuestionCollectionLink(
                question_id=question.id, collection_id=collection.id
            )
            self._session.add(link)
            self._session.commit()
            self._session.refresh(link)

            # Update the collection
            collection.updated_at = datetime.now(UTC)
            self._session.commit()
            self._session.refresh(collection)
            return link

        except IntegrityError as e:
            self._session.rollback()
            raise QuestionAlreadyInCollectionError(
                collection_title=collection.title,
                question_title=question.title or str(question.id),
            ) from e
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("add question to", str(e)) from e

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

    def get_question(self, question: Question | ID) -> Question:
        if isinstance(question, Question):
            return question
        question = self._session.get(Question, question)
        if not question:
            raise QuestionNotFoundError(question_id=question)
        return question

    async def remove_question(
        self, collection: QuestionCollection | ID, question: Question | ID
    ) -> bool | None:
        collection = self.get_collection(collection)
        question = self.get_question(question)
        try:
            link = self._session.get(
                QuestionCollectionLink,
                (
                    question.id,
                    collection.id,
                ),
            )
            if link is None:
                raise QuestionCollectionNotFoundError(
                    f"{collection.id}/questions/{question.id}"
                )

            self._session.delete(link)
            self._session.commit()

            collection.updated_at = datetime.now(UTC)
            self._session.commit()
            self._session.refresh(collection)
            return True
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError(
                "remove question from",
                str(e),
            ) from e

    async def get_all_questions(
        self, collection: QuestionCollection | ID
    ) -> Sequence[Question]:
        collection = self.get_collection(collection)

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
            raise QuestionCollectionOperationError(
                "retrieve questions from",
                str(e),
            ) from e

    async def get_collection_detail_read(
        self, collection: QuestionCollection | ID
    ) -> QuestionCollectionRead:
        collection = self.get_collection(collection)
        questions = await self.get_all_questions(collection)
        question_ids = [q.id for q in questions if q.id is not None]
        return QuestionCollectionRead.from_collection(
            collection=collection,
            question_ids=question_ids,
        )

    #  Searching

    async def search_collections(
        self,
        owner: ProfileT,
        *,
        collection_id: ID | None = None,
        title: str | None = None,
        offset: int | None = None,
        limit: int | None = 10,
    ) -> Sequence[QuestionCollection]:
        owner_id = self._require_profile_id(owner)
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

            return self._session.exec(stmt).all()

        except SQLAlchemyError as e:
            raise QuestionCollectionOperationError("retrieve", str(e)) from e

    def get_collection_by_owner(
        self,
        owner: ProfileT,
        collection_id: ID,
    ) -> QuestionCollection | None:
        owner_id = self._require_profile_id(owner)

        try:
            stmt = select(QuestionCollection).where(
                QuestionCollection.id == convert_uuid(collection_id),
                QuestionCollection.owner_id == owner_id,
            )
            return self._session.exec(stmt).first()
        except SQLAlchemyError as e:
            raise QuestionCollectionOperationError("retrieve", str(e)) from e

    def list_collections_by_owner(
        self,
        owner: ProfileT,
        offset: int | None = None,
        limit: int | None = 10,
    ) -> Sequence[QuestionCollection]:
        try:
            owner_id = self._require_profile_id(owner)
            stmt = (
                select(QuestionCollection)
                .where(
                    QuestionCollection.owner_id == owner_id,
                )
                .order_by(QuestionCollection.created_at.desc())  # type: ignore[attr-defined]
                .offset(offset)
                .limit(limit)
            )
            return self._session.exec(stmt).all()
        except SQLAlchemyError as e:
            raise QuestionCollectionOperationError("retrieve", str(e)) from e

    def reconstruct_path(self, collection: QuestionCollection) -> str:
        parts: list[str] = []
        current: QuestionCollection | None = collection

        while current is not None:
            parts.append(current.title)
            if current.parent_id is None:
                break
            current = self.get_collection(current.parent_id)

        return "->".join(reversed(parts))

    @staticmethod
    def _require_profile_id(profile: ProfileT) -> UUID:
        if profile.id is None:
            raise QuestionCollectionValidationError("Profile must be persisted")
        return profile.id

    @staticmethod
    def _validate_parent(
        parent: QuestionCollection | None,
        owner_id: UUID,
    ) -> None:
        if parent is None:
            return

        if parent.id is None:
            raise QuestionCollectionValidationError(
                "Parent collection must be persisted"
            )

        if parent.owner_id != owner_id:
            raise QuestionCollectionValidationError(
                "Parent collection does not belong to this developer"
            )

    @staticmethod
    def _validate_collection_owner(
        collection: QuestionCollection,
        owner_id: UUID,
    ) -> None:
        if collection.owner_id != owner_id:
            raise QuestionCollectionValidationError(
                "Collection does not belong to this developer"
            )
