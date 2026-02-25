from pathlib import Path
from typing import List, Sequence
from firebase_admin import storage
from google.cloud.storage.blob import Blob
from src.core.firebase import initialize_firebase_app

from .base import Storage
from . import STORAGE_TYPE,logger
from typing import Literal
from typing import cast



class FbStorage(Storage):

    def __init__(
        self,
        bucket,
    ):
        logger.info("[Firebase]: Intializing firebase storage ")
        initialize_firebase_app()
        self.bucket = storage.bucket(bucket)
        self.set_storage_type()

    def set_storage_type(self) -> Literal["cloud"] | Literal["local"]:
        self.mode = "cloud"
        return "cloud"

    def get_storage_type(self) -> Literal["cloud"] | Literal["local"]:
        return cast(STORAGE_TYPE, self.mode)

    def exists(self, target: str | Path | Blob) -> bool:
        key = self._to_blob_key(target)
        if key.endswith("/"):
            return self._exists_dir(key)
        return self._exists_file(key)

    def create_dir(self, target: str ) -> str :
        key = self._to_blob_key(target).rstrip("/") + "/"
        blob: Blob = self.bucket.blob(key)

        # Upload empty string
        blob.upload_from_string(data="")
        return str(blob.name)

    def write(
        self,
        target: str ,
        data: str | dict | List | bytes | bytearray,
        *,
        overwrite: bool = True,
    ) -> str :
        key = self._to_blob_key(target).rstrip("/")
        blob: Blob = self.bucket.blob(key)
        # Data can either be string or bytes. Since we are passing in bytes this must
        ## be application/octetstream
        blob.upload_from_string(
            self._normalize_content(data), content_type="application/octet-stream"
        )
        return str(blob.name)

    def read(self, target: str | Path | Blob) -> bytes:
        key = self._to_blob_key(target).rstrip("/")
        if self._exists_file(key):
            return self.bucket.blob(key).download_as_bytes()
        else:
            raise ValueError("Cannot read blob. Blob is None")

    def delete(self, target: str | Path | Blob) -> None:
        key = self._to_blob_key(target)
        if key.endswith("/"):
            for blob in self.bucket.list_blobs(prefix=key):
                blob.delete()
            return

        blob = self.bucket.blob(key.rstrip("/"))
        if blob.exists():
            blob.delete()

    def list(
        self, target: str | Path | Blob, *, recursive: bool = False
    ) -> Sequence[str]:

        norm = self._to_blob_key(target)
        blobs = list(self.bucket.list_blobs(prefix=norm))

        results = []

        for blob in blobs:
            relative = blob.name[len(norm) :]

            # Skip directory blob itself
            if not relative:
                continue

            if recursive:
                results.append(relative)
            else:
                if "/" not in relative:
                    results.append(relative)

        return results

        # Recursive: include everything under this prefix
        files = [blob.name[len(norm) :] for blob in blobs]
        # Remove the prefix from being included
        files.remove(norm)
        return files

    def copy(
        self,
        source: str | Path | Blob,
        destination: str | Path | Blob,
    ) -> str:

        source_key = self._to_blob_key(source)
        dest_key = self._to_blob_key(destination)

        source_blob = self.bucket.get_blob(source_key)

        if source_blob is None or not source_blob.exists():
            raise ValueError("Source blob does not exist")

        # Download content
        content = source_blob.download_as_bytes()

        # Create destination blob
        dest_blob = self.bucket.blob(dest_key)

        # Overwrite safely
        dest_blob.upload_from_string(content)

        return dest_key

    def move(self, source: str | Path | Blob, destination: str | Path | Blob) -> str:
        try:
            source_prefix = self._to_blob_key(source)
            dest_prefix = self._to_blob_key(destination)

            if not source_prefix.endswith("/"):
                source_prefix += "/"
            if not dest_prefix.endswith("/"):
                dest_prefix += "/"

            blobs = list(self.bucket.list_blobs(prefix=source_prefix))

            if not blobs:
                raise ValueError("Source path does not exist or is empty")

            for blob in blobs:
                # Compute new blob name
                new_name = blob.name.replace(source_prefix, dest_prefix, 1)

                # Use native GCS copy (faster, server-side)
                new_blob = self.bucket.copy_blob(blob, self.bucket, new_name)

                # Delete original
                blob.delete()

            return dest_prefix

        except Exception as e:
            raise ValueError(f"Failed to move directory: {e}")

    def _hard_delete(self):
        blobs = self.bucket.list_blobs()
        for blob in blobs:
            blob.delete()

    # Custom methods

    def _to_blob_key(self, value: str | Path | Blob) -> str:
        """
        Convert input to a cloud object key without filesystem normalization.
        Keep trailing "/" so directory marker blobs remain addressable.
        """
        if isinstance(value, Blob):
            if not value.name:
                raise ValueError(f"Cannot determine blob: {value}")
            key = value.name
        else:
            key = str(value)
        return key.replace("\\", "/")

    def _exists_file(self, target: str | Path | Blob) -> bool:
        key = self._to_blob_key(target).rstrip("/")
        if not key:
            return False
        return bool(self.bucket.get_blob(key))

    def _exists_dir(self, target: str | Path | Blob) -> bool:
        key = self._to_blob_key(target).rstrip("/") + "/"
        marker_blob = self.bucket.get_blob(key)
        if marker_blob is not None:
            return True
        return any(self.bucket.list_blobs(prefix=key, max_results=1))

    def _is_empty_dir(self, target: str | Path | Blob) -> bool:
        key = self._to_blob_key(target).rstrip("/") + "/"
        marker_blob = self.bucket.get_blob(key)
        if marker_blob is None:
            return False
        blobs = self.bucket.list_blobs(prefix=key)
        return all(blob.name == key for blob in blobs)
