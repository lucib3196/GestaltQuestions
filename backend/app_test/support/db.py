from collections.abc import Generator

import pytest
from sqlmodel import Session, SQLModel, create_engine

from backend.auth import (
    InstitutionDB,
    Role,
    RoleDB,
    UserDB,
    UserRoles,
    ValidInstitutions,
)
from backend.chat.model import Message, Thread  # noqa: F401
from backend.core.logging import in_test_ctx, logger
from backend.question.services.qtype import QuestionQTypeDB


@pytest.fixture(scope="function")
def test_engine(tmp_path):
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
def db_session(test_engine) -> Generator[Session]:
    with Session(test_engine, expire_on_commit=False) as session:
        yield session
        session.rollback()


@pytest.fixture(autouse=True)
def _clean_db(db_session, test_engine) -> None:
    logger.debug("Cleaning Database")
    SQLModel.metadata.drop_all(test_engine)
    SQLModel.metadata.create_all(test_engine)


@pytest.fixture(autouse=True)
def mark_logs_in_test():
    token = in_test_ctx.set(True)
    yield
    in_test_ctx.reset(token)


@pytest.fixture
def seed_qtypes(db_session) -> None:
    QuestionQTypeDB(db_session).seed_types()


@pytest.fixture
def institution_db(db_session) -> InstitutionDB:
    return InstitutionDB(db_session)


@pytest.fixture
def seed_institution(institution_db):
    async def _seed(institution: ValidInstitutions = ValidInstitutions.CPP):
        return await institution_db.create_institution(institution)

    return _seed


@pytest.fixture
def seed_roles(db_session: Session):
    roles = [
        Role(name=UserRoles.STUDENT.value),
        Role(name=UserRoles.ADMIN.value),
        Role(name=UserRoles.DEVELOPER.value),
    ]
    db_session.add_all(roles)
    db_session.commit()
    return roles


@pytest.fixture
def role_db(db_session: Session) -> RoleDB:
    return RoleDB(db_session)


@pytest.fixture
def user_db(db_session) -> UserDB:
    return UserDB(db_session)
