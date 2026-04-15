from pathlib import Path
from firebase_admin import credentials
import firebase_admin
from functools import lru_cache
from src.core import get_settings

import os

app_settings = get_settings()
if app_settings.FIREBASE_AUTH_EMULATOR_HOST:
    os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = app_settings.FIREBASE_AUTH_EMULATOR_HOST
if app_settings.STORAGE_EMULATOR_HOST:
    os.environ["STORAGE_EMULATOR_HOST"] = app_settings.STORAGE_EMULATOR_HOST


@lru_cache
def initialize_firebase_app():
    try:

        cred = credentials.Certificate(app_settings.FIREBASE_CRED)

        return firebase_admin.initialize_app(
            cred, {"storageBucket": app_settings.STORAGE_BUCKET}
        )

    except Exception as e:
        raise ValueError(f"Could not initialize credentials error {str(e)}")


if __name__ == "__main__":
    print("🔥 Firebase Mode:")
    print(app_settings.FIREBASE_AUTH_EMULATOR_HOST)
    print("Auth Emulator:", os.getenv("FIREBASE_AUTH_EMULATOR_HOST"))
    print("Storage Emulator:", os.getenv("STORAGE_EMULATOR_HOST"))
    fb = initialize_firebase_app()
    print(fb)
