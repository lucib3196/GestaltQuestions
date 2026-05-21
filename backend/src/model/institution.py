# Standard library
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

# Third-party libraries
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .users import User


class ValidInstitutions(StrEnum):
    UCR = "University of California, Riverside"
    CPP = "California State Polytechnic University, Pomona"
    NORCO = "Norco College"


class Institution(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: ValidInstitutions
    description: str | None = None

    users: list["User"] = Relationship(back_populates="institution")
