from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin.auth import verify_id_token
from starlette import status

bearer_scheme = HTTPBearer(auto_error=False)


def get_firebase_token(
    token: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict | None:
    try:
        if not token:
            raise ValueError("No Token")
        return verify_id_token(token.credentials)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Not logged in or Invalid credentials {e!s}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


FireBaseToken = Annotated[dict, Depends(get_firebase_token)]

__all__ = ["FireBaseToken", "bearer_scheme", "get_firebase_token"]
