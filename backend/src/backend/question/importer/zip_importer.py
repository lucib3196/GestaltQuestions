import base64
import io
import json
import mimetypes
import zipfile
from dataclasses import dataclass
from pathlib import PurePosixPath
from typing import Any

from backend.storage import FileData

from .exceptions import MissingQuestionMetadataError
from .importer import QuestionImporter
from .schema import QuestionPackage


@dataclass
class ZipQuestionPackage:
    """Raw ZIP archive bytes for one imported question package."""

    content: bytes


@dataclass
class ZipQuestionFile:
    """One extracted ZIP member normalized enough for FileData conversion."""

    filename: str
    content: bytes
    mime_type: str


class ZipQuestionImporter(QuestionImporter[ZipQuestionPackage, ZipQuestionFile]):
    source_type = "zip"
    metadata_filename = "info.json"

    def prepare_question(self, source: ZipQuestionPackage) -> QuestionPackage:
        raw_metadata = self.load_raw_metadata(source)
        info = self.resolve_metadata(source)
        extracted_files = self._extract_files(source)

        files = [
            self.convert_to_filedata(
                ZipQuestionFile(
                    filename=filename,
                    content=content,
                    mime_type=self._guess_mime_type(filename),
                )
            )
            for filename, content in extracted_files.items()
            if filename != self.metadata_filename
        ]

        return QuestionPackage(
            question=self.build_question_create(info),
            files=files,
            source_question_id=str(info.id),
            raw_metadata=raw_metadata,
            source_type=self.source_type,
        )

    def load_raw_metadata(self, source: ZipQuestionPackage) -> dict[str, Any]:
        extracted_files = self._extract_files(source)
        print("These are the extract files", extracted_files)
        raw_metadata = extracted_files.get(self.metadata_filename)
        if raw_metadata is None:
            raise MissingQuestionMetadataError(self.metadata_filename)
        return json.loads(raw_metadata.decode("utf-8"))

    def convert_to_filedata(self, file: ZipQuestionFile) -> FileData:
        if file.mime_type.startswith("image/"):
            self.verify_image(file.filename, file.content)
            content = base64.b64encode(file.content).decode("ascii")
        elif self.is_text_like(file.mime_type):
            content = file.content.decode("utf-8")
        else:
            content = file.content

        return FileData(
            filename=file.filename,
            content=content,
            mime_type=file.mime_type,
        )

    @staticmethod
    def _guess_mime_type(filename: str) -> str:
        mime_type, _ = mimetypes.guess_type(PurePosixPath(filename).name)
        return mime_type or "application/octet-stream"

    @staticmethod
    def extract_zip(content: bytes) -> dict[str, bytes]:
        """Extract non-directory files from a ZIP archive payload.

        Args:
            content: Raw bytes of a ZIP archive.

        Returns:
            A mapping of archive file paths to their extracted file bytes.
        """
        extracted_files = {}
        with zipfile.ZipFile(io.BytesIO(content), "r") as z:
            for info in z.infolist():
                # Skip directories
                if info.is_dir():
                    continue
                # Clean up name
                member_path = PurePosixPath(info.filename.replace("\\", "/"))
                # Ensure nto absoulte
                if member_path.is_absolute() or ".." in member_path.parts:
                    continue
                extracted_files[member_path] = z.read(member_path.as_posix())
        return extracted_files

    def _extract_files(self, source: ZipQuestionPackage) -> dict[str, bytes]:
        files = {
            PurePosixPath(filename).as_posix(): content
            for filename, content in self.extract_zip(source.content).items()
        }
        top_level_dirs = {
            PurePosixPath(filename).parts[0]
            for filename in files
            if len(PurePosixPath(filename).parts) > 1
        }
        if len(top_level_dirs) != 1:
            return files
        root = next(iter(top_level_dirs))
        return {
            PurePosixPath(filename).relative_to(root).as_posix(): content
            for filename, content in files.items()
        }
