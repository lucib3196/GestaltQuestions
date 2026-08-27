from datetime import UTC, datetime
from typing import Generic
from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import Session

from backend.authorization import AccessLevel, ProfileT
from backend.core import logger
from backend.question import Question, QuestionNotFound
from backend.question.collections.exceptions import (
    QuestionAlreadyInCollectionError,
    QuestionCollectionDeleteError,
    QuestionCollectionNotFoundError,
    QuestionCollectionOperationError,
    QuestionCollectionValidationError,
)
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionAccess,
    QuestionCollectionLink,
)
from backend.question.collections.services import QuestionCollectionReader
from backend.shared import ID


class _UnsetType:
    pass


_UNSET = _UnsetType()


class QuestionCollectionService(
    QuestionCollectionReader[ProfileT],
    Generic[ProfileT],
):
    def __init__(self, session: Session) -> None:
        super().__init__(session)
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
            await self.assign_owner(owner, collection)
            return collection
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("create", str(e)) from e

    async def assign_owner(
        self, owner: ProfileT, collection: QuestionCollection
    ) -> QuestionCollectionAccess:
        try:
            assert collection.id
            access = QuestionCollectionAccess(
                collection_id=collection.id,
                developer_id=owner.id,
                granted_by_id=None,
                access_level=AccessLevel.OWNER,
            )
            self._session.add(access)
            self._session.commit()
            self._session.refresh(access)
            logger.debug("Added access okay to collection {access}")
            return access
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionCollectionOperationError("create", str(e)) from e

    async def delete_collection(
        self, owner: ProfileT, collection: QuestionCollection | ID
    ) -> bool:
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

    def get_question(self, question: Question | ID) -> Question:
        if isinstance(question, Question):
            return question
        question = self._session.get(Question, question)
        if not question:
            raise QuestionNotFound(question_id=question)
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
    def _validate_dev_owner(
        collection: QuestionCollection,
        owner_id: UUID,
    ) -> None:
        if collection.owner_id != owner_id:
            raise QuestionCollectionValidationError(
                "Collection does not belong to this developer"
            )
