# --- Standard Library ---
from pathlib import Path
from typing import IO, List, Optional, Union
import json

# --- Third-Party ---
from firebase_admin import storage
from google.cloud.exceptions import NotFound
from google.cloud.storage.blob import Blob

# --- Local Modules ---
from src.api.core.logging import logger
from src.storage.base import StorageService
from src.api.service.file_service import FileService


class FirebaseStorage(StorageService):
    def __init__(self, bucket, root, base):
        logger.info("[Firebase]: Intializing firebase storage ")
        self.bucket = storage.bucket(bucket)
        # The base is the name of where the storage starts

        # This is the root of the cloud storage
        #  This is meant for things such as UCRQUestions or CalPolyQuestions
        self.root = root
        # The base would be used for specific users such as UCRQuestions/Luciano
        self.base = base

    # =========================================================================
    # Base path and metadata
    # =========================================================================
    def get_root_path(self) -> str:
        return Path(self.root).as_posix()

    def get_base_path(self) -> str:
        return (Path(self.root) / self.base).as_posix()

    def get_relative_to_base(self, target: str | Path | Blob) -> str:
        if isinstance(target, Blob):
            target = str(target.name)

        # Convert to Path
        target_path = Path(target)

        # Case 1: Absolute path inside the storage _root_path
        try:
            relative_path = target_path.relative_to(self.root)
        except ValueError:
            # Case 2: Not inside _root_path (likely already relative or external)
            relative_path = target_path
        rel_str = relative_path.as_posix()
        if not rel_str.startswith(f"{self.base}/"):
            rel_str = f"{self.base}/{rel_str}"
        return rel_str

    # =========================================================================
    # Storage path operations
    # =========================================================================

    def get_storage_path(self, target: str | Path | Blob, relative: bool = True) -> str:
        """
        The relative will always be returned
        """
        rel_str = self.get_relative_to_base(target)
        if relative:
            return rel_str

        return (Path(self.get_root_path()) / rel_str).as_posix()

    def create_storage_path(self, target: str | Path) -> str:
        target_blob = self.get_storage_path(target, relative=False)
        blob: Blob = self.bucket.blob(target_blob)
        blob.upload_from_string("")
        return str(blob.name)

    def ensure_storage_path(self, target: str | Path) -> str:
        if not self.does_storage_path_exist(target):
            logger.info("Storage Path does not exist creating one ")
            return self.create_storage_path(target)
        logger.info("Storage path exist")
        return  self.get_storage_path(target, relative=False)

    def does_storage_path_exist(self, target: str | Path) -> bool:
        target = self.get_storage_path(target, relative=False)
        blobs = list(self.bucket.list_blobs(prefix=target, max_results=1))
        blob = self.bucket.blob(target)
        has_others = len(blobs) > 0
        logger.info(f"This is the blob {blob.name} {blob.exists()}")
        if blob.exists():
            return True
        return len(blobs) > 0

    def rename_storage(self, old: str | Path, new: str | Path) -> str:
        old_path = str(old)
        new_path = str(new)

        old_blob = self.get_blob(old)

        if not old_blob.exists():
            logger.warning(f"Blob not found: {old_path}")
            return str(new_path)

        # Copy the blob to the new location
        new_blob = self.bucket.copy_blob(old_blob, self.bucket, new_path)

        # Delete the original blob
        old_blob.delete()

        logger.info(f"[FirebaseStorage] Renamed {old_path} → {new_path}")
        return str(new_blob.name)

    # =========================================================================
    # File operations: read, write, fetch
    # =========================================================================
    def read_file(
        self, target: str | Path, filename: Optional[str] = None
    ) -> bytes | None:
        if self.does_file_exist(target, filename):
            return self.get_blob(target, filename).download_as_bytes()
        return None

    def download_file(self, target: str | Path, filename: str | None = None) -> bytes:
        return super().download_file(target, filename)

    def get_file_path(
        self, target: str | Path, filename: str | None = None
    ) -> str | Path:
        return super().get_file_path(target, filename)

    def open_file_stream(self, target: str | Path, filename: str) -> IO[bytes]:
        return super().open_file_stream(target, filename)

    def upload_file(
        self,
        file_obj: IO[bytes],
        target: str | Path,
        filename: str | None = None,
        content_type: str = "application/octet-stream",
    ) -> Blob:
        destination_blob = self.get_file(target, filename)
        blob = self.bucket.blob(destination_blob)
        if isinstance(file_obj, bytes):
            blob.upload_from_string(file_obj, content_type=content_type)
        else:
            try:
                file_obj.seek(0)
            except Exception:
                pass  # not all IO objects support seek
        blob.upload_from_file(file_obj, content_type=content_type)
        return blob

    def save_file(
        self,
        target: str | Path,
        content: str | dict | List | bytes | bytearray,
        filename: str | None = None,
        overwrite: bool = True,
    ) -> Path | str:

        blob = self.get_blob(target, filename)

        if isinstance(content, (dict, list)):
            content = json.dumps(content, indent=2)
        elif isinstance(content, (bytes, bytearray)):
            content = content.decode()
        elif not isinstance(content, str):
            raise ValueError(f"Unsupported content type: {type(content)}")

        content_type = FileService().get_content_type(filename)
        blob.upload_from_string(data=content, content_type=content_type)

        return self.get_file(target, filename)

    # =========================================================================
    # Metadata operations
    # =========================================================================
    def get_metadata(self, target: str | Path, filename: str | None = None) -> dict:
        return super().get_metadata(target, filename)

    def get_public_url(
        self, target: str | Path, filename: str | None = None, expires_in: int = 3600
    ) -> str:
        return super().get_public_url(target, filename, expires_in)

    def list_file_names(self, target: str | Path) -> List[str]:
        return super().list_file_names(target)

    def list_file_paths(
        self, target: str | Path, recursive: bool = False
    ) -> List[Path]:
        return super().list_file_paths(target, recursive)

    def does_file_exist(self, target: str | Path, filename: str | None = None):
        return self.get_blob(target, filename).exists()

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

        b = self.get_blob(target, filename)
        if b.exists():
            b.delete()

    def delete_storage(self, target: str | Path) -> None:
        target = Path(self.get_storage_path(target)).as_posix()
        for blob in self.bucket.list_blobs(prefix=target):
            try:
                logger.info("Deleting %s", blob.name)
                blob.delete()
            except NotFound:
                logger.error("Blob not found, nothing to delete.")
        return None

    def get_file(self, target: str | Path, filename: str | None = None) -> str:
        target = self.get_storage_path(target, relative=True)
        if filename:
            target = (Path(target) / filename).as_posix()
        return target

    def hard_delete(self):
        blobs = self.bucket.list_blobs(prefix=str(self.base))
        try:
            for blob in blobs:
                logger.info("Deleting %s", blob.name)
                blob.delete()
        except NotFound:
            logger.warning("Base directory not found, nothing to delete.")

    # def get_blob(self, blob_name: str | Path, filename: Optional[str] = None) -> Blob:
    #     if isinstance(blob_name, Path):
    #         blob_name = blob_name.as_posix()
    #     if not filename:
    #         return self.bucket.blob(blob_name)
    #     return self.bucket.blob(self.get_file(blob_name, filename))

    def list_files(self, target: str | Path) -> List[str]:
        # Always use relative path inside cloud bucket
        target = Path(self.get_storage_path(target, relative=True)).as_posix()

        blobs = self.bucket.list_blobs(prefix=target)

        filenames = []
        for b in blobs:
            name = b.name

            # Skip the folder prefix (GCS returns folder entries too)
            if name.endswith("/"):
                continue
            # Skip the acutal folder name
            if name == target:
                continue

            # Extract only the filename
            filename = Path(name).name
            filenames.append(filename)

        return filenames
