from collections.abc import Generator
from pathlib import Path

import pytest
import pytest_asyncio
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from backend.accounts import InstitutionDB, UserDB
from backend.authorization.roles.repository import RoleDB
from backend.chat.model import Message, Thread  # noqa: F401
from backend.core.logging import in_test_ctx, logger
from backend.question.services.qtype import QuestionQTypeDB


@pytest.fixture(scope="function")
def test_engine(tmp_path: Path) -> Generator[Engine]:
    url = f"sqlite:///{tmp_path}/test.db"
    engine = create_engine(
        url,
        echo=False,
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(test_engine: Engine) -> Generator[Session]:
    with Session(test_engine, expire_on_commit=False) as session:
        yield session
        session.rollback()


@pytest.fixture(autouse=True)
def _clean_db(db_session: Session, test_engine: Engine) -> None:  # noqa: ARG001
    logger.debug("Cleaning Database")
    SQLModel.metadata.drop_all(test_engine)
    SQLModel.metadata.create_all(test_engine)


@pytest.fixture(autouse=True)
def mark_logs_in_test() -> Generator[None]:
    token = in_test_ctx.set(True)
    yield
    in_test_ctx.reset(token)


@pytest.fixture
def seed_qtypes(db_session: Session) -> None:
    QuestionQTypeDB(db_session).seed_types()


@pytest.fixture
def institution_db(db_session: Session) -> InstitutionDB:
    return InstitutionDB(db_session)


@pytest_asyncio.fixture(autouse=True)
async def seed_institution(institution_db: InstitutionDB) -> None:
    await institution_db.seed_institution()


@pytest.fixture
def role_db(db_session: Session) -> RoleDB:
    return RoleDB(db_session)


@pytest_asyncio.fixture(autouse=True)
async def seed_roles(role_db: RoleDB) -> None:
    await role_db.seed_roles()


@pytest.fixture
def user_db(db_session: Session) -> UserDB:
    return UserDB(db_session)
