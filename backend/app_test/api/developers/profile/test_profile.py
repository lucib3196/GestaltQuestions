import pytest

from backend.accounts import UserRoles, ValidInstitutions


async def create_user(user_manager, build_user_payload, role):
    user_payload = build_user_payload(
        role=role,
        institution=ValidInstitutions.UCR,
    )
    return await user_manager.create_user(
        user_payload.user,
        role=user_payload.role,
        institution=user_payload.institution,
    )


@pytest.mark.asyncio
async def test_create_developer_profile_by_id(
    api_client,
    build_user_payload,
    user_manager,
):
    created_user = await create_user(
        user_manager,
        build_user_payload,
        UserRoles.DEVELOPER,
    )

    response = api_client.post(f"/developer/profile/{created_user.id}")

    assert response.status_code == 200
    profile_data = response.json()
    assert profile_data["user_id"] == str(created_user.id)


@pytest.mark.asyncio
async def test_get_developer_profile_by_id(
    api_client,
    build_user_payload,
    user_manager,
):
    created_user = await create_user(
        user_manager,
        build_user_payload,
        UserRoles.DEVELOPER,
    )
    create_response = api_client.post(f"/developer/profile/{created_user.id}")
    assert create_response.status_code == 200

    response = api_client.get(f"/developer/profile/{created_user.id}")

    assert response.status_code == 200
    profile_data = response.json()
    assert profile_data["user_id"] == str(created_user.id)


@pytest.mark.asyncio
async def test_create_developer_profile_by_id_returns_403_when_role_is_not_developer(
    api_client,
    build_user_payload,
    user_manager,
):
    created_user = await create_user(
        user_manager,
        build_user_payload,
        UserRoles.STUDENT,
    )

    response = api_client.post(f"/developer/profile/{created_user.id}")

    assert response.status_code == 403
    assert "Developer access requires one of: developer" in response.json()["detail"]
