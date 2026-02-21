from pathlib import Path
from typing import Optional, List, IO
from google.cloud.storage.blob import Blob
from src.core import logger
from . import TARGET


class StorageService:
    """
    Abstract interface for storage backends (filesystem, cloud, hybrid).

    Subclasses must implement all core operations for creating directories,
    uploading, reading, listing, copying, moving, and deleting files associated
    with a given storage target.
    """

    # Basic creation and getting
    def create_storage_path(self, target: TARGET) -> str:
        raise NotImplementedError("create_storage_path must be implemented")

    def does_storage_path_exist(self, target: TARGET) -> bool:
        raise NotImplementedError(
            "does_storage_path_exist must be implemented by parent"
        )

    def get_storage_path(self, target: TARGET) -> str:
        raise NotImplementedError("get_storage_path must be implemented by parent")

    def ensure_storage_path_exist(self, target: TARGET) -> str:
        raise NotImplementedError(
            "ensure_storage_path_exist must be implemented by parent"
        )

    def rename_storage(self, old: str | Path, new: str | Path) -> str:
        raise NotImplementedError("rename_storage must be implemented by parent")
    def get_file_path(
        self, target: str | Path, filename: Optional[str] = None
    ) -> str | Path:
        """Return absolute path or backend URI to a file."""
        raise NotImplementedError

    # =========================================================================
    # File operations: read, write, fetch
    # =========================================================================
    def read_file(
        self, target: str | Path, filename: Optional[str] = None
    ) -> Optional[bytes]:
        """Return raw byte content of a file."""
        raise NotImplementedError

    def download_file(
        self, target: str | Path, filename: Optional[str] = None
    ) -> bytes | None:
        """
        Explicit download operation—separate from read_file for clarity.
        Useful for cloud backends that require a distinct GET operation.
        """
        raise NotImplementedError

    

    def save_file(
        self,
        target: str | Path,
        content: str | dict | list | bytes | bytearray,
        filename: Optional[str] = None,
        overwrite: bool = True,
    ) -> Path | str:
        raise NotImplementedError

    # =========================================================================
    # Metadata operations
    # =========================================================================
    def get_metadata(self, target: str | Path, filename: str | None = None) -> dict:
        """
        Return metadata for a file (size, checksum, timestamps, etc.).
        Cloud providers typically return a rich metadata object.
        """
        raise NotImplementedError

    def get_public_url(
        self,
        target: str | Path,
        filename: str | None = None,
        expires_in: int = 3600,
    ) -> str:
        """
        Return a public or signed URL for downloading a file.
        Required for cloud backends (S3/GCS).
        """
        raise NotImplementedError

    # =========================================================================
    # File listing, checks, existence
    # =========================================================================
    def list_file_names(self, target: str | Path) -> List[str]:
        raise NotImplementedError

    def list_file_paths(self, target: str | Path, recursive: bool = False) -> List[str]:
        raise NotImplementedError

    def does_file_exist(self, target: str | Path, filename: str | None = None) -> bool:
        raise NotImplementedError

    def iterate(self, target: str | Path, recursive: bool = False):
        raise NotImplementedError

    # =========================================================================
    # Mutating operations: copy, move, delete
    # =========================================================================
    def copy_file(
        self,
        source_target: str | Path,
        source_filename: str,
        dest_target: str | Path,
        dest_filename: Optional[str] = None,
    ) -> Path | Blob:
        """Copy a file between storage locations."""
        raise NotImplementedError

    def copy_storage(self, old: str | Path, new: str | Path) -> str:
        """Copy the whole storage between storage locations."""
        raise NotImplementedError

    def move_file(
        self,
        source_target: str | Path,
        source_filename: str,
        dest_target: str | Path,
        dest_filename: Optional[str] = None,
    ) -> Path | Blob:
        """Move or rename a file."""
        raise NotImplementedError

    def delete_file(self, target: str | Path, filename: str | None = None) -> None:
        raise NotImplementedError

    def delete_storage(self, target: str | Path) -> None:
        raise NotImplementedError

    def hard_delete(self, target: TARGET | None) -> None:
        """Destructive: remove all storage contents for this backend."""
        raise NotImplementedError
