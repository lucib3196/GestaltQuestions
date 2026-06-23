from typing import Literal
from uuid import UUID

ID = str | UUID | None
AllowedLanguages = Literal["javascript", "python"]

STORAGE_TYPE = Literal["cloud", "local"]
