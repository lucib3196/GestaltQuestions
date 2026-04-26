import requests
from fastapi import APIRouter

from src.core.config import get_settings

router = APIRouter(prefix="/users", tags=["health"])


@router.post("/login_test")
def emulator_login(email: str, password: str):
    """Testing endpoint for login using password and email

    Args:
        email (str):
        password (str):

    Returns:
        _type_: _description_
    """
    settings = get_settings()
    emulator_host = settings.FIREBASE_AUTH_EMULATOR_HOST or "host.docker.internal:9099"
    if not emulator_host.startswith(("http://", "https://")):
        emulator_host = f"http://{emulator_host}"
    emulator_host = emulator_host.rstrip("/")
    url = f"{emulator_host}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key"

    payload = {"email": email, "password": password, "returnSecureToken": True}

    response = requests.post(url, json=payload)
    return response.json()
