from uuid import uuid4

import pytest

from backend.accounts import (
    CreateUserFullPayload,
    UserRead,
    UserRoles,
    ValidInstitutions,
)
from backend.accounts.users import service as user_manager_module


def assert_user_matches_payload(
    created_user: UserRead,
    request_payload: CreateUserFullPayload,
    role: UserRoles,
    institution: ValidInstitutions | None,
) -> None:
    user = request_payload.user

    assert created_user.id is not None
    assert created_user.first_name == user.first_name
    assert created_user.last_name == user.last_name
    assert created_user.username == user.username
    assert created_user.email == user.email
    assert created_user.roles == [role.value]
    assert created_user.institution == institution


def create_user_via_api(api_client, request_payload: CreateUserFullPayload) -> UserRead:
    response = api_client.post("/users/", json=request_payload.model_dump())
    assert response.status_code == 200
    return UserRead.model_validate(response.json())


@pytest.mark.parametrize(
    "institution",
    [ValidInstitutions.CPP, ValidInstitutions.NORCO, ValidInstitutions.UCR],
)
@pytest.mark.parametrize(
    "role",
    [UserRoles.STUDENT, UserRoles.DEVELOPER, UserRoles.TEACHER],
)
def test_create_user(
    api_client,
    build_user_payload,
    role: UserRoles,
    institution: ValidInstitutions | None,
) -> None:
    request_payload = build_user_payload(role=role, institution=institution)

    created_user = create_user_via_api(api_client, request_payload)

    assert_user_matches_payload(
        created_user,
        request_payload=request_payload,
        role=role,
        institution=institution,
    )


def test_create_user_defaults_to_student_role(
    api_client,
    build_user_payload,
) -> None:
    request_payload = build_user_payload()

    created_user = create_user_via_api(api_client, request_payload)

    assert_user_matches_payload(
        created_user,
        request_payload=request_payload,
        role=UserRoles.STUDENT,
        institution=None,
    )


def test_get_user_roles(api_client, build_user_payload) -> None:
    request_payload = build_user_payload()

    created_user = create_user_via_api(api_client, request_payload)
    assert created_user.id is not None

    response = api_client.get(f"/users/{created_user.id}/roles")

    assert response.status_code == 200

    role_response = UserRead.model_validate(response.json())

    assert role_response.id == created_user.id
    assert role_response.roles == [UserRoles.STUDENT.value]
    assert role_response.email == created_user.email


def test_get_user_by_id(api_client, build_user_payload) -> None:
    request_payload = build_user_payload(
        role=UserRoles.TEACHER,
        institution=ValidInstitutions.UCR,
    )
    created_user = create_user_via_api(api_client, request_payload)
    assert created_user.id is not None

    response = api_client.get(f"/users/{created_user.id}")

    assert response.status_code == 200

    user_response = response.json()

    assert user_response["id"] == str(created_user.id)
    assert user_response["first_name"] == request_payload.user.first_name
    assert user_response["last_name"] == request_payload.user.last_name
    assert user_response["username"] == request_payload.user.username
    assert user_response["email"] == request_payload.user.email


def test_get_user_by_id_returns_404_for_missing_user(api_client) -> None:
    missing_user_id = uuid4()

    response = api_client.get(f"/users/{missing_user_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == f"User '{missing_user_id}' not found"


def test_delete_user_by_id(api_client, build_user_payload, monkeypatch) -> None:
    deleted = {}

    def fake_delete_user(uid) -> None:
        deleted["uid"] = uid

    monkeypatch.setattr(user_manager_module.auth, "delete_user", fake_delete_user)

    request_payload = build_user_payload()
    created_user = create_user_via_api(api_client, request_payload)
    assert created_user.id is not None

    response = api_client.delete(f"/users/{created_user.id}")

    assert response.status_code == 200
    assert response.json() == {"detail": "user deleted"}
    assert deleted["uid"] == str(created_user.id)

    get_response = api_client.get(f"/users/{created_user.id}")

    assert get_response.status_code == 404


def test_delete_user_by_id_returns_404_for_missing_user(api_client) -> None:
    missing_user_id = uuid4()

    response = api_client.delete(f"/users/{missing_user_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == f"User '{missing_user_id}' not found"


def test_get_user_roles_by_id(api_client, build_user_payload) -> None:
    request_payload = build_user_payload(role=UserRoles.TEACHER)
    created_user = create_user_via_api(api_client, request_payload)
    assert created_user.id is not None

    response = api_client.get(f"/users/{created_user.id}/roles")

    assert response.status_code == 200

    role_response = UserRead.model_validate(response.json())

    assert role_response.id == created_user.id
    assert role_response.email == request_payload.user.email
    assert role_response.roles == [UserRoles.TEACHER.value]


def test_get_user_roles_by_id_returns_404_for_missing_user(api_client) -> None:
    missing_user_id = uuid4()

    response = api_client.get(f"/users/{missing_user_id}/roles")

    assert response.status_code == 404
    assert response.json()["detail"] == f"User '{missing_user_id}' not found"


def test_add_user_role(api_client, build_user_payload) -> None:
    request_payload = build_user_payload(role=UserRoles.STUDENT)
    created_user = create_user_via_api(api_client, request_payload)
    assert created_user.id is not None

    response = api_client.post(
        f"/users/{created_user.id}/roles",
        json={"role": UserRoles.DEVELOPER.value},
    )

    assert response.status_code == 200

    updated_user = UserRead.model_validate(response.json())

    assert updated_user.id == created_user.id
    assert updated_user.email == request_payload.user.email
    assert UserRoles.STUDENT.value in updated_user.roles
    assert UserRoles.DEVELOPER.value in updated_user.roles
    assert updated_user.roles.count(UserRoles.DEVELOPER.value) == 1


def test_add_user_role_returns_404_for_missing_user(api_client) -> None:
    missing_user_id = uuid4()

    response = api_client.post(
        f"/users/{missing_user_id}/roles",
        json={"role": UserRoles.DEVELOPER.value},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == f"User '{missing_user_id}' not found"
