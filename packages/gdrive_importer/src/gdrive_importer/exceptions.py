class DriveAuthError(Exception):
    """Base error for Google Drive authentication failures."""


class DriveCredentialsNotFoundError(DriveAuthError):
    """Raised when the OAuth client credentials file is missing."""


class DriveTokenLoadError(DriveAuthError):
    """Raised when an existing token file cannot be loaded."""


class DriveTokenRefreshError(DriveAuthError):
    """Raised when an expired token cannot be refreshed."""


class DriveOAuthFlowError(DriveAuthError):
    """Raised when the interactive OAuth flow fails."""


class DriveTokenWriteError(DriveAuthError):
    """Raised when refreshed OAuth credentials cannot be saved."""


class DriveServiceBuildError(DriveAuthError):
    """Raised when the Google Drive API service cannot be created."""