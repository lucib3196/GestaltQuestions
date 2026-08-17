from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserRoles(StrEnum):
    ADMIN = "admin"
    TEACHER = "teacher"
    DEVELOPER = "developer"
    STUDENT = "student"


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None


class UpdateUserRole(BaseModel):
    role: UserRoles
