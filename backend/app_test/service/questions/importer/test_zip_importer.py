import io
import json
import zipfile

import pytest

from backend.question.importer import ZipQuestionImporter, ZipQuestionPackage


def valid_metadata() -> dict:
    return {
        "uuid": "source-123",
        "title": "Test Question",
        "topic": "Statics",
        "isAdaptive": False,
        "ai_generated": False,
        "qType": "mcq",
    }


def make_zip(files: dict[str, bytes]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as z:
        for filename, content in files.items():
            z.writestr(filename, content)
    return buffer.getvalue()


def test_zip_importer_prepares_question_package() -> None:
    zip_bytes = make_zip(
        {
            "info.json": json.dumps(valid_metadata()).encode("utf-8"),
            "question.html": b"<p>Hello</p>",
            "data.bin": b"\x00\x01",
        }
    )

    importer = ZipQuestionImporter()
    package = importer.prepare_question(ZipQuestionPackage(content=zip_bytes))

    assert package.source_type == "zip"
    assert package.source_question_id == "source-123"
    assert package.question.title == "Test Question"
    assert package.question.topics == ["Statics"]
    assert package.question.qType == ["mcq"]

    files = {file.filename: file for file in package.files}
    assert "info.json" not in files
    assert files["question.html"].content == "<p>Hello</p>"
    assert files["question.html"].mime_type == "text/html"
    assert files["data.bin"].content == b"\x00\x01"


def test_zip_importer_requires_info_json() -> None:
    zip_bytes = make_zip({"question.html": b"<p>Hello</p>"})

    with pytest.raises(ValueError, match=r"info\.json"):
        ZipQuestionImporter().prepare_question(ZipQuestionPackage(content=zip_bytes))
