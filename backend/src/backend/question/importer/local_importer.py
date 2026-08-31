import json
from pathlib import Path
from typing import Any

from backend.question.schema import QuestionInfo
from backend.storage import FileData
from backend.storage.filedata import normalize_filedata

from .importer import QuestionImporter
from .local_discoverer import LocalDiscoverer, LocalQuestionPackage
from .schema import QuestionPackage


class LocalQuestionImporter(QuestionImporter[LocalQuestionPackage, Path]):
    source_type = "local"

    def __init__(self) -> None:
        return

    def prepare_question(self, source: LocalQuestionPackage) -> QuestionPackage:
        raw_metadata = self.load_raw_metadata(source)
        info = self.resolve_metadata(source)
        files = [self.convert_to_filedata(file) for file in source.file_paths]
        return QuestionPackage(
            question=self.build_question_create(info),
            files=files,
            source_question_id=str(info.id),
            raw_metadata=raw_metadata,
            source_type=self.source_type,
        )

    def convert_to_filedata(self, file: Path) -> FileData:
        content = Path(file).read_bytes()
        return normalize_filedata(
            filename=file.name, content=content, verify_image=self.verify_image
        )

    def load_raw_metadata(self, source: LocalQuestionPackage) -> dict[str, Any]:
        meta = Path(source.metadata_path).read_text()
        return json.loads(meta)

    def resolve_metadata(self, source: LocalQuestionPackage) -> QuestionInfo:
        return super().resolve_metadata(source)


if __name__ == "__main__":
    cred_path = Path("../credentials.json").resolve()
    manifest = Path("local_question_manifest.json")

    packages = LocalDiscoverer().load_packages(manifest)
    importer = LocalQuestionImporter()

    first_item = next(iter(packages.items()), None)
    if first_item:
        first_package = first_item[1]
        q = importer.prepare_question(first_package)
        print(q)
