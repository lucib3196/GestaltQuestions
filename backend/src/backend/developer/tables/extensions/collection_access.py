from typing import Any
from uuid import UUID
from typing import Generic, TypeVar
from sqlalchemy import func, select
from sqlalchemy.orm import Mapped, aliased
from sqlalchemy.sql import Select
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col
from sqlmodel import SQLModel
from backend.accounts.model import User
from backend.authorization import AccessLevel
from backend.developer import DeveloperProfile
from backend.question.collections.models import QuestionCollectionAccess
from backend.tables import TableExtension
from typing import Protocol
from sqlalchemy.orm.attributes import InstrumentedAttribute
from uuid import UUID
from datetime import datetime
from dataclasses import dataclass
from typing import Protocol, TypeVar, runtime_checkable

AccessT = TypeVar("AccessT", bound=SQLModel)
ProfileT = TypeVar("ProfileT", bound=SQLModel)
UserT = TypeVar("UserT", bound=SQLModel)


@dataclass(frozen=True)
class AccessTableConfig(Generic[AccessT, ProfileT]):
    access_model: type[AccessT]
    profile_model: type[ProfileT]

    resource_id_col: InstrumentedAttribute[AccessT]
    subject_id_col: InstrumentedAttribute[AccessT]
    profile_id_col: InstrumentedAttribute[ProfileT]


config = AccessTableConfig(
    access_model=QuestionCollectionAccess,
    profile_model=DeveloperProfile,
    resource_id_col=QuestionCollectionAccess.collection_id,
    subject_id_col=QuestionCollectionAccess.developer_id,
    profile_id_col=DeveloperProfile.id,
)
