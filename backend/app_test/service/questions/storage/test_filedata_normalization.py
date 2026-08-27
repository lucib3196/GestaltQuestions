import base64

import pytest

from backend.storage.filedata import (
    guess_mime_type,
    is_text_like_mime_type,
    normalize_filedata,
)


def test_normalize_filedata_decodes_text_bytes() -> None:
    file = normalize_filedata("question.html", b"<p>Hello</p>")

    assert file.filename == "question.html"
    assert file.content == "<p>Hello</p>"
    assert file.mime_type == "text/html"


def test_normalize_filedata_preserves_binary_bytes() -> None:
    file = normalize_filedata("data.bin", b"\x00\x01")

    assert file.content == b"\x00\x01"
    assert file.mime_type == "application/octet-stream"


def test_normalize_filedata_base64_encodes_image_bytes() -> None:
    raw = b"image-bytes"
    file = normalize_filedata("diagram.png", raw)

    assert file.content == base64.b64encode(raw).decode("ascii")
    assert file.mime_type == "image/png"


def test_normalize_filedata_verifies_image_content() -> None:
    calls: list[tuple[str, bytes]] = []

    def verify_image(filename: str, content: bytes) -> None:
        calls.append((filename, content))

    normalize_filedata("diagram.png", b"image-bytes", verify_image=verify_image)

    assert calls == [("diagram.png", b"image-bytes")]


def test_normalize_filedata_uses_replace_error_strategy() -> None:
    file = normalize_filedata(
        "notes.txt",
        b"valid \xff invalid",
        text_errors="replace",
    )

    assert file.content == "valid \ufffd invalid"


def test_normalize_filedata_raises_for_strict_decode_failures() -> None:
    with pytest.raises(UnicodeDecodeError):
        normalize_filedata("notes.txt", b"valid \xff invalid")


def test_guess_mime_type_uses_fallback() -> None:
    assert guess_mime_type("unknown", fallback="text/plain") == "text/plain"


def test_is_text_like_mime_type_matches_text_and_known_structured_types() -> None:
    assert is_text_like_mime_type("text/plain")
    assert is_text_like_mime_type("application/json")
    assert not is_text_like_mime_type("application/octet-stream")
