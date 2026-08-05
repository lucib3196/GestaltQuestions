class QuestionCollectionError(Exception):
    """Base exception for question collection failures."""


class QuestionCollectionNotFoundError(QuestionCollectionError, LookupError):
    def __init__(self, collection_id: str | None = None) -> None:
        message = "Question collection does not exist"
        if collection_id:
            message += f": {collection_id}"
        super().__init__(message)


class QuestionCollectionValidationError(QuestionCollectionError, ValueError):
    def __init__(self, reason: str) -> None:
        super().__init__(f"Invalid question collection request: {reason}")


class QuestionCollectionOperationError(QuestionCollectionError):
    def __init__(self, action: str, details: str = "") -> None:
        message = f"Failed to {action} question collection"
        if details:
            message += f": {details}"
        super().__init__(message)
