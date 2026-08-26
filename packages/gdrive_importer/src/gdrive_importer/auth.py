from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from .exceptions import (
    DriveCredentialsNotFoundError,
    DriveOAuthFlowError,
    DriveServiceBuildError,
    DriveTokenLoadError,
    DriveTokenRefreshError,
    DriveTokenWriteError,
)


class DriveService:
    _SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


    def __init__(
        self,
        cred_path: str | Path,
        token_path: str | Path | None = None,
    ):
        self.credentials_path = Path(cred_path)
        if not self.credentials_path.exists():
            raise DriveCredentialsNotFoundError(
                f"Google OAuth credentials file does not exist: {self.credentials_path}"
            )
        self.token_path = (
            Path(token_path)
            if token_path
            else self.credentials_path.parent / "token.json"
        )

    def get_service(self):
        """Return an authenticated Google Drive API service, refreshing or creating a token as needed."""
        creds = None

        if self.token_path.exists():
            try:
                creds = Credentials.from_authorized_user_file(
                    self.token_path,
                    self._SCOPES,
                )
            except Exception as exc:
                raise DriveTokenLoadError(
                    f"Failed to load Google OAuth token from {self.token_path}"
                ) from exc

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as exc:
                    raise DriveTokenRefreshError(
                        f"Failed to refresh Google OAuth token from {self.token_path}"
                    ) from exc
            else:
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_path,
                        self._SCOPES,
                    )
                    creds = flow.run_local_server(port=0)
                except Exception as exc:
                    raise DriveOAuthFlowError(
                        "Failed to complete Google OAuth browser flow"
                    ) from exc

            try:
                self.token_path.write_text(creds.to_json())
            except Exception as exc:
                raise DriveTokenWriteError(
                    f"Failed to write Google OAuth token to {self.token_path}"
                ) from exc

        try:
            return build("drive", "v3", credentials=creds)
        except Exception as exc:
            raise DriveServiceBuildError(
                "Failed to create Google Drive API service"
            ) from exc


if __name__ == "__main__":

    root = Path(__file__).parents[2]
    cred_path = root / "credentials.json"
    token_path = root / "token.json"

    service = DriveService(cred_path, token_path)
    
    # (root / "data.json").write_text(json.dumps(to_serializable(results)))
