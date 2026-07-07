from enum import StrEnum
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class RuntimeLanguage(StrEnum):
    JAVASCRIPT = "javascript"
    PYTHON = "python"


class RuntimeConfigSource(StrEnum):
    MANUAL = "manual"
    CONFIG_FILE = "config_file"
    INFERRED = "inferred"


class QuestionRunTime(SQLModel, table=True):
    __tablename__ = "question_runtime"  # type: ignore
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    question_id: UUID = Field(foreign_key="question.id")

    language: RuntimeLanguage = Field(index=True)
    entry: str
    func_name: str = "generate"

    source: RuntimeConfigSource = RuntimeConfigSource.INFERRED

    is_default: bool = False
    enabled: bool = True
