import base64
import json
from pathlib import Path
from typing import Any

from gdrive_importer.gdrive_indexer import GoogleDriveIndexer
from gdrive_importer.models import GDriveFile

from backend.storage import FileData

from .drive_question_packages import (
    DriveQuestionPackage,
    DriveQuestionPackageDiscoverer,
)
from .exceptions import MissingQuestionMetadataError
from .importer import QuestionImporter
from .schema import QuestionPackage


class DriveQuestionImporter(QuestionImporter[DriveQuestionPackage, GDriveFile]):
    source_type = "google_drive"
    metadata_filename = "info.json"

    def __init__(self, indexer: GoogleDriveIndexer) -> None:
        self._indexer = indexer

    def prepare_question(self, source: DriveQuestionPackage) -> QuestionPackage:
        raw_metadata = self.load_raw_metadata(source)
        info = self.resolve_metadata(source)
        files = [
            self.convert_to_filedata(file)
            for filename, file in source.files.items()
            if filename != self.metadata_filename
        ]
        return QuestionPackage(
            question=self.build_question_create(info),
            files=files,
            source_question_id=str(info.id),
            raw_metadata=raw_metadata,
            source_type=self.source_type,
        )

    def load_raw_metadata(self, source: DriveQuestionPackage) -> dict[str, Any]:
        meta_file = self._get_file(source, self.metadata_filename)
        if not meta_file:
            raise MissingQuestionMetadataError(
                self.metadata_filename,
                source_id=source.parent_id,
            )
        return json.loads(self._indexer.read_file(meta_file.id).decode("utf-8"))

    def convert_to_filedata(self, file: GDriveFile) -> FileData:
        raw_content = self._indexer.read_file(file.id)
        mime_type = file.mimeType or "application/octet-stream"

        if mime_type.startswith("image/"):
            self.verify_image(file.name, raw_content)
            content = base64.b64encode(raw_content).decode("ascii")
        elif self.is_text_like(mime_type):
            content = raw_content.decode("utf-8")
        else:
            content = raw_content

        return FileData(
            filename=file.name,
            content=content,
            mime_type=mime_type,
        )

    def _get_file(
        self, package: DriveQuestionPackage, filename: str
    ) -> GDriveFile | None:
        return package.files.get(filename, None)

    @classmethod
    def from_credentials(
        cls,
        credentials_path: str | Path,
        token_path: str | Path | None = None,
    ) -> "DriveQuestionImporter":
        indexer = GoogleDriveIndexer.from_credentials(credentials_path, token_path)
        return cls(indexer)


if __name__ == "__main__":
    cred_path = Path("../credentials.json").resolve()
    manifest = Path("drive_question_manifest.json")
    indexer = GoogleDriveIndexer.from_credentials(cred_path)

    discoverer = DriveQuestionPackageDiscoverer(indexer=indexer)
    importer = DriveQuestionImporter(indexer=indexer)

    packages = discoverer.load_packages(manifest)

    first_item = next(iter(packages.items()), None)
    if first_item:
        first_package = first_item[1]
        q = importer.prepare_question(first_package)
        print(q)
