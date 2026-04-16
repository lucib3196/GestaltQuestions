from pathlib import Path

import pytest

from app_test.unit.shared import MOCK_FILES, RENAME_TARGETS, TARGETS
from src.utils import normalize, normalize_newlines


def _path_for_storage(storage, tmp_path, relative_path: str) -> str:
    if storage.get_storage_type() == "local":
        return (tmp_path / relative_path).as_posix()
    return relative_path


@pytest.mark.parametrize("target", TARGETS)
def test_create_dir_and_exists(storage, tmp_path, target):
    target_path = _path_for_storage(storage, tmp_path, target)
    created = storage.create_dir(target_path)

    assert storage.exists(created)
    assert storage.is_dir(created)


@pytest.mark.parametrize("target", TARGETS)
def test_exists_false_for_missing_target(storage, tmp_path, target):
    target_path = _path_for_storage(storage, tmp_path, target)
    assert not storage.exists(target_path)


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_write_and_read(storage, tmp_path, filename, content):
    target = _path_for_storage(storage, tmp_path, f"questions/test/{filename}")

    storage.write(target, content, overwrite=True)
    assert storage.exists(target)

    raw_bytes = storage.read(target)
    assert raw_bytes is not None
    assert normalize_newlines(raw_bytes) == normalize_newlines(normalize(content))


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_delete(storage, tmp_path, filename, content):
    target = _path_for_storage(storage, tmp_path, f"questions/delete/{filename}")

    storage.write(target, content, overwrite=True)
    assert storage.exists(target)

    storage.delete(target)
    assert not storage.exists(target)


FILE_RENAME_CASES = [
    (source, destination)
    for source, destination in RENAME_TARGETS
    if not source.endswith("/") and not destination.endswith("/")
]


@pytest.mark.parametrize("source,destination", FILE_RENAME_CASES)
def test_copy_file(source, destination, storage, tmp_path):
    source_path = _path_for_storage(storage, tmp_path, source)
    destination_path = _path_for_storage(storage, tmp_path, destination)

    storage.write(source_path, "payload", overwrite=True)
    storage.copy(source=source_path, destination=destination_path)

    assert storage.exists(source_path)
    assert storage.exists(destination_path)


@pytest.mark.parametrize("source,destination", FILE_RENAME_CASES)
def test_move_file_local_only(source, destination, storage, tmp_path):
    if storage.get_storage_type() == "cloud":
        pytest.skip("Cloud move is directory-oriented in current implementation.")

    source_path = _path_for_storage(storage, tmp_path, source)
    destination_path = _path_for_storage(storage, tmp_path, destination)

    storage.write(source_path, "payload", overwrite=True)
    storage.move(source=source_path, destination=destination_path)

    assert not storage.exists(source_path)
    assert storage.exists(destination_path)
