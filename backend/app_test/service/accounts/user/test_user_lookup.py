from typing import Any
from backend.accounts import Role
import pytest
from sqlalchemy import select
from backend.accounts import UserRoles, ValidInstitutions, Institution
from backend.accounts.users import UserLookup

MOCK_USER_LOOKUP_DATA: list[dict[str, Any]] = [
    {
        "first_name": "Maya",
        "last_name": "Chen",
        "username": "maya.student",
        "email": "maya.student@example.com",
        "institution": ValidInstitutions.UCR,
        "roles": [UserRoles.STUDENT],
    },
    {
        "first_name": "Noah",
        "last_name": "Patel",
        "username": "noah.dev",
        "email": "noah.dev@example.com",
        "institution": ValidInstitutions.CPP,
        "roles": [UserRoles.DEVELOPER],
    },
    {
        "first_name": "Ava",
        "last_name": "Rivera",
        "username": "ava.admin",
        "email": "ava.admin@example.com",
        "institution": ValidInstitutions.NORCO,
        "roles": [UserRoles.ADMIN],
    },
    {
        "first_name": "Liam",
        "last_name": "Brooks",
        "username": "liam.devstudent",
        "email": "liam.devstudent@example.com",
        "institution": ValidInstitutions.UCR,
        "roles": [UserRoles.STUDENT, UserRoles.DEVELOPER],
    },
    {
        "first_name": "Sophia",
        "last_name": "Kim",
        "username": "sophia.cpp",
        "email": "sophia.cpp@example.com",
        "institution": ValidInstitutions.CPP,
        "roles": [UserRoles.STUDENT],
    },
]


@pytest.fixture
def roles_by_name(db_session):
    return {
        role.name: role
        for role in db_session.scalars(
            select(Role).where(
                Role.name.in_( # type: ignore
                    [
                        UserRoles.STUDENT.value,
                        UserRoles.DEVELOPER.value,
                        UserRoles.ADMIN.value,
                        UserRoles.TEACHER.value,
                    ]
                )
            )
        ).all()
    }


@pytest.fixture
def institutions_by_name(db_session):
    institution_names = [
        ValidInstitutions.CPP.value,
        ValidInstitutions.UCR.value,
        ValidInstitutions.NORCO.value,
    ]

    return {
        institution.name: institution
        for institution in db_session.scalars(
            select(Institution).where(Institution.name.in_(institution_names)) # type: ignore
        ).all()
    }


@pytest.fixture
def lookup_users(make_user, roles_by_name, institutions_by_name):
    roles_by_name = roles_by_name
    institutions_by_name = institutions_by_name

    users = []
    for user_data in MOCK_USER_LOOKUP_DATA:
        users.append(
            make_user(
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                username=user_data["username"],
                email=user_data["email"],
                institution=institutions_by_name[user_data["institution"]],
                roles=[roles_by_name[role.value] for role in user_data["roles"]],
            )
        )

    return users


def test_find_users_returns_any_matching_role(db_session, lookup_users) -> None:
    users = UserLookup(db_session).find_users(
        roles=[UserRoles.DEVELOPER],
    )

    assert {user.email for user in users} == {
        "noah.dev@example.com",
        "liam.devstudent@example.com",
    }


def test_find_users_filters_by_query(db_session, lookup_users) -> None:
    users = UserLookup(db_session).find_users(
        roles=[UserRoles.STUDENT, UserRoles.DEVELOPER],
        query="liam",
    )

    assert [user.email for user in users] == ["liam.devstudent@example.com"]


def test_find_users_filters_by_institution(db_session, lookup_users) -> None:
    ucr = lookup_users[0].institution

    users = UserLookup(db_session).find_users(
        roles=[UserRoles.STUDENT],
        institution=ucr,
    )

    assert {user.email for user in users} == {
        "maya.student@example.com",
        "liam.devstudent@example.com",
    }
