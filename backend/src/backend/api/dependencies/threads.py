from typing import Annotated

from fastapi import Depends

from backend.chat.service.thread import MessageDB, ThreadDB
from backend.core import logger

from .core import SessionDep


def get_thread_db(session: SessionDep) -> ThreadDB:
    logger.debug("Initialized Thread DB")
    return ThreadDB(session)


ThreadDBDependency = Annotated[ThreadDB, Depends(get_thread_db)]


def get_message_db(session: SessionDep) -> MessageDB:
    logger.debug("Initialized Message DB")
    return MessageDB(session)


MessageDBDependency = Annotated[MessageDB, Depends(get_message_db)]

__all__ = [
    "MessageDBDependency",
    "ThreadDBDependency",
    "get_message_db",
    "get_thread_db",
]
