from collections.abc import Generator
from pathlib import Path

import pytest

from app_test.support.firebase import storage_params
from backend.core import get_settings
from backend.storage import FbStorage, LocalStorage, Storage

settings = get_settings()


class TestLocalStorage(LocalStorage):
    def __init__(self, root: Path) -> None:
        super().__init__()
        self.root = root

    def _resolve(self, target: str) -> Path:
        path = Path(self._to_storage_path(target))
        if path.is_absolute():
            return path.resolve()
        return (self.root / path).resolve()

    def is_dir(self, target: str) -> bool:
        return self._resolve(target).is_dir()


@pytest.fixture(params=storage_params())
def raw_storage(request: pytest.FixtureRequest, tmp_path: Path) -> Generator[Storage]:
    if request.param == "cloud":
        request.getfixturevalue("firebase_app_for_tests")
        storage = FbStorage(settings.STORAGE_BUCKET)  # type: ignore[arg-type]
        storage._hard_delete()
        yield storage
        storage._hard_delete()
        return

    yield TestLocalStorage(tmp_path)
