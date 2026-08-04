from datetime import UTC, datetime

from multimethod import multimethod
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.developer.services import DeveloperProfileService
from backend.question import Question
from backend.question_collections.model import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.question_collections.schema import (
    QuestionCollectionCreate,
    QuestionCollectionUpdate,
)
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionCollectionService:
    def __init__(
        self,
        session: Session,
        profile: DeveloperProfileService,
    ) -> None:
        self._session = session
        self._profile = profile

    async def create_collection(
        self, data: QuestionCollectionCreate
    ) -> QuestionCollection:
        user_profile = await self._profile.get_profile(data.owner_id)
        parent = self._validate_parent(
            parent_id=data.parent_id,
            owner_id=user_profile.id,
        )
        try:
            collection = QuestionCollection(
                title=data.title,
                owner_id=user_profile.id,
                parent=parent,
                parent_id=parent.id if parent else None,
            )
            self._session.add(collection)
            self._session.commit()
            self._session.refresh(collection)
            return collection

        except SQLAlchemyError as e:
            self._session.rollback()
            raise ValueError(
                f"[QuestionCollectionService] Failed to create collection {e}"
            )

    async def delete_collection(self, owner_id: ID, collection_id: ID) -> bool:
        collection = self.get_collection_by_owner(owner_id, collection_id)
        self._session.delete(collection)
        self._session.commit()
        return True

    async def update_collection(
        self,
        owner_id: ID,
        collection_id: ID,
        data: QuestionCollectionUpdate,
    ) -> QuestionCollection:
        user_profile = await self._profile.get_profile(owner_id)
        collection = self.get_collection_by_owner(user_profile.id, collection_id)
        if collection is None:
            raise ValueError("Collection does not exist")

        try:
            if data.title is not None:
                collection.title = data.title

            if data.parent_id is not None:
                parent = self._validate_parent(
                    parent_id=data.parent_id,
                    owner_id=user_profile.id,
                )
                if parent and parent.id == collection.id:
                    raise ValueError("Collection cannot be its own parent")
                collection.parent = parent
                collection.parent_id = parent.id if parent else None

            collection.updated_at = datetime.now(UTC)
            self._session.add(collection)
            self._session.commit()
            self._session.refresh(collection)
            return collection
        except SQLAlchemyError as e:
            self._session.rollback()
            raise ValueError(
                f"[QuestionCollectionService] Failed to update collection {e}"
            ) from e

    @multimethod
    async def add_question(  # pyright: ignore[reportRedeclaration]
        self, collection_id: ID, qid: ID
    ) -> QuestionCollectionLink:
        collection = self.get_collection(collection_id)
        if collection is None or collection.id is None:
            raise ValueError("Collection does not exist")

        return self._add_question_link(collection.id, qid)

    @multimethod
    async def add_question(
        self,
        collection_id: ID,
        question: Question,
    ) -> QuestionCollectionLink:
        if question.id is None:
            raise ValueError("Question does not have an id")
        return await self.add_question(collection_id, question.id)

    def get_collection(self, collection_id: ID) -> QuestionCollection | None:
        return self._session.get(QuestionCollection, convert_uuid(collection_id))

    def get_collection_by_owner(self, owner_id: ID, collection_id: ID):
        try:
            stmt = select(QuestionCollection).where(
                QuestionCollection.id == convert_uuid(collection_id),
                QuestionCollection.owner_id == convert_uuid(owner_id),
            )
            return self._session.exec(stmt).first()
        except SQLAlchemyError as e:
            raise ValueError("Failed to get collection") from e

    def _add_question_link(
        self,
        collection_id: ID,
        question_id: ID,
    ) -> QuestionCollectionLink:
        try:
            qlink = QuestionCollectionLink(
                question_id=convert_uuid(question_id),
                collection_id=convert_uuid(collection_id),
            )
            self._session.add(qlink)
            self._session.commit()
            self._session.refresh(qlink)
            return qlink
        except SQLAlchemyError as e:
            self._session.rollback()
            raise ValueError(
                f"[QuestionCollectionService] Failed to add question {e}"
            ) from e

    def _validate_parent(
        self, parent_id: ID, owner_id: ID
    ) -> QuestionCollection | None:
        owner_id = convert_uuid(owner_id)
        if parent_id:
            parent_id = convert_uuid(parent_id)
            parent = self._session.get(QuestionCollection, parent_id)
            if not parent:
                raise ValueError("Parent collection does not exist")

            if parent.owner_id != owner_id:
                raise ValueError("Parent collection does not belong to this developer")

            return parent
        parent = None
        return None

    def _reconstruct(self, collection: QuestionCollection):
        parts: list[str] = []
        c: QuestionCollection | None = collection
        while c is not None:
            parts.append(c.title)
            if c.parent_id is None:
                break
            c = self.get_collection(c.parent_id)

        return "->".join(reversed(parts))
