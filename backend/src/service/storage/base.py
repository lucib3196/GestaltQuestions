from pathlib import Path
from typing import Optional, List, Sequence, Union
from google.cloud.storage.blob import Blob
import json
from abc import ABC, abstractmethod
from . import TARGET


class Storage(ABC):
    """
    Abstract interface for a storage backend.

    Implementations may target:
        - Local filesystem
        - Cloud object storage (GCS, S3, Azure)
        - Hybrid or in-memory storage

    The interface is intentionally backend-agnostic and avoids
    filesystem-specific assumptions such as true directory creation.
    """

    # ---------------------------------------------------------
    # Core file operations
    # ---------------------------------------------------------

    @abstractmethod
    def exists(self, target: TARGET) -> bool:
        """
        Return True if the given target exists in storage.

        Args:
            target: A normalized storage path or key.

        Returns:
            bool indicating existence.
        """
        ...
    @abstractmethod
    def create_dir(self,target: TARGET)->TARGET:
        """Create a new directory under the given path .

        Args:
            target (TARGET): A str, path, or blob

        Raises:
            ValueError: [description]
            TypeError: [description]
            ValueError: [description]

        Returns:
            TARGET: The name of the dir
        """

    @abstractmethod
    def read(self, target: TARGET) -> bytes:
        """
        Read the contents of a stored object.

        Args:
            target: The storage path/key to read.

        Returns:
            Raw bytes of the stored object.

        Raises:
            FileNotFoundError if target does not exist.
        """
        ...

    @abstractmethod
    def write(
        self,
        target: TARGET,
        data: str | dict | List | bytes | bytearray,
        *,
        overwrite: bool = True,
    ) -> TARGET:
        """
        Write raw bytes to the given storage target.

        Args:
            target: The storage path/key to write to.
            data: Raw bytes to store.
            overwrite: Whether to overwrite existing content.

        Returns:
            The normalized storage target.

        Raises:
            FileExistsError if overwrite=False and target exists.
        """
        ...

    @abstractmethod
    def delete(self, target: TARGET) -> None:
        """
        Delete the specified storage target.

        Args:
            target: The storage path/key to delete.

        Raises:
            FileNotFoundError if target does not exist.
        """
        ...

    # ---------------------------------------------------------
    # Directory / prefix operations
    # ---------------------------------------------------------

    @abstractmethod
    def list(self, target: TARGET, *, recursive: bool = False) -> Sequence[TARGET]:
        """
        List objects under a given prefix or directory.

        Args:
            target: Directory or prefix to list.
            recursive: If True, include nested objects.

        Returns:
            Sequence of storage targets.
        """
        ...

    # ---------------------------------------------------------
    # Object management operations
    # ---------------------------------------------------------

    @abstractmethod
    def copy(self, source: TARGET, destination: TARGET) -> TARGET:
        """
        Copy an object from source to destination.

        Args:
            source: Existing storage target.
            destination: New storage target.

        Returns:
            The destination target.
        """
        ...

    @abstractmethod
    def move(self, source: TARGET, destination: TARGET) -> TARGET:
        """
        Move (rename) an object from source to destination.

        Implementations for object storage may internally
        perform copy + delete.

        Args:
            source: Existing storage target.
            destination: New storage target.

        Returns:
            The destination target.
        """
        ...

    def _to_storage_path(self, value: Union[str, Path, Blob]) -> str:
        """
        Normalize input into a StoragePath.

        Accepts:
            - str
            - pathlib.Path
            - StoragePath

        Returns:
            StoragePath (normalized).
        """
        if isinstance(value, str):
            return Path(value).as_posix()
        if isinstance(value, Path):
            return value.as_posix()
        if isinstance(value, Blob):
            if not value.name:
                raise ValueError(f"Cannot determine blob: {value}")
            return Path(value.name).as_posix()

        raise TypeError(f"Unsupported path type: {type(value)}")

    def _normalize_content(
        self, content: str | dict | List | bytes | bytearray
    ) -> bytes:
        # Normalize content
        if isinstance(content, (dict, list)):
            content_bytes = json.dumps(content, indent=2).encode("utf-8")

        elif isinstance(content, str):
            content_bytes = content.encode("utf-8")

        elif isinstance(content, (bytes, bytearray)):
            content_bytes = bytes(content)

        else:
            raise ValueError(f"Unsupported content type: {type(content)}")
        return content_bytes

