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
    def __init__(self, bucket, base):
        logger.info("[Firebase]: Intializing firebase storage ")
        self.bucket = storage.bucket(bucket)
        # The base is the name of where the storage starts
        self.base = base

    def normalize_path(self, target: str | Path) -> str:
        target_path = Path(target)
        try:
            relative_path = target_path.relative_to(self.base)
        except ValueError:
            # Case 2: Not inside root (likely already relative or external)
            relative_path = target_path

        rel_str = relative_path.as_posix()
        if not rel_str.startswith(f"{self.base}/"):
            rel_str = f"{self.base}/{rel_str}"
        return rel_str

    def get_relative_to_base(self, target: str | Path | Blob) -> str:
        if isinstance(target, Blob):
            target = str(target.name)
        target_path = Path(target)
        rel_str = target_path.as_posix()
        if not rel_str.startswith(f"{self.base}/"):
            rel_str = f"{self.base}/{rel_str}"
        return rel_str

    def get_base_path(self) -> str:
        return Path(self.base).as_posix()

    def get_storage_path(self, target: str | Path | Blob, relative: bool = True) -> str:
        """
        The relative will always be returned
        """
        # --- Build the full absolute path ---
        return self.get_relative_to_base(target)

    def create_storage_path(self, target: str | Path) -> str:
        target_blob = self.get_storage_path(target)
        blob: Blob = self.bucket.blob(target_blob)
        blob.upload_from_string("")
        return str(blob.name)

    def does_storage_path_exist(self, target: str | Path) -> bool:
        target = self.get_storage_path(target, relative=True)
        blobs = list(self.bucket.list_blobs(prefix=target, max_results=1))
        blob = self.bucket.blob(target)
        if blob.exists():
            return True
        return len(blobs) > 0

    def get_file(self, target: str | Path, filename: str | None = None) -> str:
        target = self.get_storage_path(target, relative=True)
        if filename:
            target = (Path(target) / filename).as_posix()
        return target

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
        filename: str,
        content: Union[str, dict, list, bytes, bytearray],
        overwrite: bool = True,
    ) -> str:
        """
        Save a file to Firebase storage.

        Dicts/lists are serialized as JSON. Bytes/bytearray are decoded.
        """
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

    def does_file_exist(self, target_path: str | Path, filename: str | None):
        return self.get_blob(target_path, filename).exists()

    def read_file(
        self, target: str | Path, filename: Optional[str] = None
    ) -> bytes | None:
        if self.does_file_exist(target, filename):
            return self.get_blob(target, filename).download_as_bytes()
        return None

    def get_blob(self, blob_name: str | Path, filename: Optional[str] = None) -> Blob:
        if isinstance(blob_name, Path):
            blob_name = blob_name.as_posix()
        if not filename:
            return self.bucket.blob(blob_name)
        return self.bucket.blob(self.get_file(blob_name, filename))

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

    def delete_storage(self, target: str | Path) -> None:
        target = Path(self.get_storage_path(target)).as_posix()
        for blob in self.bucket.list_blobs(prefix=target):
            try:
                logger.info("Deleting %s", blob.name)
                blob.delete()
            except NotFound:
                logger.error("Blob not found, nothing to delete.")
        return None

    def delete_file(self, target: str | Path, filename: str | None = None) -> None:

        b = self.get_blob(target, filename)
        if b.exists():
            b.delete()

    def hard_delete(self):
        blobs = self.bucket.list_blobs(prefix=str(self.base))
        try:
            for blob in blobs:
                logger.info("Deleting %s", blob.name)
                blob.delete()
        except NotFound:
            logger.warning("Base directory not found, nothing to delete.")

    def rename_storage(self, old: str | Path, new: str | Path) -> str:
        """
        Rename a file (blob) in Firebase Storage by copying it to a new path
        and deleting the old one.

        Args:
            old (str | Path): The current path of the blob in Firebase Storage.
            new (str | Path): The desired new path of the blob.

        Returns:
            str: The new path after renaming.
        """
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
