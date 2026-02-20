from pathlib import Path
from typing import IO, List, Optional
import json
from firebase_admin import storage
from google.cloud.storage.blob import Blob
from src.core.logging import logger
from .base import StorageService
from src.service.file_service.file_service import FileService
from . import TARGET
from src.core.firebase import initialize_firebase_app
import os


def is_emulator():
    return "FIREBASE_STORAGE_EMULATOR_HOST" in os.environ


class FirebaseStorage(StorageService):
    def __init__(self, bucket):
        logger.info("[Firebase]: Intializing firebase storage ")
        initialize_firebase_app()
        self.bucket = storage.bucket(bucket)

    # Basic stuff
    def create_storage_path(self, target: TARGET) -> str:
        blob: Blob = self.bucket.blob(target)
        blob.upload_from_string("")
        return str(blob.name)

    def does_storage_path_exist(self, target: TARGET) -> bool:
        blob = self.bucket.get_blob(target)
        if blob:
            return True
        else:
            return False

    def copy_storage(self, old: str | Path, new: str | Path) -> str:
        old_blob = self.bucket.get_blob(old)
        new_blob = self.bucket.copy_blob(old_blob, self.bucket, new)
        assert old_blob
        old_blob.delete()
        logger.info(f"[FirebaseStorage] Copied {old} → {new}")
        return str(new_blob.name)

    def ensure_storage_path_exist(self, target: TARGET) -> str:
        if not self.does_storage_path_exist(target):
            logger.info("Storage Path does not exist creating one ")
            return self.create_storage_path(target)
        logger.info("Storage path exist")
        if isinstance(target, Blob):
            return str(target.name)
        if isinstance(target,Path):
            return target.as_posix()
        return target

    def rename_storage(self, old: TARGET, new: TARGET) -> str:
        if not self.does_storage_path_exist(old):
            raise ValueError("Old blob does not exist")

        old_blob = self.bucket.blob(old)
        old_content = old_blob.download_as_bytes()
        renamed_blob = self.bucket.blob(new)
        renamed_blob.upload_from_string(old_content)
        old_blob.delete()

        return str(renamed_blob.name)

    # =========================================================================
    # File operations: read, write, fetch
    # =========================================================================
    def read_file(
        self, target: str | Path, filename: Optional[str] = None
    ) -> bytes | None:
        try:
            file = self.get_file_path(target, filename)
            blob = self.bucket.get_blob(file)
            if blob is None:
                return None
            return blob.download_as_bytes()

        except Exception as e:
            raise ValueError(f"Could not read contents from blob {e}")

    def download_file(
        self, target: str | Path, filename: str | None = None
    ) -> bytes | None:
        return self.read_file(target, filename)

    def get_file_path(self, target: str | Path, filename: str | None = None) -> str:
        if filename:
            return (Path(target) / filename).as_posix()
        return Path(target).as_posix()

    def open_file_stream(self, target: str | Path, filename: str) -> IO[bytes]:
        return super().open_file_stream(target, filename)

    def upload_file(
        self,
        file_obj: IO[bytes] | bytes,
        target: str | Path,
        filename: str | None = None,
        content_type: str = "application/octet-stream",
    ) -> Blob:
        """
        Upload a file to Firebase Storage. Supports both raw bytes and file-like objects.
        """
        target = Path(target)
        # Determine final file path
        if filename:
            file_path = target / filename
        else:
            if not target.is_file():
                raise ValueError("A filename must be provided for non-file targets.")
            filename = target.name
            file_path = target
        blob = self.bucket.blob(file_path.as_posix())

        # --- Case 1: raw bytes passed directly
        if isinstance(file_obj, (bytes, bytearray)):
            blob.upload_from_string(
                data=file_obj,
                content_type=content_type,
            )
            return blob

        # --- Case 2: file-like object (e.g., BytesIO, uploaded file)
        try:
            file_obj.seek(0)  # type: ignore
        except Exception:
            pass  # ignore if stream doesn't support seeking

        blob.upload_from_file(
            file_obj,
            content_type=content_type,
        )

        return blob

    def save_file(
        self,
        target: str | Path,
        content: str | dict | List | bytes | bytearray,
        filename: str | None = None,
        overwrite: bool = True,
    ) -> str:

        # Validate inputs
        if target is None:
            raise ValueError("Target path cannot be None")
        if content is None:
            raise ValueError("Content cannot be None")

        try:
            target = self.ensure_storage_path_exist(target)
        except Exception as e:
            raise IOError(f"Failed to ensure storage path exists: {e}")

        if target.endswith("/"):
            if not filename:
                raise ValueError("Filename must be provided when target is a directory")
            file_path = f"{target}/{filename}"
        else:
            file_path = target

        try:
            # Create Firebase blob reference
            blob = self.bucket.blob(file_path)

            # Normalize content
            if isinstance(content, (dict, list)):
                content_bytes = json.dumps(content, indent=2).encode("utf-8")

            elif isinstance(content, str):
                content_bytes = content.encode("utf-8")

            elif isinstance(content, (bytes, bytearray)):
                content_bytes = bytes(content)

            else:
                raise ValueError(f"Unsupported content type: {type(content)}")

            # Content type detection
            content_type = FileService().get_content_type(file_path.split("/")[-1])

            # Upload to Firebase
            blob.upload_from_string(
                data=content_bytes,
                content_type=content_type,
            )

            # Return file path or URI
            return self.get_file_path(target, filename)

        except Exception as e:
            raise ValueError(f"Could not save file '{filename}': {e}") from e

    # =========================================================================
    # Metadata operations
    # =========================================================================
    def get_metadata(self, target: str | Path, filename: str | None = None) -> dict:
        return super().get_metadata(target, filename)

    def get_public_url(
        self, target: str | Path, filename: str | None = None, expires_in: int = 3600
    ) -> str:
        return super().get_public_url(target, filename, expires_in)

    # =========================================================================
    # File listing, checks, existence
    # =========================================================================

    def list_file_names(self, target: str | Path) -> List[str]:
        return [
            Path(f).name
            for f in self.list_file_paths(target, recursive=False)
            if not f.endswith("/") and "." in Path(f).name
        ]

    def list_file_paths(self, target: str | Path, recursive: bool = False) -> List[str]:
        target = Path(target).as_posix()

        # Ensure consistent prefix ending
        if not target.endswith("/"):
            target = target + "/"

        blobs = list(self.bucket.list_blobs(prefix=target))

        if not recursive:
            # Only return immediate children (no nested directories)
            result = []
            for blob in blobs:
                relative = blob.name[len(target) :]  # strip prefix
                if "/" not in relative:  # ensure not nested
                    result.append(blob.name)
            return result

        # Recursive: include everything under this prefix
        return [blob.name for blob in blobs]

    def does_file_exist(self, target: str | Path, filename: str | None = None):
        return Path(self.get_file_path(target, filename)).exists()

    # =========================================================================
    # Mutating operations: copy, move, delete
    # =========================================================================
    def copy_file(
        self,
        source_target: str | Path,
        source_filename: str,
        dest_target: str | Path,
        dest_filename: str | None = None,
    ) -> Path | Blob:
        return super().copy_file(
            source_target, source_filename, dest_target, dest_filename
        )

    def move_file(
        self,
        source_target: str | Path,
        source_filename: str,
        dest_target: str | Path,
        dest_filename: str | None = None,
    ) -> Path | Blob:
        return super().move_file(
            source_target, source_filename, dest_target, dest_filename
        )

    def delete_file(self, target: str | Path, filename: str | None = None) -> None:
        target = self.get_file_path(target, filename)
        blob = self.bucket.get_blob(target)
        if blob and blob.exists():
            blob.delete()

    def delete_storage(self, target: str | Path) -> None:
        file_paths = self.list_file_paths(target)
        for f in file_paths:
            self.delete_file(f)

    def hard_delete(self, target=None) -> None:
        blobs = self.bucket.list_blobs()
        for blob in blobs:
            blob.delete()
