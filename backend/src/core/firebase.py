from pathlib import Path
from firebase_admin import credentials
import firebase_admin
from functools import lru_cache
from src.core import get_settings


app_settings = get_settings()


@lru_cache
def initialize_firebase_app():

    try:
        cred = credentials.Certificate(app_settings.FIREBASE_CRED)
        bucket_name = app_settings.STORAGE_BUCKET
        if not bucket_name:
            raise ValueError("No Bucket Specified must be set in Environment")
        firebase_admin.initialize_app(cred, {"storageBucket": bucket_name})
    except Exception as e:
        raise ValueError(f"Could not initialize creditionals error {str(e)}")


if __name__ == "__main__":
    fb = initialize_firebase_app()
