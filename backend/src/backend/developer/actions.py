from enum import StrEnum

from backend.access_policy import AccessLevel


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


class DeveloperCollectionAction(StrEnum):
    VIEW = "view"
    CREATE_CHILD = "create_child"
    UPDATE = "update"
    DELETE = "delete"
    ADD_QUESTION = "add_question"
    REMOVE_QUESTION = "remove_question"
    SHARE = "share"


class DeveloperCollectionPolicy:
    _ACTION_ACCESS = {
        DeveloperCollectionAction.VIEW: AccessLevel.VIEW,
        DeveloperCollectionAction.ADD_QUESTION: AccessLevel.EDIT,
        DeveloperCollectionAction.REMOVE_QUESTION: AccessLevel.EDIT,
        DeveloperCollectionAction.DELETE: AccessLevel.FULL,
        DeveloperCollectionAction.UPDATE: AccessLevel.FULL,
        DeveloperCollectionAction.CREATE_CHILD: AccessLevel.FULL,
        DeveloperCollectionAction.SHARE: AccessLevel.FULL,
    }

    def required_level(self, action: DeveloperCollectionAction) -> AccessLevel:
        return self._ACTION_ACCESS[action]
