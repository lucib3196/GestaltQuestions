# --- Standard Library ---
import json
from pathlib import Path
from typing import IO, List, Union
import shutil

# --- Internal ---
from .base import StorageService
from src.core import logger
from google.cloud.storage.blob import Blob
from . import TARGET


class LocalStorageService(StorageService):
    """
    Local storage implementation of `StorageService`.

    and download operations.
    """

    # -------------------------------------------------------------------------
    # Initialization / Lifecycle
    # -------------------------------------------------------------------------

    def __init__(
        self,
    ):
        """
        Initialize the local storage service with a base_path directory.

        Args:
            _root_path: Path or string specifying the _root_path storage directory.
        """

    def create_storage_path(self, target: TARGET) -> str:
        """
        Create a directory for the given identifier if it does not exist.

        Args:
            identifier: Unique identifier for the stored resource.

        Returns:
            Path: Path to the created directory.
        """
        if isinstance(target, Blob):
            raise ValueError("Local storage cannot handle blobs")
        storage = Path(target).resolve()
        if storage.is_dir:
            storage.mkdir(parents=True, exist_ok=True)
        return storage.as_posix()

    def ensure_storage_path_exist(self, target: TARGET) -> str:
        if not self.does_storage_path_exist(target):
            logger.debug("Storage Path does not exist creating one ")
            return self.create_storage_path(target)
        if not isinstance(target, (str, Path)):
            raise ValueError("Local storage cannot handle blobs ")
        return Path(target).as_posix()

    def does_storage_path_exist(self, target: TARGET) -> bool:
        """
        Check if a directory exists for a given identifier.

        Args:
            identifier: Unique identifier for the stored resource.

        Returns:
            bool: True if the directory exists, False otherwise.
        """
        if not isinstance(target, (str, Path)):
            raise ValueError("Local storage cannot handle blobs ")
        return Path(target).exists()

    def rename_storage(self, old: str | Path, new: str | Path) -> str:
        old_path = Path(old)
        new_path = Path(new)

        logger.debug(f"[LocalStorage]: Renaming {old_path} -> {new_path}")

        if not old_path.exists():
            raise FileNotFoundError(f"Cannot rename. Source does not exist: {old_path}")

        # Ensure destination parent exists
        new_path.parent.mkdir(parents=True, exist_ok=True)

        old_path.rename(new_path)

        logger.debug("[LocalStorage]: Rename successful")

        return new_path.as_posix()

    # =========================================================================
    # File operations: read, write, fetch
    # =========================================================================

    def read_file(
        self, target: str | Path, filename: str | None = None
    ) -> bytes | None:
        """
        Retrieve a file's contents by its identifier and filename.

        Args:
            identifier: Unique identifier for the stored resource.
            filename: Name of the file.

        Returns:
            bytes | None: File contents if found, otherwise None.
        """
        target = Path(self.get_file_path(target, filename))

        if target.exists() and target.is_file():
            return target.read_bytes()
        return None

    def download_file(
        self, target: str | Path, filename: str | None = None
    ) -> bytes | None:
        return self.read_file(target, filename)

    def get_file_path(self, target: str | Path, filename: str | None = None) -> str:
        target = Path(target)
        if filename:
            target = target / filename
            return target.as_posix()
        else:
            return target.as_posix()

    def get_file(
        self, target: str | Path, filename: str | None = None, recursive: bool = False
    ) -> str:
        """
        Build the absolute file path for a given identifier and filename.

        Args:
            identifier: Unique identifier for the stored resource.
            filename: Name of the file.

        Returns:
            Path: Full path to the file.
        """
        if filename:
            path = Path(target) / filename
            return path.as_posix()

        else:
            return Path(target).as_posix()

    def save_file(
        self,
        target: str | Path,
        content: Union[str, dict, list, bytes, bytearray],
        filename: str | None = None,
        overwrite: bool = True,
    ) -> Path:
        """
        Save a file to the given target directory.

        Args:
            target: Directory to save into. Can be absolute or relative.
            filename: Target filename.
            content: Content to write.
            overwrite: Whether to overwrite an existing file.

        Returns:
            Path: The full path to the saved file.

        Raises:
            ValueError: If arguments are invalid or file exists without overwrite permission.
            IOError: If file write operation fails.
        """
        # Validate inputs
        if target is None:
            raise ValueError("Target path cannot be None")
        if content is None:
            raise ValueError("Content cannot be None")

        try:
            target = Path(self.ensure_storage_path_exist(target))
        except Exception as e:
            raise IOError(f"Failed to ensure storage path exists: {e}")

        # Determine file path
        if target.is_dir():
            if not filename:
                raise ValueError("Filename must be provided when target is a directory")
            file_path = (target / filename).resolve()
        elif target.is_file():
            file_path = target
        else:
            raise ValueError(f"Target path is invalid or inaccessible: {target}")

        # Handle overwrite rules
        if file_path.exists() and not overwrite:
            raise ValueError(
                f"File already exists and overwrite is disabled: {file_path}"
            )

        # Ensure parent directory exists
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise IOError(f"Failed to create parent directories: {e}")

        # Write depending on content type
        try:
            if isinstance(content, (dict, list)):
                file_path.write_text(json.dumps(content, indent=2))
            elif isinstance(content, (bytes, bytearray)):
                file_path.write_bytes(content)
            else:
                logger.debug("Saving text %s to path %s", content, file_path)
                file_path.write_text(str(content), encoding="utf-8")
        except Exception as e:
            raise IOError(f"Failed to write file {file_path}: {e}")

        return file_path

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
        target = Path(target)
        if not target.exists():
            logger.warning(f"Target path does not exist for {target}")
            return []
        if recursive:
            return [f.as_posix() for f in target.rglob("*")]
        else:
            return [f.as_posix() for f in target.iterdir()]

    def does_file_exist(self, target: str | Path, filename: str | None = None) -> bool:
        return super().does_file_exist(target, filename)

    def iterate(self, target: str | Path, recursive: bool = False):
        target_path = Path(target)
        return target_path.rglob("*") if recursive else target_path.iterdir()

    # =========================================================================
    # Mutating operations: copy, move, delete
    # =========================================================================
    def copy_storage(self, old: str | Path, new: str | Path) -> str:
        old = Path(old)
        new = Path(new)

        logger.debug(f"[LocalStorage]: Copying {old} -> {new}")
        if not old.exists():
            raise FileNotFoundError(f"Source path does not exist: {old}")
        new.mkdir(parents=True, exist_ok=True)
        for item in old.iterdir():
            dest = new / item.name
            logger.info(f"This is the dest {dest}")

            if item.is_dir():
                if not dest.exists():
                    shutil.copytree(item, dest)
            else:
                shutil.copy2(item, dest)
        logger.debug("[LocalStorage]: Content copy completed successfully")
        return new.as_posix()

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
        """
        Delete a specific file within a resource directory.

        Args:
            identifier: Unique identifier for the stored resource.
            filename: Name of the file to delete.
        """
        target = Path(self.get_file_path(target, filename))
        logger.debug(f"[LOCAL STORAGE] Attempting to delete [target]: {target}")
        if target and target.exists():
            logger.debug(f"[LOCAL STORAGE] Deleting file {target}")
            target.unlink()
        else:
            logger.warning("File does not exist")

    def delete_storage(self, target: str | Path) -> None:
        """
        Delete a storage directory and all its contents.

        Args:
            identifier: Unique identifier for the stored resource.
        """
        target = Path(target)
        logger.debug(f"Target to delete {target}")
        if target.exists():
            for f in target.iterdir():
                if f.is_file():
                    f.unlink()
            shutil.rmtree(target)

    def hard_delete(self, target: TARGET | None) -> None:
        if not target:
            raise ValueError("Target must be passed")
        if not isinstance(target, (str, Path)):
            raise ValueError("Target of type Blob not allowed")
        target = Path(target)
        if target.exists():
            for f in target.iterdir():
                if f.is_file():
                    f.unlink()
            shutil.rmtree(target)
