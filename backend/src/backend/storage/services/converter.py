from typing import ClassVar, cast

# --- Third-Party ---
from fastapi import UploadFile

from backend.core import logger
from backend.storage.exceptions import (
    FileContentDecodeError,
    FileConverterError,
    FileReadError,
    FileTooLargeError,
    InvalidUploadFileError,
    UnsupportedFileInputError,
)
from backend.storage.filedata import normalize_filedata
from backend.storage.schema import FILE, FileData


class UploadFileDataConverter:
    """Converts UploadFile/FileData inputs into normalized FileData."""

    _CONTENT_TYPE_MAPPING: ClassVar[dict[str, str]] = {
        # Text
        ".txt": "text/plain",
        ".csv": "text/csv",
        ".json": "application/json",
        ".xml": "application/xml",
        # Web
        ".html": "text/html",
        ".htm": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".ts": "application/typescript",
        ".jsx": "text/jsx",
        ".tsx": "text/tsx",
        # Images
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/vnd.microsoft.icon",
        ".webp": "image/webp",
        # Documents
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".xls": "application/vnd.ms-excel",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        # Code
        ".py": "text/x-python",
        ".java": "text/x-java-source",
        ".c": "text/x-c",
        ".cpp": "text/x-c++",
        ".h": "text/x-c",
        ".hpp": "text/x-c++",
        # Compressed
        ".zip": "application/zip",
        ".tar": "application/x-tar",
        ".gz": "application/gzip",
        ".rar": "application/vnd.rar",
        ".7z": "application/x-7z-compressed",
    }

    def __init__(
        self,
        max_file_size_mb: int = 5,  # Maximum file size (in megabytes)
    ) -> None:
        self.max_file_size = max_file_size_mb * 1024 * 1024

    async def convert_to_filedata(self, file: FILE) -> FileData:
        try:
            if isinstance(file, FileData):
                return file

            if isinstance(file, UploadFile) or hasattr(file, "file"):
                logger.debug("Received file %s", file)
                upload_file = cast(UploadFile, file)
                await self._validate_upload_file(upload_file)
                await self._validate_upload_file_size(upload_file)

                filename = upload_file.filename or "untitled.txt"

                try:
                    raw = await upload_file.read()
                except Exception as e:
                    raise FileReadError(
                        f"Failed reading uploaded file content for '{filename}'"
                    ) from e

                try:
                    return normalize_filedata(
                        filename,
                        raw,
                        fallback_mime_type="text/plain",
                    )
                except UnicodeDecodeError as e:
                    raise FileContentDecodeError(
                        f"Could not decode '{filename}' as UTF-8 text"
                    ) from e

            raise UnsupportedFileInputError(
                f"Unsupported file input type: {type(file).__name__}"
            )
        except (
            InvalidUploadFileError,
            FileTooLargeError,
            FileReadError,
            FileContentDecodeError,
            UnsupportedFileInputError,
        ):
            raise
        except Exception as e:
            raise FileConverterError(
                "Unexpected error while converting file to FileData"
            ) from e

    async def _validate_upload_file_size(self, file: UploadFile) -> UploadFile:
        contents = await file.read()
        if len(contents) > self.max_file_size:
            raise FileTooLargeError(
                f"{file.filename} exceeds {self.max_file_size} bytes"
            )
        await file.seek(0)
        return file

    @staticmethod
    async def _validate_upload_file(file: UploadFile) -> UploadFile:
        if not file.filename:
            raise InvalidUploadFileError("UploadFile does not include a filename")
        return file


