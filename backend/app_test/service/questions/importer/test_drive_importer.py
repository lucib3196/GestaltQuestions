import json

import pytest
from gdrive_importer.models import GDriveFile

from backend.question.importer import (
    DriveQuestionImporter,
    DriveQuestionPackage,
    MissingQuestionMetadataError,
)


class FakeDriveIndexer:
    def __init__(self, contents: dict[str, bytes]) -> None:
        self.contents = contents

    def read_file(self, file_id: str) -> bytes:
        return self.contents[file_id]


def valid_metadata() -> dict:
    return {
        "uuid": "source-123",
        "title": "Test Question",
        "topic": "Statics",
        "isAdaptive": False,
        "ai_generated": False,
        "qType": "mcq",
    }


def test_drive_importer_prepares_question_package() -> None:
    indexer = FakeDriveIndexer(
        {
            "meta": json.dumps(valid_metadata()).encode("utf-8"),
            "html": b"<p>Hello</p>",
            "binary": b"\x00\x01",
        }
    )

    source = DriveQuestionPackage(
        parent_id="folder-1",
        files={
            "info.json": GDriveFile(
                id="meta",
                name="info.json",
                mimeType="application/json",
            ),
            "question.html": GDriveFile(
                id="html",
                name="question.html",
                mimeType="text/html",
            ),
            "data.bin": GDriveFile(
                id="binary",
                name="data.bin",
                mimeType="application/octet-stream",
            ),
        },
    )

    importer = DriveQuestionImporter(indexer)
    package = importer.prepare_question(source)

    assert package.source_type == "google_drive"
    assert package.source_question_id == "source-123"
    assert package.question.title == "Test Question"

    files = {file.filename: file for file in package.files}
    assert "info.json" not in files
    assert files["question.html"].content == "<p>Hello</p>"
    assert files["data.bin"].content == b"\x00\x01"


def test_drive_importer_requires_info_json() -> None:
    source = DriveQuestionPackage(parent_id="folder-1", files={})
    importer = DriveQuestionImporter(FakeDriveIndexer({}))

    with pytest.raises(MissingQuestionMetadataError, match="folder-1"):
        importer.prepare_question(source)
