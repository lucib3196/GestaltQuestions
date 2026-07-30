
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.auth.model import DeveloperProfile
from backend.developer.services import DeveloperProfileService
from backend.question import Question
from backend.question_collections.model import QuestionCollection
from backend.question_collections.schema import QuestionCollectionCreate
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionCollectionService:
    def __init__(self, session: Session, dev_profile: DeveloperProfileService) -> None:
        self._dev_profile = dev_profile
        self._session = session

    def create(self, data: QuestionCollectionCreate) -> QuestionCollection:
        self._validate_owner(data.owner_id)
        parent = self._validate_parent(parent_id=data.parent_id, owner_id=data.owner_id)
        try:
            collection = QuestionCollection(
                title=data.title,
                owner_id=convert_uuid(data.owner_id),
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

    def delete(self) -> None:
        pass

    def update(self) -> None:
        pass

    def add_question(self, collection_id: ID, qid: ID) -> None:
        pass

    def _validate_question(self, qid: ID, owner_id: ID) -> bool:
        q = self._session.get(Question, qid)

        if not q:
            raise ValueError("Question does not exist")

        self._validate_owner(owner_id)
        if not q.created_by == owner_id:
            raise ValueError("Do not have question rights")

    def _validate_owner(self, owner_id: ID) -> bool:
        owner_id = convert_uuid(owner_id)
        dev_prof = self._session.get(DeveloperProfile, owner_id)
        if not dev_prof:
            raise ValueError("Developer profile is not valid")
        return True

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
