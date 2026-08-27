from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.question import QuestionNotFound, QuestionReadError
from backend.question.models import Question
from backend.question.schema import QuestionInfo
from backend.question_runtime.model import QuestionRunTime
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionReader:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_question(self, question: Question | ID) -> Question:
        try:
            if isinstance(question, Question):
                if question.id is None:
                    raise QuestionReadError("Question instance does not have an id.")
                return question

            found = self._session.get(Question, question)
            if found is None:
                raise QuestionNotFound(question)

            return found
        except QuestionNotFound:
            raise
        except SQLAlchemyError as e:
            raise QuestionReadError(f"Failed to read question '{question}': {e}") from e

    def get_question_info(self, question: Question | ID) -> QuestionInfo:
        try:
            question = self.get_question(question)

            dev = question.created_by
            user = dev.user if dev is not None else None
            institution = user.institution if user is not None else None

            return QuestionInfo(
                **question.model_dump(),
                topic=[topic.name for topic in question.topics],
                qType=[qtype.name for qtype in question.qType],
                createdBy=user.email if user is not None else "",
                institution=institution.name if institution is not None else "",
                codelang=[c.language for c in self.get_runtime(question)],
            )

        except (QuestionNotFound, QuestionReadError):
            raise
        except SQLAlchemyError as e:
            raise QuestionReadError(
                f"Failed to resolve read data for question '{question}': {e}"
            ) from e
        except Exception as e:
            raise QuestionReadError(
                f"Unexpected error resolving read data for question '{question}': {e}"
            ) from e

    def get_runtime(self, question: Question | ID) -> Sequence[QuestionRunTime]:
        try:
            question_id = self._resolve_question_id(question)
            stmt = select(QuestionRunTime).where(
                QuestionRunTime.question_id == question_id
            )
            return self._session.exec(stmt).all()
        except SQLAlchemyError as e:
            raise QuestionReadError(
                f"Failed to read runtime data for question '{question}': {e}"
            ) from e

    @staticmethod
    def _resolve_question_id(question: Question | ID) -> UUID:
        if isinstance(question, Question):
            if question.id is None:
                raise QuestionReadError("Question instance does not have an id.")
            return question.id
        return convert_uuid(question)
