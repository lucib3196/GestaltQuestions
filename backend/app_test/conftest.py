import pytest
from sqlmodel import Session, create_engine

from app_test.shared.fixtures.fixture_crud import *

from src.core import (
    get_settings,
    in_test_ctx,
    logger,
    Base,
)

from . import FbStorage, LocalStorage, Storage, QuestionManager, initialize_firebase_app
from src.data import QuestionDB


settings = get_settings()
initialize_firebase_app()


# DATABASE Fixtures
@pytest.fixture
def question_db(db_session) -> QuestionDB:
    return QuestionDB(db_session)


# SERVICE FIXTURES


# -----------------------------
# Storage Fixtures
# -----------------------------
@pytest.fixture(
    params=[
        ("local", LocalStorage),
        ("cloud", FbStorage),
    ]
)
def storage(request):
    name, StorageClass = request.param

    if StorageClass is FbStorage:
        instance = StorageClass(settings.STORAGE_BUCKET)
    else:
        instance = StorageClass()

    assert instance.get_storage_type() == name
    return instance


@pytest.fixture(scope="function", autouse=True)
def clean_cloud(storage):
    if storage.get_storage_type() == "cloud":
        storage._hard_delete()


# --------------------
# Question Storage
# ---------------------


@pytest.fixture
def question_manager(storage, question_db):
    qm = QuestionManager(
        question_db,
        storage,
    )
    return qm


# -----------------------------
# Database Fixtures
# -----------------------------
@pytest.fixture(scope="function")
def test_engine(tmp_path):
    """Provide a temporary SQLite engine for testing."""
    url = f"sqlite:///{tmp_path}/test.db"
    engine = create_engine(
        url,
        echo=False,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


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
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)


# =========================================
# API Fixtures
# =========================================


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def mark_logs_in_test():
    """Mark logs as being inside test context for duration of each test."""
    token = in_test_ctx.set(True)
    yield
    in_test_ctx.reset(token)
