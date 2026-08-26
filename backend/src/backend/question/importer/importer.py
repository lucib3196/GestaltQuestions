from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import TypeVar

from backend.question import QuestionCreate
from backend.question.schema import QuestionInfo
from backend.storage import FileData


@dataclass
class QuestionPackage:
    question: QuestionCreate
    files: list[FileData]
    raw_metadata: Dict[str, Any]


SourceT = TypeVar("SourceT")
SourceFile = TypeVar("SourceFile")


class QuestionImporter[SourceT, SourceFile](ABC):
    @abstractmethod
    def prepare_question(self, source: SourceT) -> QuestionPackage: ...

    @abstractmethod
    def convert_to_filedata(self, file: SourceFile) -> FileData: ...

    @abstractmethod
    def resolve_metadata(self, source: SourceT) -> QuestionInfo: ...
