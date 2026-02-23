import pytest
from pathlib import Path
from src.utils import normalize, normalize_newlines
from app_test.shared.mock_data.storage import (
    TARGETS,
    RENAME_TARGETS,
    MOCK_FILES,
    FOLDER_ITERATION_TARGETS,
    FileContent,
    NON_RECURSIVE_FOLDER_ITERATION_TARGETS,
)


# =========================================================================
# Storage path operations
# =========================================================================

@pytest.mark.parametrize("target", TARGETS)
def test_create(create_dir_factory, target, storage):
    target_path = create_dir_factory(storage.get_storage_type(), target)
    assert storage.exists(target_path)


@pytest.mark.parametrize("target", TARGETS)
def test_exists_false(storage, target, tmp_path):
    if storage.get_storage_type() == "local":
        target = tmp_path / target
    assert not storage.exists(target)


# =========================================================================
# File operations: read, write, delete
# =========================================================================

@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_write(storage, create_dir_factory, filename, content):
    base_path = create_dir_factory(storage.get_storage_type(), "test")
    target = f"{base_path}/{filename}"

    storage.write(target, content, overwrite=True)
    assert storage.exists(target)


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_read(storage, create_dir_factory, filename, content):
    base_path = create_dir_factory(storage.get_storage_type(), "test")
    target = f"{base_path}/{filename}"

    storage.write(target, content, overwrite=True)
    raw_bytes = storage.read(target)

    assert normalize_newlines(raw_bytes) == normalize_newlines(normalize(content))


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_delete(storage, create_dir_factory, filename, content):
    base_path = create_dir_factory(storage.get_storage_type(), "test")
    target = f"{base_path}/{filename}"

    storage.write(target, content, overwrite=True)

    assert storage.exists(target)
    storage.delete(target)
    assert not storage.exists(target)


# =========================================================================
# File Moving: Test moving and copying
# =========================================================================

@pytest.mark.parametrize("source,destination", RENAME_TARGETS)
def test_rename_storage(source, destination, storage, tmp_path):
    if storage.get_storage_type() == "local":
        source = Path(tmp_path) / source
        destination = Path(tmp_path) / destination

    source_path = storage.write(source, "")

    assert storage.exists(source_path)
    assert not storage.exists(destination)

    storage.move(source=source_path, destination=destination)

    assert not storage.exists(source_path)
    assert storage.exists(destination)


@pytest.mark.parametrize("source,destination", RENAME_TARGETS)
def test_copy(source, destination, storage, tmp_path):
    if storage.get_storage_type() == "local":
        source = str(Path(tmp_path) / source)
        destination = str(Path(tmp_path) / destination)

    source_path = storage.write(source, "")

    assert storage.exists(source_path)
    assert not storage.exists(destination)

    storage.copy(source=source_path, destination=destination)

    assert storage.exists(source_path)
    assert storage.exists(destination)


# =========================================================================
# Folder Iteration Tests
# =========================================================================

@pytest.mark.parametrize("folder,files", FOLDER_ITERATION_TARGETS)
def test_folder_iteration_recursive(folder, files, storage, tmp_path):
    if storage.get_storage_type() == "local":
        folder = str(Path(tmp_path) / folder)
        files = [(str(Path(tmp_path) / path), content) for path, content in files]

    for path, content in files:
        storage.write(path, content)

    results = storage.list(folder, recursive=True)

    expected_paths = {Path(path).as_posix() for path, _ in files}
    result_paths = set(results)

    assert expected_paths == result_paths


@pytest.mark.parametrize(
    "folder,files,expected", NON_RECURSIVE_FOLDER_ITERATION_TARGETS
)
def test_folder_iteration_not_recursive(
    folder,
    files,
    expected,
    storage,
    tmp_path,
):
    if storage.get_storage_type() == "local":
        folder = str(Path(tmp_path) / folder)
        files = [(str(Path(tmp_path) / path), content) for path, content in files]
        expected = [str(Path(tmp_path) / exp) for exp in expected]

    for path, content in files:
        storage.write(path, content)

    results = storage.list(folder, recursive=False)

    expected_paths = {Path(path).as_posix() for path in expected}
    result_paths = set(results)

    assert expected_paths == result_paths