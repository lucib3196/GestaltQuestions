from pydantic import BaseModel
from typing import Sequence

class ExecutionResult(BaseModel):
    output: str | dict  # final returned value
    logs: Sequence[str] = []


class ExecutionRequest(BaseModel):
    language: str  # python, js, cpp, etc.
    code: str  # the actual code to run
