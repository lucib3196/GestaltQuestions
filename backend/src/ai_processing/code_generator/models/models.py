from typing import Literal, Dict
from pydantic import BaseModel, Field

allowed_files = Literal["question.html", "solution.html", "server.js", "server.py"]
question_types = Literal["computational", "static"]


class Question(BaseModel):
    question_text: str
    solution_text: str | None
    question_solution: str|None


class CodeResponse(BaseModel):
    """Output schema from the LLM for code generation."""

    code: str = Field(..., description="The generated code. Only return the code.")
