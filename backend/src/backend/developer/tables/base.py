from sqlmodel import Session


class DeveloperTables:
    """Provides shared session and composer setup for developer table services."""

    def __init__(
        self,
        session: Session,
    ) -> None:
        """Initialize the developer table helper with a session."""
        self._session = session
