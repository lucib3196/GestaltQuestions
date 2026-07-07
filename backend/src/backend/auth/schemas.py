from enum import StrEnum
from typing import Optional, TYPE_CHECKING

from pydantic import BaseModel, EmailStr
from sqlmodel import Field


if TYPE_CHECKING:
    from .model import Institution, Role, User

class ValidInstitutions(StrEnum):
    UCR = "University of California, Riverside"
    CPP = "California State Polytechnic University, Pomona"
    NORCO = "Norco College"


class UserRoles(StrEnum):
    ADMIN = "admin"
    TEACHER = "teacher"
    DEVELOPER = "developer"
    STUDENT = "student"


class UserBase(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    username: str | None = None
    password: str
    email: EmailStr


class UserUpdate(UserBase):
    email: str | None = None


class UserRead(UserBase):
    email: str | None = None
    roles: list[UserRoles | str] = Field(..., default_factory=list)
    institution: ValidInstitutions | None = None


class CreateUserFullPayload(BaseModel):
    user: UserCreate
    role: UserRoles = UserRoles.STUDENT
    institution: ValidInstitutions | None = None


class UpdateUserRole(BaseModel):
    role: UserRoles


class UpdateUserInstitution(BaseModel):
    institution: "ValidInstitutions"


class UserRoleResponse(BaseModel):
    user: "User"
    roles: list["Role"] = []


class UserInstResponse(BaseModel):
    user: "User"
    inst: Optional["Institution"] = None
