from enum import StrEnum
from uuid import UUID

from backend.auth.model import User


class Runtime(StrEnum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"


ID = str | UUID | None
type UserRef = User | ID
