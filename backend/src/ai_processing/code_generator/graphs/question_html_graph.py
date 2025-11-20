from pydantic import BaseModel
from typing import Dict


class Question(BaseModel):
    question_text: str
    solution_text: str | None
    question_solution: Dict[str, str] | None
