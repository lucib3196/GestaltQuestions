from collections.abc import Sequence

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.question import Question
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.shared import ID


class QuestionCollectionReader:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_collection(self, id: ID) -> QuestionCollection | None:
        return self._session.get(QuestionCollection, id)

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
