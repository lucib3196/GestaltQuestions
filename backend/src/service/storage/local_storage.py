from pathlib import Path
from typing import List
import shutil
from google.cloud.storage.blob import Blob
from typing import Sequence
import shutil
from .base import Storage
from . import TARGET
from src.types.storage import STORAGE_TYPE
from typing import Literal, cast


class LocalStorage(Storage):

    def __init__(self):
        self.set_storage_type()

    def set_storage_type(self) -> Literal["cloud"] | Literal["local"]:
        self.mode = "local"
        return "local"

    def get_storage_type(self) -> Literal["cloud"] | Literal["local"]:
        return cast(STORAGE_TYPE, self.mode)

    def _resolve(self, target: TARGET) -> Path:
        return Path(self._to_storage_path(target)).resolve()

    def exists(self, target: str | Path | Blob) -> bool:
        storage_path = self._to_storage_path(target)
        return self._resolve(storage_path).exists()

    def create_dir(self, target: str | Path | Blob) -> str | Path | Blob:
        storage_path = self._to_storage_path(target)
        path = self._resolve(storage_path)
        if path.is_file():
            raise ValueError("Cannot create directory. Received file")
        path.mkdir(parents=True, exist_ok=True)
        return path.as_posix()

    def read(self, target: str | Path | Blob) -> bytes:
        storage_path = self._to_storage_path(target)
        path = self._resolve(storage_path)
        return path.read_bytes()

    def write(
        self,
        target: str | Path | Blob,
        data: str | dict | List | bytes | bytearray,
        *,
        overwrite: bool = True,
    ) -> str | Path | Blob:
        storage_path = self._to_storage_path(target)
        path = self._resolve(storage_path)

        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(self._normalize_content(data))
        return storage_path

    def delete(self, target: str | Path | Blob) -> None:
        storage_path = self._to_storage_path(target)
        path = self._resolve(storage_path)
        if path.is_file():
            path.unlink()
        elif path.is_dir():
            shutil.rmtree(path)

    def list(
        self, target: str | Path | Blob, *, recursive: bool = False
    ) -> Sequence[str | Path | Blob]:
        storage_path = self._to_storage_path(target)
        base = self._resolve(storage_path)

        if not base.exists():
            return []

        iterator = base.rglob("*") if recursive else base.glob("*")
        results = []
        for path in iterator:
            if path.is_file():
                results.append(self._to_storage_path(path))
        return results

    def move(
        self, source: str | Path | Blob, destination: str | Path | Blob
    ) -> str | Path | Blob:
        src_path = self._resolve(self._to_storage_path(source))
        dst_storage = self._to_storage_path(destination)
        dst_path = self._resolve(dst_storage)

        dst_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src_path), str(dst_path))
        return dst_storage

    def copy(
        self,
        source: str | Path | Blob,
        destination: str | Path | Blob,
    ) -> str:

        src_path = self._resolve(self._to_storage_path(source))
        dst_storage = self._to_storage_path(destination)
        dst_path = self._resolve(dst_storage)

        if src_path.is_dir():
            # Copy directory recursively
            shutil.copytree(src_path, dst_path, dirs_exist_ok=True)
        else:
            # Ensure parent exists
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_path, dst_path)

        return str(dst_storage)
