from typing import Literal, Dict
from pydantic import BaseModel


allowed_files = Literal["question.html", "solution.html", "server.js", "server.py"]
question_types = Literal["computational", "static"]


class Question(BaseModel):
    question_text: str
    solution_text: str | None
    question_solution: Dict[str, str] | None
