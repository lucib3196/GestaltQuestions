from typing import Dict, List, Optional, Sequence, Set, Tuple, Union, Any
from src.core import logger
from src.service.file_service.utils import safe_dir_name
import base64
import mimetypes
from pathlib import Path, PurePosixPath
from uuid import UUID, uuid4

from google.cloud.storage.blob import Blob

from src.model.question import Question, QuestionData, QuestionUpdate
from src.service.storage.base import Storage
from src.app_types.general import ID
from src.model.files import FileData
from copy import deepcopy
from src.data.question import QuestionDB

# Import custom exceptions
from .exceptions import (
    QuestionManagerException,
    StoragePathNotFoundError,
    StorageOperationError,
    StorageDirectoryNotFoundError,
    QuestionNotFoundError,
    QuestionCreationError,
    QuestionUpdateError,
    QuestionDeletionError,
    FileOperationError,
    InvalidFileError,
    FileSaveError,
    FileListError,
    InvalidQuestionDataError,
    MissingQuestionDataError,
    PathNormalizationError,
    InvalidPathError,
)
