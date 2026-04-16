#
# conftest.py
# Organized by section for readability only; fixture behavior is unchanged.
#
import os

import firebase_admin
import pytest
from sqlmodel import SQLModel, Session, create_engine

from src.core import (
    get_settings,
    in_test_ctx,
    logger,
)
from src.data import QuestionDB

from . import FbStorage, LocalStorage, QuestionManager, initialize_firebase_app


settings = get_settings()


# ===== Firebase / Emulator Setup =================================================
@pytest.fixture(scope="session", autouse=True)
def firebase_app_for_tests():
    # Hard fail if tests are not pointed at emulators
    assert os.environ.get(
        "FIREBASE_AUTH_EMULATOR_HOST"
    ), "Missing FIREBASE_AUTH_EMULATOR_HOST"
    assert os.environ.get("STORAGE_EMULATOR_HOST"), "Missing STORAGE_EMULATOR_HOST"

    app = initialize_firebase_app()  # cached by @lru_cache
    yield app

    # clean shutdown
    try:
        firebase_admin.delete_app(app)
    except Exception:
        pass
    initialize_firebase_app.cache_clear()


# ===== Database Fixtures =========================================================
@pytest.fixture
def question_db(db_session) -> QuestionDB:
    return QuestionDB(db_session)


@pytest.fixture(
    params=[
        ("local", LocalStorage),
        ("cloud", FbStorage),
    ]
)
def storage(request, firebase_app_for_tests):
    name, StorageClass = request.param

    if StorageClass is FbStorage:
        instance = StorageClass(settings.STORAGE_BUCKET)
    else:
        instance = StorageClass()
    return instance


# ===== Storage / Manager Fixtures ===============================================
@pytest.fixture(scope="function", autouse=True)
def clean_cloud(storage):
    if storage.get_storage_type() == "cloud":
        storage._hard_delete()


@pytest.fixture
def question_manager(storage, question_db):
    qm = QuestionManager(
        question_db,
        storage,
    )
    return qm


# ===== Engine Fixtures ===========================================================
@pytest.fixture(scope="function")
def test_engine(tmp_path):
    """Provide a temporary SQLite engine for testing."""
    url = f"sqlite:///{tmp_path}/test.db"
    engine = create_engine(
        url,
        echo=False,
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()


# ===== Session & Isolation Fixtures ==============================================
@pytest.fixture(scope="function")
def db_session(test_engine):
    """Provide a new SQLModel session for each test with isolation."""
    with Session(test_engine, expire_on_commit=False) as session:
        yield session
        session.rollback()


@pytest.fixture(autouse=True)
def _clean_db(db_session, test_engine):
    """Automatically reset database tables between tests."""
    logger.debug("Cleaning Database")
    SQLModel.metadata.drop_all(test_engine)
    SQLModel.metadata.create_all(test_engine)


# ===== Logging / Test Context Fixtures ===========================================
@pytest.fixture(autouse=True)
def mark_logs_in_test():
    """Mark logs as being inside test context for duration of each test."""
    token = in_test_ctx.set(True)
    yield
    in_test_ctx.reset(token)
