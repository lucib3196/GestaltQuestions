from abc import ABC, abstractmethod
from io import BytesIO
from typing import Any, TypeVar

from PIL import Image, UnidentifiedImageError

from backend.question import QuestionCreate
from backend.question.schema import QuestionInfo
from backend.storage import FileData

from .schema import QuestionPackage

SourceT = TypeVar("SourceT")
SourceFileT = TypeVar("SourceFileT")


class QuestionImporter[SourceT, SourceFileT](ABC):
    @abstractmethod
    def prepare_question(self, source: SourceT) -> QuestionPackage: ...

    @abstractmethod
    def convert_to_filedata(self, file: SourceFileT) -> FileData: ...

    @abstractmethod
    def load_raw_metadata(self, source: SourceT) -> dict[str, Any]: ...

    def resolve_metadata(self, source: SourceT) -> QuestionInfo:
        return QuestionInfo.model_validate(self.load_raw_metadata(source))

    @staticmethod
    def build_question_create(info: QuestionInfo) -> QuestionCreate:
        return QuestionCreate(
            title=info.title,
            topics=info.topic if isinstance(info.topic, list) else [info.topic],
            qType=info.qType if isinstance(info.qType, list) else [info.qType],
            isAdaptive=info.isAdaptive,
            ai_generated=info.ai_generated,
        )

    @staticmethod
    def is_text_like(mime_type: str) -> bool:
        return mime_type.startswith("text/") or mime_type in {
            "application/json",
            "application/javascript",
            "application/typescript",
            "application/xml",
        }

    @staticmethod
    def verify_image(filename: str, content: bytes) -> None:
        try:
            with Image.open(BytesIO(content)) as image:
                image.verify()
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise ValueError(
                f"File '{filename}' is marked as an image but is not a valid image"
            ) from exc
