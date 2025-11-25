import pytest
from typing import Literal, Tuple
from pathlib import Path

storage_type: Literal["local", "cloud"]


@pytest.fixture
def create_test_dir(active_storage_backend) -> Tuple[Path, str]:
    """Create a temporary test directory inside the local storage."""
    testdir = "TestFolder"
    created_dir = active_storage_backend.create_storage_path(testdir)
    print("[TEST] This is the created dir", created_dir)
    return created_dir, testdir


def test_storage_initialization(active_storage_backend):
    """Verify both storage backends initialize correctly."""
    backend = active_storage_backend

    assert backend.get_root_path() is not None
    assert backend.get_base_path() is not None


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
