import pytest
from typing import Tuple
from pathlib import Path
from src.utils import normalize, normalize_newlines
from io import BytesIO
from src.core import logger
from app_test.shared.factories.storage_factory import create_storage_path_factory
from app_test.shared.mock_data.storage import TARGETS, RENAME_TARGETS, MOCK_FILES


@pytest.fixture
def save_multiple_files(active_storage_backend, create_test_dir):
    """Save multiple test files (string, dict, bytes) under a temporary directory."""
    dir, name = create_test_dir
    files = [
        ("text.txt", "Hello World"),  # string
        ("data.json", {"key": "value"}),  # dict
        ("binary.bin", b"\x00\x01\x02"),  # bytes
    ]

    for filename, content in files:
        active_storage_backend.save_file(
            name,
            content,
            filename,
        )

    return dir


@pytest.fixture
def create_directory(active_storage_backend) -> Tuple[Path, str]:
    """Create a temporary test directory inside the local storage."""
    testdir = "TestFolder"
    created_dir = active_storage_backend.create_storage_path(testdir)
    print("[TEST] This is the created dir", created_dir)
    return created_dir, testdir


# =========================================================================
# Storage path operations
# =========================================================================


@pytest.mark.parametrize(
    "target",
    TARGETS,
)
def test_create_storage_path(
    create_storage_path_factory, storage_mode, target, active_storage_backend
):
    target_path = create_storage_path_factory(storage_mode, target)
    assert active_storage_backend.does_storage_path_exist(target_path)


@pytest.mark.parametrize(
    "target",
    TARGETS,
)
def test_does_storage_path_exist_fake(
    active_storage_backend, target, storage_mode, tmp_path
):
    if storage_mode == "local":
        target = tmp_path / target
    assert not active_storage_backend.does_storage_path_exist(target)


@pytest.mark.parametrize(
    "target",
    TARGETS,
)
def test_ensure_storage_path_exist(
    target, active_storage_backend, storage_mode, tmp_path
):
    if storage_mode == "local":
        target = tmp_path / target
    # Ensure it does not exist
    assert not active_storage_backend.does_storage_path_exist(target)
    # Actually create
    active_storage_backend.ensure_storage_path_exist(target)
    # Assert created
    assert active_storage_backend.does_storage_path_exist(target)


@pytest.mark.parametrize("source,target", RENAME_TARGETS)
def test_rename_storage(
    source: str | Path,
    target: str | Path,
    create_storage_path_factory,
    active_storage_backend,
    storage_mode: str,
    tmp_path,
):
    if storage_mode == "local":
        target = Path(tmp_path) / target
        source = Path(tmp_path) / source
    # 1️ Create the ORIGINAL path
    original_path = create_storage_path_factory(storage_mode, source)
    # Ensure initial state
    assert active_storage_backend.does_storage_path_exist(original_path)
    assert not active_storage_backend.does_storage_path_exist(target)

    # 2️ Perform rename
    active_storage_backend.rename_storage(
        old=original_path,
        new=target,
    )

    # 3️ Validate final state
    assert not active_storage_backend.does_storage_path_exist(original_path)
    assert active_storage_backend.does_storage_path_exist(target)


# =========================================================================
# File operations: read, write, fetch
# =========================================================================


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_save_file(
    active_storage_backend,
    create_storage_path_factory,
    storage_mode,
    filename,
    content,
):
    """Ensure save_file correctly"""
    target_path = create_storage_path_factory(storage_mode, "test")
    f = active_storage_backend.save_file(
        target_path, content, filename=filename, overwrite=True
    )
    f = Path(f)
    assert f.name == Path(filename).name


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_read_file(
    active_storage_backend,
    create_storage_path_factory,
    storage_mode,
    filename,
    content,
):
    target_path = create_storage_path_factory(storage_mode, filename)
    active_storage_backend.save_file(
        target_path, content, filename=filename, overwrite=True
    )
    raw_bytes = active_storage_backend.read_file(target_path, filename)
    assert normalize_newlines(raw_bytes) == normalize_newlines(normalize(content))


@pytest.mark.parametrize("filename,content", MOCK_FILES)
def test_get_file_path(
    active_storage_backend,
    create_storage_path_factory,
    storage_mode,
    filename,
    content,
):
    base_path = create_storage_path_factory(storage_mode, filename)
    active_storage_backend.save_file(base_path, content, filename)
    target_path = f"{base_path}/{filename}"
    
    assert active_storage_backend.get_file_path(base_path, filename) == target_path


# =========================================================================
# File listing, checks, existence
# =========================================================================
def test_list_file_paths(active_storage_backend):
    data = [
        ("text.txt", "Hello World"),  # string
        ("data.json", {"key": "value"}),  # dict → json
        ("binary.bin", b"\x00\x01\x02"),  # bytes → raw bytes
    ]

    # Create a directory that will hold all files
    target = active_storage_backend.create_storage_path("MyFullDir")

    # Save all test files
    for filename, content in data:
        active_storage_backend.save_file(
            target=target, content=content, filename=filename
        )
    # Retrieve file paths
    retrieved_paths = active_storage_backend.list_file_paths(target)
    # Number of returned files should match what we saved
    assert len(retrieved_paths) == len(data)
    # Normalize expected filenames
    expected_filenames = sorted([name for name, _ in data])
    # Extract actual filenames (end of path)
    actual_filenames = sorted([Path(p).name for p in retrieved_paths])
    assert actual_filenames == expected_filenames


def test_list_file_names(active_storage_backend):
    data = [
        ("text.txt", "Hello World"),  # string
        ("data.json", {"key": "value"}),  # dict → json
        ("binary.bin", b"\x00\x01\x02"),  # bytes → raw bytes
    ]

    # Create a directory that will hold all files
    target = active_storage_backend.create_storage_path("MyFullDir")

    # Save all test files
    for filename, content in data:
        active_storage_backend.save_file(
            target=target, content=content, filename=filename
        )
    retrieved_paths = active_storage_backend.list_file_names(target)
    # Number of returned files should match what we saved
    assert len(retrieved_paths) == len(data)
    # Normalize expected filenames
    expected_filenames = sorted([name for name, _ in data])
    # Extract actual filenames (end of path)
    actual_filenames = sorted([Path(p).name for p in retrieved_paths])
    assert actual_filenames == expected_filenames


# =========================================================================
# Mutating operations: copy, move, delete
# =========================================================================


def test_delete_file(save_multiple_files, active_storage_backend):
    """Ensure delete_file removes files as expected."""
    dir = save_multiple_files
    files = active_storage_backend.list_file_paths(dir)
    print("This is the filepath", files)
    for f in files:
        active_storage_backend.delete_file(f)
        assert active_storage_backend.read_file(f) is None


def test_empty_directory(create_test_dir, active_storage_backend):
    """Check that a newly created directory is empty."""
    dir, _ = create_test_dir
    active_storage_backend.delete_storage(dir)
    f = active_storage_backend.list_file_paths(dir)
    assert f == []
