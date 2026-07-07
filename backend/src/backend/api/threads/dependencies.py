from typing import Annotated

from fastapi import Depends

from src.core.logging import logger
from src.data.thread import MessageDB, ThreadDB
from src.web.dependencies import SessionDep


def get_thread_db(session: SessionDep) -> ThreadDB:
    try:
        logger.debug("Initialized Thread DB")
        return ThreadDB(session)
    except Exception:
        raise ValueError("Failed to initialize Thread DB") from None


ThreadDBDependency = Annotated[ThreadDB, Depends(get_thread_db)]


def get_message_db(session: SessionDep) -> MessageDB:
    try:
        logger.debug("Initialized Message DB")
        return MessageDB(session)
    except Exception:
        raise ValueError("Failed to initialize Message DB") from None


MessageDBDependency = Annotated[MessageDB, Depends(get_message_db)]
