import base64
import mimetypes
from collections.abc import Callable
from pathlib import PurePosixPath
from typing import Any

from backend.storage.schema import FileData

_TEXT_LIKE_MIME_TYPES = {
    "application/json",
    "application/javascript",
    "application/typescript",
    "application/xml",
    "text/javascript",
}


def guess_mime_type(filename: str, fallback: str = "application/octet-stream") -> str:
    mime_type, _ = mimetypes.guess_type(PurePosixPath(filename).name)
    return mime_type or fallback


def is_text_like_mime_type(mime_type: str) -> bool:
    return mime_type.startswith("text/") or mime_type in _TEXT_LIKE_MIME_TYPES


def normalize_filedata(
    filename: str,
    content: Any,
    *,
    mime_type: str | None = None,
    fallback_mime_type: str = "application/octet-stream",
    text_errors: str = "strict",
    verify_image: Callable[[str, bytes], None] | None = None,
) -> FileData:
    resolved_mime_type = mime_type or guess_mime_type(
        filename,
        fallback=fallback_mime_type,
    )

    if isinstance(content, bytearray):
        content = bytes(content)

    if isinstance(content, bytes):
        if resolved_mime_type.startswith("image/"):
            if verify_image is not None:
                verify_image(filename, content)
            content = base64.b64encode(content).decode("ascii")
        elif is_text_like_mime_type(resolved_mime_type):
            content = content.decode("utf-8", errors=text_errors)

    return FileData(
        filename=filename,
        content=content,
        mime_type=resolved_mime_type,
    )
