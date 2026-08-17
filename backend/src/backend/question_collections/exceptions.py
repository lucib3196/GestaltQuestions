class QuestionCollectionError(Exception):
    """Base exception for question collection failures."""


class QuestionCollectionNotFoundError(QuestionCollectionError, LookupError):
    def __init__(self, collection_id: str | None = None) -> None:
        message = "Question collection does not exist"
        if collection_id:
            message += f": {collection_id}"
        super().__init__(message)


class QuestionAlreadyInCollectionError(QuestionCollectionError):
    def __init__(
        self,
        collection_title: str,
        question_title: str,
    ) -> None:

        self.collection_title = collection_title
        self.question_title = question_title

        super().__init__(
            f'Could not add "{question_title}" to "{collection_title}" because that question is already in this collection.'
        )


class QuestionCollectionValidationError(QuestionCollectionError, ValueError):
    def __init__(self, reason: str) -> None:
        super().__init__(f"Invalid question collection request: {reason}")


class QuestionCollectionDeleteError(QuestionCollectionError, Exception):
    def __init__(
        self,
        collection_id: str | None,
        owner_id: str | None,
    ) -> None:
        message = f"Cannot delete question {collection_id}"
        if owner_id:
            message += f": Profile {owner_id} cannot delete collection must be owner"
        super().__init__(message)


class QuestionCollectionOperationError(QuestionCollectionError):
    def __init__(self, action: str, details: str = "") -> None:
        message = f"Failed to {action} question collection"
        if details:
            message += f": {details}"
        super().__init__(message)
