from collections.abc import Mapping
from typing import Any, Protocol
from uuid import uuid4

import pytest
from sqlmodel import select

from backend.accounts import (
    CreateUserFullPayload,
    Institution,
    User,
    UserCreate,
    ValidInstitutions,
)
from backend.authorization.roles import UserRoles


class MakeUser(Protocol):
    def __call__(self, **overrides: Any) -> User: ...


@pytest.fixture
def make_user(db_session) -> MakeUser:
    def get_institution(inst: ValidInstitutions) -> Institution:
        institution = db_session.exec(
            select(Institution).where(Institution.name == inst)
        ).first()
        if institution is not None:
            return institution
        institution = Institution(name=inst)
        db_session.add(institution)
        db_session.flush()
        return institution

    def make(**overrides: Any) -> User:
        institution = overrides.pop("institution", None)
        user = User(
            id=overrides.pop("id", uuid4()),
            first_name=overrides.pop("first_name", "Test"),
            last_name=overrides.pop("last_name", "User"),
            email=overrides.pop("email", f"{uuid4()}@example.com"),
            **overrides,
        )
        db_session.add(user)
        if isinstance(institution, ValidInstitutions):
            user.institution = get_institution(institution)
        elif isinstance(institution, Institution):
            user.institution = institution
        elif institution is not None:
            raise TypeError(
                "institution must be a ValidInstitutions enum or Institution model."
            )

        db_session.commit()
        db_session.refresh(user)
        return user

    return make


class BuildUserPayload(Protocol):
    def __call__(
        self,
        *,
        user_overrides: Mapping[str, Any] | None = None,
        role: UserRoles = UserRoles.STUDENT,
        institution: ValidInstitutions | None = None,
    ) -> CreateUserFullPayload: ...


@pytest.fixture
def build_user_payload() -> BuildUserPayload:
    def build(
        *,
        user_overrides: Mapping[str, Any] | None = None,
        role: UserRoles = UserRoles.STUDENT,
        institution: ValidInstitutions | None = None,
    ) -> CreateUserFullPayload:
        unique = uuid4().hex

        default_user = {
            "first_name": "Ada",
            "last_name": "Lovelace",
            "username": f"ada_{unique}",
            "password": "test-password-123",
            "email": f"ada_{unique}@example.com",
        }

        return CreateUserFullPayload(
            user=UserCreate(**{**default_user, **(user_overrides or {})}),
            role=role,
            institution=institution,
        )

    return build
