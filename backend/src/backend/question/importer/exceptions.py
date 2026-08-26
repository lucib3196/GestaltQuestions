class QuestionImporterError(Exception):
    """Base error for question importer failures."""


class MissingQuestionMetadataError(QuestionImporterError):
    """Raised when an importer source does not contain the metadata file."""

    def __init__(self, metadata_filename: str, source_id: str | None = None) -> None:
        message = f"Missing required metadata file: {metadata_filename}"
        if source_id:
            message += f" for source {source_id}"
        super().__init__(message)
        self.metadata_filename = metadata_filename
        self.source_id = source_id
