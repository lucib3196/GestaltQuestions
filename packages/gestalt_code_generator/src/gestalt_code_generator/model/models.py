from dataclasses import dataclass
from typing import Literal

from langchain_core.vectorstores import VectorStore
from pydantic import BaseModel, Field

CodeFilename = Literal["server.js", "server.py", "solution.html", "question.html"]
ExampleColumn = Literal[
    "question", "server.js", "server.py", "solution.html", "question.html"
]


# Context for the vectorstore to use
## and for the provided model
@dataclass
class ContextSchema:
    model: str
    model_provider: str
    vectorstore: VectorStore


class Question(BaseModel):
    text: str = Field(description="The question prompt or problem statement.")
    is_adaptive: bool = Field(
        default=True,
        description="Whether the question should adapt based on the user's response.",
    )
    solution_guide: str | None = Field(
        default=None,
        description="Optional guidance explaining how to solve the question.",
    )
    final_answer: str | None = Field(
        default=None,
        description="Optional final answer for the question.",
    )


class CodeArtifact(BaseModel):
    filename: CodeFilename | ExampleColumn = Field(
        description="The target filename or example column represented by this artifact."
    )
    content: str = Field(
        description="The source code or HTML content for the artifact."
    )


class CodeResponse(BaseModel):
    code: str = Field(description="The generated code response.")
