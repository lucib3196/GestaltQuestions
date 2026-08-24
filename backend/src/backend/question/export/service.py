import base64
import json
from dataclasses import dataclass
from uuid import UUID

from backend.question import QuestionExportError, QuestionReadError
from backend.question.manager import QuestionManager
from backend.question.models import Question
from backend.question.reader import QuestionReader
from backend.question.schema import QuestionInfo
from backend.shared import ID
from backend.storage import FileData
from backend.utils import convert_uuid

ArchivePayload = dict[str, bytes | bytearray]


@dataclass(frozen=True)
class QuestionDownloadPayload:
    question_id: UUID
    folder_name: str
    files: ArchivePayload


class QuestionDownload:
    def __init__(self, question_manager: QuestionManager, reader: QuestionReader):
        self._manager = question_manager
        self._reader = reader

    async def download(self, question: Question | ID) -> QuestionDownloadPayload:
        try:
            question_id = self._resolve_question_id(question)
            files = await self._manager.get_question_filedata(question_id)
            qinfo = self._reader.get_question_info(question_id)

            payload: ArchivePayload = {}
            for file in files:
                payload[file.filename] = self.normalize_content(file)

            payload["info2.json"] = qinfo.model_dump_json().encode("utf-8")

            return QuestionDownloadPayload(
                question_id=question_id,
                folder_name=self._resolve_folder_name(qinfo),
                files=payload,
            )
        except (QuestionExportError, QuestionReadError):
            raise
        except Exception as e:
            raise QuestionExportError(
                f"Failed to prepare download for question '{question}': {e}"
            ) from e

    @staticmethod
    def _resolve_folder_name(question: Question | QuestionInfo) -> str:
        if question.title:
            return question.title
        return f"UntitledQuestion_{str(question.id)[:5]}"

    @staticmethod
    def normalize_content(file: FileData) -> bytes | bytearray:
        content = file.content

        if isinstance(content, bytes | bytearray):
            return content

        if isinstance(content, dict):
            return json.dumps(content).encode("utf-8")

        if file.mime_type.startswith("image/") and isinstance(content, str):
            try:
                return base64.b64decode(content)
            except Exception as e:
                raise QuestionExportError(
                    f"Failed to decode image file '{file.filename}'"
                ) from e

        if isinstance(content, str):
            return content.encode("utf-8")

        return str(content).encode("utf-8")

    @staticmethod
    def _resolve_question_id(question: Question | ID) -> UUID:
        if isinstance(question, Question):
            if question.id is None:
                raise QuestionExportError("Question id cannot be None for download.")
            return question.id

        try:
            return convert_uuid(question)
        except Exception as e:
            raise QuestionExportError(f"Invalid question id '{question}'") from e
