from pathlib import Path
import pytest


@pytest.fixture
def create_storage_path_factory(active_storage_backend, tmp_path):
    def _create(storage_mode: str, target: str) -> str:
        if storage_mode == "local":
            target_path = Path(tmp_path / target).as_posix()
            active_storage_backend.create_storage_path(target_path)

        elif storage_mode == "cloud":
            target_path = target
            active_storage_backend.create_storage_path(target_path)

        else:
            raise ValueError(f"Unknown storage_mode: {storage_mode}")

        return target_path

    return _create
