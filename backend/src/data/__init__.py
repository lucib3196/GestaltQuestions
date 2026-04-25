import asyncio
from enum import Enum
from pathlib import Path, PurePosixPath
from typing import Any, Dict, Iterable, List, Literal, Sequence, Type, TypeVar, overload, Union
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy import func,desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.inspection import inspect
from sqlalchemy.orm.properties import RelationshipProperty
from sqlmodel import SQLModel, Session, delete, select

from src.app_types.general import ID, STORAGE_TYPE
from src.core import SessionDep, logger
from src.model.question import (
    Question,
    QuestionData,
    QuestionType,
    Topic,
)
from src.utils import convert_uuid
