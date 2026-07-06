import contextlib
import os

import firebase_admin
import pytest
from src.core import get_settings
from src.model.files import FileData

from app_test import FbStorage, LocalStorage, QuestionManager, initialize_firebase_app

# Keep these imports for the factory


settings = get_settings()


@pytest.fixture(scope="session")
def firebase_app_for_tests():
    assert os.environ.get("FIREBASE_AUTH_EMULATOR_HOST"), (
        "Missing FIREBASE_AUTH_EMULATOR_HOST"
    )
    assert os.environ.get("STORAGE_EMULATOR_HOST"), "Missing STORAGE_EMULATOR_HOST"

    app = initialize_firebase_app()
    yield app

    with contextlib.suppress(Exception):
        firebase_admin.delete_app(app)
    initialize_firebase_app.cache_clear()


@pytest.fixture(
    params=[
        ("local", LocalStorage),
        ("cloud", FbStorage),
    ]
)
def storage(request, firebase_app_for_tests):
    _, StorageClass = request.param

    if StorageClass is FbStorage:
        return StorageClass(settings.STORAGE_BUCKET)
    return StorageClass()


@pytest.fixture(autouse=True)
def clean_cloud(storage) -> None:
    if storage.get_storage_type() == "cloud":
        storage._hard_delete()


@pytest.fixture
def question_manager(storage, question_db):
    return QuestionManager(question_db, storage)


@pytest.fixture
def question_file_payload() -> list[FileData]:
    files_data = [
        ("question.html", "Some question text"),
        ("solution.html", "Some solution"),
        ("server.js", "some code content"),
        ("meta.json", {"content": "some content"}),
    ]
    return [FileData(filename=f[0], content=f[1]) for f in files_data]
