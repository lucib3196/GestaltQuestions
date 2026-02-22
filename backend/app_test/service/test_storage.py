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
@pytest.mark.parametrize(
    "target",
    TARGETS,
)
def test_create(create_dir_factory, storage_mode, target, storage):
    target_path = create_dir_factory(storage_mode, target)
    print("This is the target path", target)
    assert storage.exists(target_path)


@pytest.mark.parametrize(
    "target",
    TARGETS,
)
def test_exists_false(storage, target, storage_mode, tmp_path):
    if storage_mode == "local":
        target = tmp_path / target
    assert not storage.exists(target)


# =========================================================================
# File operations: read, write,delete
# =========================================================================
@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_write(
    storage,
    create_dir_factory,
    storage_mode,
    filename,
    content,
):
    base_path = create_dir_factory(storage_mode, "test")
    target = f"{base_path}/{filename}"
    storage.write(target, content, overwrite=True)
    # Ensure that the path exist
    assert storage.exists(target)


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_read(
    storage,
    create_dir_factory,
    storage_mode,
    filename,
    content,
):
    base_path = create_dir_factory(storage_mode, "test")
    target = f"{base_path}/{filename}"
    storage.write(target, content, overwrite=True)
    raw_bytes = storage.read(target)
    # Ensures that the content is the same
    assert normalize_newlines(raw_bytes) == normalize_newlines(normalize(content))


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_delete(
    storage,
    create_dir_factory,
    storage_mode,
    filename,
    content,
):
    base_path = create_dir_factory(storage_mode, "test")
    target = f"{base_path}/{filename}"
    storage.write(target, content, overwrite=True)
    # Assert creation, then delete and assert does not exist
    assert storage.exists(target)
    storage.delete(target)
    assert not storage.exists(target)


# =========================================================================
# File Moving: Test moving and copying
# =========================================================================


@pytest.mark.parametrize("source,destination", RENAME_TARGETS)
def test_rename_storage(
    source: str | Path,
    destination: str | Path,
    storage,
    storage_mode: str,
    tmp_path,
):
    # Normalize paths for local mode
    if storage_mode == "local":
        source = Path(tmp_path) / source
        destination = Path(tmp_path) / destination

    # 1️Create the SOURCE path (what we will rename)
    source_path = storage.write(source, "")

    # Ensure initial state
    assert storage.exists(source_path)
    assert not storage.exists(destination)

    # 2️Perform rename (move)
    storage.move(
        source=source_path,
        destination=destination,
    )

    # 3️Validate final state
    assert not storage.exists(source_path)
    assert storage.exists(destination)


@pytest.mark.parametrize("source,destination", RENAME_TARGETS)
def test_copy(
    source: str,
    destination: str,
    create_dir_factory,
    storage,
    storage_mode: str,
    tmp_path,
):
    # Normalize paths for local backend
    if storage_mode == "local":
        source = str(Path(tmp_path) / source)
        destination = str(Path(tmp_path) / destination)

    # 1️Create SOURCE path
    source_path = storage.write(source, "")

    # Ensure initial state
    assert storage.exists(source_path)
    assert not storage.exists(destination)

    # 2️ Perform COPY
    storage.copy(
        source=source_path,
        destination=destination,
    )

    # 3️Validate final state
    assert storage.exists(source_path)  # source still exists
    assert storage.exists(destination)  # destination now exists


@pytest.mark.parametrize("folder,files", FOLDER_ITERATION_TARGETS)
def test_folder_iteration_recursive(
    folder: str,
    files: list[tuple[str, FileContent]],
    storage,
    storage_mode: str,
    tmp_path,
):
    # Normalize local paths
    if storage_mode == "local":
        folder = str(Path(tmp_path) / folder)
        files = [(str(Path(tmp_path) / path), content) for path, content in files]

    # 1️Batch create files
    for path, content in files:
        storage.write(path, content)

    # 2️Fetch results
    results = storage.list(folder, recursive=True)

    # Normalize to set for comparison
    expected_paths = {Path(path).as_posix() for path, _ in files}
    result_paths = set(results)

    # 3️ Validate
    assert expected_paths == result_paths


@pytest.mark.parametrize(
    "folder,files,expected", NON_RECURSIVE_FOLDER_ITERATION_TARGETS
)
def test_folder_iteration_not_recursive(
    folder: str,
    files: list[tuple[str, FileContent]],
    expected,
    storage,
    storage_mode: str,
    tmp_path,
):
    # Normalize local paths
    if storage_mode == "local":
        folder = str(Path(tmp_path) / folder)
        files = [(str(Path(tmp_path) / path), content) for path, content in files]
        expected = [str(Path(tmp_path) / exp) for exp in expected]

    # 1️Batch create files
    for path, content in files:
        storage.write(path, content)

    # 2️Fetch results
    results = storage.list(folder, recursive=False)

    # Normalize to set for comparison
    expected_paths = {Path(path).as_posix() for path in expected}
    result_paths = set(results)

    # 3️ Validate
    assert expected_paths == result_paths
