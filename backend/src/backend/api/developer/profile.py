from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.developer.exceptions import (
    DeveloperAccessDenied,
    DeveloperProfileError,
    DeveloperProfileNotSet,
)
from backend.developer.model import DeveloperProfile

from .dependencies import DeveloperProfileDependency

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/")
async def get_developer_profile(
    user: CurrentUser, service: DeveloperProfileDependency
) -> DeveloperProfile:
    try:
        return await service.get_profile(user)
    except DeveloperAccessDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e
    except DeveloperProfileNotSet as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve developer profile",
        ) from e


@router.post("/")
async def create_developer_profile(
    user: CurrentUser, service: DeveloperProfileDependency
) -> DeveloperProfile:
    try:
        return await service.set_profile(user)
    except DeveloperAccessDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create developer profile",
        ) from e


@router.get("/{user_id}")
async def get_developer_profile_by_id(
    user_id: str,
    service: DeveloperProfileDependency,
) -> DeveloperProfile:
    try:
        return await service.get_profile(user_id)
    except DeveloperAccessDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e
    except DeveloperProfileNotSet as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve developer profile",
        ) from e


@router.post("/{user_id}")
async def create_developer_profile_by_id(
    user_id: str,
    service: DeveloperProfileDependency,
) -> DeveloperProfile:
    try:
        return await service.get_or_create_profile(user_id)
    except DeveloperAccessDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create developer profile {e}",
        ) from e
