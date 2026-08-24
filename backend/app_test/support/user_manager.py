import pytest
from sqlmodel import Session

from app_test.factories.user_factory import MakeUser
from backend.accounts import Role, User, UserRoles
from backend.accounts.users import UserManager, service as user_manager_module


# Create a User Manager which patches the create user to prevent a firebase call
@pytest.fixture
def user_manager(
    monkeypatch: pytest.MonkeyPatch,
    db_session: Session,
) -> UserManager:
    def fake_auth(
        email: str,
        display_name: str,
        uid: str,
        password: str,
    ) -> dict[str, str]:
        return {
            "email": email,
            "display_name": display_name,
            "uid": uid,
            "password": password,
        }

    monkeypatch.setattr(user_manager_module.auth, "create_user", fake_auth)
    return UserManager(
        session=db_session,
    )


@pytest.fixture
def student_user(make_user: MakeUser) -> User:
    return make_user(
        email="student@email.com", roles=[Role(name=UserRoles.STUDENT.value)]
    )
