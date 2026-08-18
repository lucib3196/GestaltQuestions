from enum import StrEnum

from backend.authorization import AccessLevel

class DeveloperQuestionAction(StrEnum):
    VIEW = "view"
    COPY = "copy"
    UPDATE = "update"
    DELETE = "delete"
    READ_FILE = "read_file"
    WRITE_FILE = "write_file"
    DELETE_FILE = "delete_file"
    UPLOAD_FILES = "upload_files"
    DOWNLOAD = "download"


class DeveloperQuestionPolicy:
    """Maps developer question actions to required access levels."""

    _ACTION_ACCESS = {
        DeveloperQuestionAction.VIEW: AccessLevel.VIEW,
        DeveloperQuestionAction.COPY: AccessLevel.VIEW,
        DeveloperQuestionAction.UPDATE: AccessLevel.EDIT,
        DeveloperQuestionAction.DELETE: AccessLevel.FULL,
        DeveloperQuestionAction.READ_FILE: AccessLevel.VIEW,
        DeveloperQuestionAction.WRITE_FILE: AccessLevel.EDIT,
        DeveloperQuestionAction.DELETE_FILE: AccessLevel.EDIT,
        DeveloperQuestionAction.UPLOAD_FILES: AccessLevel.EDIT,
        DeveloperQuestionAction.DOWNLOAD: AccessLevel.VIEW,
    }

    def required_level(self, action: DeveloperQuestionAction) -> AccessLevel:
        return self._ACTION_ACCESS[action]
