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


ModelT = TypeVar("ModelT", bound=SQLModel)
@dataclass(frozen=True)
class ResourceAccessColumns(Generic[ModelT]):
    resource_id: InstrumentedAttribute
    