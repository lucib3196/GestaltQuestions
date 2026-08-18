from enum import StrEnum

from backend.authorization import AccessLevel


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
        DeveloperCollectionAction.DELETE: AccessLevel.OWNER,
        DeveloperCollectionAction.UPDATE: AccessLevel.FULL,
        DeveloperCollectionAction.CREATE_CHILD: AccessLevel.FULL,
        DeveloperCollectionAction.SHARE: AccessLevel.FULL,
    }

    def required_level(self, action: DeveloperCollectionAction) -> AccessLevel:
        return self._ACTION_ACCESS[action]
