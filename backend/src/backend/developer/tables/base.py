from sqlmodel import Session

from backend.question.views.services import QuestionTableQueryComposer


class DeveloperTables:
    """Provides shared session and composer setup for developer table services."""

    def __init__(
        self,
        session: Session,
        composer: QuestionTableQueryComposer | None = None,
    ) -> None:
        """Initialize the developer table helper with a session and composer."""
        self._session = session
        self._composer = composer or QuestionTableQueryComposer(session)
