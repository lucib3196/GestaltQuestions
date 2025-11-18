from pydantic import BaseModel
from typing import Sequence
from typing import Literal

Language = Literal["javascript", "python"]


class ExecutionResult(BaseModel):
    output: str | dict  # final returned value
    logs: Sequence[str] = []


class ExecutionRequest(BaseModel):
    language: Language
    code: str  # the actual code to run
