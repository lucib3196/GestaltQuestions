import base64
import json
from io import BytesIO
from pathlib import Path
from typing import Any

from gdrive_importer.gdrive_indexer import GoogleDriveIndexer
from gdrive_importer.models import GDriveFile
from PIL import Image, UnidentifiedImageError

from backend.question.schema import QuestionInfo
from backend.storage import FileData

from .drive_question_packages import DriveQuestionPackageDiscoverer
from .importer.models import DriveQuestionPackage


class DriveQuestionImporter:
    def __init__(self, indexer: GoogleDriveIndexer) -> None:
        self._indexer = indexer

    def load_package(self, package: DriveQuestionPackage) -> None:
        # Handle the question data
        raw_meta = self._load_metadata(package)
        self._normalize_metadata(raw_meta)
        files: list[FileData] = [
            self.normalize_file(f) for _, f in package.files.items()
        ]
        print(files)

    def normalize_file(self, file: GDriveFile) -> FileData:
        raw_content = self._indexer.read_file(file.id)
        mime_type = file.mimeType or "application/octet-stream"

        if mime_type.startswith("image/"):
            try:
                with Image.open(BytesIO(raw_content)) as image:
                    image.verify()
            except (UnidentifiedImageError, OSError, ValueError) as exc:
                raise ValueError(
                    f"File '{file.name}' is marked as an image but is not a valid image"
                ) from exc

            content = base64.b64encode(raw_content).decode("ascii")
        elif mime_type.startswith("text/") or mime_type in {
            "application/json",
            "application/javascript",
            "application/typescript",
            "application/xml",
        }:
            content = raw_content.decode("utf-8")
        else:
            content = raw_content

        return FileData(
            filename=file.name,
            content=content,
            mime_type=mime_type,
        )

    def _normalize_metadata(self, data: dict[str, Any]) -> QuestionInfo:
        return QuestionInfo.model_validate(data)

    def _load_metadata(self, package: DriveQuestionPackage) -> dict[str, Any]:
        meta_file = self._get_file(package, "info.json")
        if not meta_file:
            raise ValueError(
                f"Cannot resolve file for package with id {package.parent_id}"
            )
        return json.loads(self._indexer.read_file(meta_file.id).decode("utf-8"))

    def _get_file(
        self, package: DriveQuestionPackage, filename: str
    ) -> GDriveFile | None:
        return package.files.get(filename, None)

    def _contains_file(self, package: DriveQuestionPackage, filename: str) -> bool:
        return bool(self._get_file(package, filename))

    @classmethod
    def from_credentials(
        cls,
        credentials_path: str | Path,
        token_path: str | Path | None = None,
    ):
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
        importer.load_package(first_package)
        # print(first_package)

# if manifest.exists():
#     packages = discoverer.load_packages(manifest)
#     count = 0
#     for package_id, package in packages.items():
#         # print("Package \n", package, "\n\n")
#         data: List[FileData] = []
#         for f, file in package.files.items():
#             print(f, file)
#             content = indexer.read_file(file.id)
#             if "image/" in file.mimeType:
#                 print("Encoding Image")
#                 print(content[:10])
#                 encoded = base64.b64encode(content).decode("utf-8")
#                 print(encoded[:10])
#             # filedata = FileData(filename=f, content =content, mime_type=file.mimeType)
#             # data.append(filedata)
#         print(data)
#         count+=1
#         if count >1:
#             break
