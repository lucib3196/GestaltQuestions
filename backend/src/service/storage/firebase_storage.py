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
        if isinstance(target, Path):
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
    def save_file(
        self,
        target: str | Path,
        content: str | dict | List | bytes | bytearray,
        overwrite: bool = True,
    ) -> str:
        if isinstance(target, Path):
            target = target.as_posix()

        try:
            # Create Firebase blob reference
            blob = self.bucket.blob(target)

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
            content_type = FileService().get_content_type(target.split("/")[-1])

            # Upload to Firebase
            blob.upload_from_string(
                data=content_bytes,
                content_type=content_type,
            )

            # Return file path or URI
            return target

        except Exception as e:
            raise ValueError(f"Could not save file: {e}") from e

    def read_file(
        self, target: str | Path
    ) -> bytes | None:
        try:
            blob = self.bucket.get_blob(target)
            if blob is None:
                return None
            return blob.download_as_bytes()

        except Exception as e:
            raise ValueError(f"Could not read contents from blob {e}")

    def download_file(
        self, target: str | Path, 
    ) -> bytes | None:
        return self.read_file(target)

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
        if isinstance(target,Path):
            target = target.as_posix()
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
