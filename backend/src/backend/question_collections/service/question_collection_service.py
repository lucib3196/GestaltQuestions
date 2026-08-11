from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Generic
from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import Session, select

from backend.access_policy import ProfileT
from backend.question import Question
from backend.question_collections.exceptions import (
    QuestionAlreadyInCollectionError,
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


class QuestionCollectionService(Generic[ProfileT]):
    def __init__(self, session: Session) -> None:
        self._session = session

    async def create_collection(
        self,
        owner: ProfileT,
        title: str,
        parent: QuestionCollection | None = None,
    ) -> QuestionCollection:
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
        self,
        owner: ProfileT,
        collection_id: ID,
    ) -> bool:
        collection = self.get_collection_by_owner(owner, collection_id)
        if collection is None:
            raise QuestionCollectionNotFoundError(str(collection_id))

        try:
            self._session.delete(collection)
            self._session.commit()
            return True
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("delete", str(e)) from e

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

    async def update_collection(
        self,
        owner: ProfileT,
        collection_id: ID,
        title: str | None = None,
        parent: QuestionCollection | None = None,
    ) -> QuestionCollection:
        owner_id = self._require_profile_id(owner)
        collection = self.get_collection_by_owner(owner, collection_id)
        if collection is None:
            raise QuestionCollectionNotFoundError(str(collection_id))

        self._validate_parent(parent, owner_id)
        if parent and parent.id == collection.id:
            raise QuestionCollectionValidationError(
                "Collection cannot be its own parent"
            )

        try:
            if title is not None:
                collection.title = title

            collection.parent = parent
            collection.parent_id = parent.id if parent else None
            collection.updated_at = datetime.now(UTC)

            self._session.add(collection)
            self._session.commit()
            self._session.refresh(collection)
            return collection
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("update", str(e)) from e

    def get_collection(self, collection_id: ID) -> QuestionCollection | None:
        return self._session.get(QuestionCollection, convert_uuid(collection_id))

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

    async def add_question(
        self,
        collection_id: ID,
        question_id: ID,
    ) -> QuestionCollectionLink:
        collection = self.get_collection(collection_id)
        if collection is None or collection.id is None:
            raise QuestionCollectionNotFoundError(str(collection_id))

        try:
            link = QuestionCollectionLink(
                question_id=convert_uuid(question_id),
                collection_id=convert_uuid(collection_id),
            )
            self._session.add(link)
            self._session.commit()
            self._session.refresh(link)
            return link
        except IntegrityError as e:
            self._session.rollback()
            raise QuestionAlreadyInCollectionError() from e
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("add question to", str(e)) from e

    async def get_all_questions(self, collection_id: ID) -> Sequence[Question]:
        collection = self.get_collection(collection_id)
        if collection is None or collection.id is None:
            raise QuestionCollectionNotFoundError(str(collection_id))

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

    async def remove_question(
        self,
        collection_id: ID,
        question_id: ID,
    ) -> bool:
        try:
            link = self._session.get(
                QuestionCollectionLink,
                (
                    convert_uuid(question_id),
                    convert_uuid(collection_id),
                ),
            )
            if link is None:
                raise QuestionCollectionNotFoundError(
                    f"{collection_id}/questions/{question_id}"
                )

            self._session.delete(link)
            self._session.commit()
            return True
        except QuestionCollectionNotFoundError:
            raise
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError(
                "remove question from",
                str(e),
            ) from e

    async def get_collection_read(
        self,
        collection_id: UUID | str,
    ) -> QuestionCollectionRead | None:
        collection = self.get_collection(collection_id)
        if collection is None:
            return None

        questions = await self.get_all_questions(collection.id)
        question_ids = [q.id for q in questions if q.id is not None]

        return QuestionCollectionRead(
            id=collection.id,  # type: ignore
            owner_id=collection.owner_id,  # type: ignore
            title=collection.title,
            parent_id=collection.parent_id,
            created_at=collection.created_at,
            updated_at=collection.updated_at,
            question_ids=question_ids,
        )

    def reconstruct_path(self, collection: QuestionCollection) -> str:
        parts: list[str] = []
        current: QuestionCollection | None = collection

        while current is not None:
            parts.append(current.title)
            if current.parent_id is None:
                break
            current = self.get_collection(current.parent_id)

        return "->".join(reversed(parts))

    def _validate_parent(
        self,
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

    def _require_profile_id(self, profile: ProfileT) -> UUID:
        if profile.id is None:
            raise QuestionCollectionValidationError("Profile must be persisted")
        return profile.id
