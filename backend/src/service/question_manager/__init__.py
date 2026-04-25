from typing import (
    Dict,
    List,
    Optional,
    Sequence,
    Set,
    Tuple,
    Union,
)
from src.core import logger
from src.service.file_service.utils import safe_dir_name
import base64
import mimetypes
from pathlib import Path
from uuid import UUID, uuid4

from google.cloud.storage.blob import Blob
from src.data import QuestionDB
from src.model.question import Question, QuestionData
from src.service.storage.base import Storage
from src.app_types.general import ID
from src.model.files import FileData
from copy import deepcopy