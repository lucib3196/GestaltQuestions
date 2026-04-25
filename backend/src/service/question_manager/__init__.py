import base64
import mimetypes
import re
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any, List, Optional, Sequence, Union

from google.cloud.storage.blob import Blob
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from src.app_types.general import ID
from src.core.logging import logger
from src.data.question import QuestionDB
from src.model.files import FileData
from src.model.question import Question, QuestionCreate, QuestionRead, QuestionUpdate
from src.model.users import DeveloperProfile, UserRoles
from src.service.storage.base import Storage
from src.service.user.user_manager import UserManager
from src.utils.database_utils import convert_uuid

from .exceptions import (
    DeveloperAccessDenied,
    DeveloperQuestionControlError,
    DeveloperProfileError,
    DeveloperQuestionServiceError,
    FileListError,
    InvalidFileError,
    FileOperationError,
    FileSaveError,
    InvalidPathError,
    InvalidQuestionDataError,
    MissingQuestionDataError,
    PathNormalizationError,
    QuestionCreationError,
    QuestionDeletionError,
    QuestionManagerException,
    QuestionNotFoundError,
    QuestionUpdateError,
    StorageDirectoryNotFoundError,
    StorageOperationError,
    StoragePathNotFoundError,
)
