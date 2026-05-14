from src.web.dependencies import SessionDep
from functools import lru_cache
from src.data.thread import ThreadDB,MessageDB
from src.core.logging import logger
from typing import Annotated
from fastapi import Depends


@lru_cache
def get_thread_db(session: SessionDep) -> ThreadDB:
    try:
        logger.debug("Initialized Thread DB")
        return ThreadDB(session)
    except Exception as e:
        raise ValueError("Failed to initialize Thread DB")


ThreadDBDependency = Annotated[ThreadDB, Depends(get_thread_db)]

@lru_cache
def get_message_db(session: SessionDep) -> MessageDB:
    try:
        logger.debug("Initialized Message DB")
        return MessageDB(session)
    except Exception as e:
        raise ValueError("Failed to initialize Message DB")

MessageDBDependency = Annotated[MessageDB, Depends(get_thread_db)]