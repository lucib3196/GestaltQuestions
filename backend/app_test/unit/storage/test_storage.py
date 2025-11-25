import pytest
from typing import Literal, Tuple
from pathlib import Path
from src.utils import normalize, normalize_newlines

storage_type: Literal["local", "cloud"]


@pytest.fixture
def create_test_dir(active_storage_backend) -> Tuple[Path, str]:
    """Create a temporary test directory inside the local storage."""
    testdir = "TestFolder"
    created_dir = active_storage_backend.create_storage_path(testdir)
    print("[TEST] This is the created dir", created_dir)
    return created_dir, testdir

# -------------------------------------------------------------------------
# Initialization / Lifecycle
# -------------------------------------------------------------------------
def test_storage_initialization(active_storage_backend):
    """Verify both storage backends initialize correctly."""
    backend = active_storage_backend

    assert backend.get_root_path() is not None
    assert backend.get_base_path() is not None

# -------------------------------------------------------------------------
# base_path path operations
# -------------------------------------------------------------------------
def test_backend_properties(active_storage_backend, storage_mode, tmp_path):
    backend = active_storage_backend
    base = "questions"

    if storage_mode == "local":
        assert backend.get_root_path() == tmp_path.as_posix()
        assert backend.get_base_path() == (tmp_path / base).as_posix()

    if storage_mode == "cloud":
        root = "test"
        assert backend.get_root_path() == root
        assert backend.get_base_path() == (Path(root) / base).as_posix()


def test_get_relative_to_base(active_storage_backend):
    backend = active_storage_backend
    base = "questions"

    correct_path = f"{base}/MyQuestion"
    assert backend.get_relative_to_base(correct_path) == correct_path

    path_to_check = f"MyQuestion"
    assert backend.get_relative_to_base(path_to_check) == correct_path
    
# =========================================================================
# Storage path operations
# =========================================================================

def test_create_storage_path(
    create_test_dir, active_storage_backend, tmp_path, storage_mode
):
    base = "questions"
    created, folder_name = create_test_dir

    if storage_mode == "local":
        target_path = Path(tmp_path / base / folder_name).as_posix()
        assert created == target_path
    if storage_mode == "cloud":
        root = "test"
        target_path = f"{root}/{base}/{folder_name}"
        assert created == target_path


def test_does_storage_path_exist(
    create_test_dir, active_storage_backend, tmp_path, storage_mode
):
    backend = active_storage_backend
    created, _ = create_test_dir
    assert backend.does_storage_path_exist(created)


def test_get_storage_path(create_test_dir, active_storage_backend):
    backend = active_storage_backend
    """Validate that get_storage_path returns the correct directory path."""
    created, folder_name = create_test_dir
    assert backend.get_storage_path(folder_name, False) == created


def test_ensure_storage_path_exist(active_storage_backend, create_test_dir):
    backend = active_storage_backend
    created, folder_name = create_test_dir
    assert backend.ensure_storage_path(folder_name) == created


def test_ensure_storage_path_nonexist(active_storage_backend, create_test_dir):
    backend = active_storage_backend
    folder_name = "MyNewQuestion"
    created = backend.ensure_storage_path(folder_name)
    print("This is the created", created)
    
    
def test_storage_path_exist(active_storage_backend, create_test_dir):
    backend = active_storage_backend
    created, folder_name = create_test_dir
    assert backend.does_storage_path_exist(created)


def test_rename_storage(active_storage_backend, create_test_dir):
    backend = active_storage_backend
    folder_name = "MyRename"
    created, folder = create_test_dir
    old_name = created
    new = backend.get_storage_path(folder_name, relative=False)

    renamed_storage = backend.rename_storage(old_name, new)

    # Assert that the old one does not exist
    assert backend.does_storage_path_exist(old_name) is False
    assert backend.does_storage_path_exist(renamed_storage) is True
    
    
# =========================================================================
# File operations: read, write, fetch
# =========================================================================

@pytest.mark.parametrize(
    "filename, content",
    [
        (
            "text.txt",
            "Hello World",
        ),  # string
        ("data.json", {"key": "value"}),  # dict
        ("binary.bin", b"\x00\x01\x02"),  # bytes
    ],
)
def test_save_file(
    active_storage_backend,
    create_test_dir,
    filename,
    content,
):
    """Ensure save_file correctly"""
    target, _ = create_test_dir
    f = active_storage_backend.save_file(target, content, filename, overwrite=True)
    f = Path(f)
    assert f.name == filename


@pytest.mark.parametrize(
    "filename, content",
    [
        ("text.txt", "Hello World"),  # string
        ("data.json", {"key": "value"}),  # dict → json
        ("binary.bin", b"\x00\x01\x02"),  # bytes → raw bytes
    ],
)
def test_read_file(active_storage_backend, create_test_dir, filename, content):
    target, _ = create_test_dir
    # --- Write file ---
    active_storage_backend.save_file(target, content, filename, overwrite=True)
    # --- Read file as raw bytes ---
    raw_bytes = active_storage_backend.read_file(target, filename)

    assert normalize_newlines(raw_bytes) == normalize_newlines(normalize(content))

# Same current functionality as read file
@pytest.mark.parametrize(
    "filename, content",
    [
        ("text.txt", "Hello World"),  # string
        ("data.json", {"key": "value"}),  # dict → json
        ("binary.bin", b"\x00\x01\x02"),  # bytes → raw bytes
    ],
)
def test_download_file(active_storage_backend, create_test_dir, filename, content):
    target, _ = create_test_dir
    # --- Write file ---
    active_storage_backend.save_file(target, content, filename, overwrite=True)
    # --- Read file as raw bytes ---
    raw_bytes = active_storage_backend.download_file(target, filename)
    assert normalize_newlines(raw_bytes) == normalize_newlines(normalize(content))


@pytest.mark.parametrize(
    "filename, content",
    [
        ("text.txt", "Hello World"),  # string
        ("data.json", {"key": "value"}),  # dict → json
        ("binary.bin", b"\x00\x01\x02"),  # bytes → raw bytes
    ],
)
def test_get_file_path(active_storage_backend, create_test_dir,filename,  content):
    target, _ = create_test_dir
    active_storage_backend.save_file(target, content, filename)
    target_path = Path(target)/filename
    assert active_storage_backend.get_file_path(target,filename) == target_path.as_posix()
    