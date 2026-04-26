import json
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Literal, Sequence, Union, cast

from firebase_admin import storage
from google.cloud.storage.blob import Blob

from src.core.logging import logger

STORAGE_TYPE = Literal["cloud", "local"]

from .base import Storage

__all__ = [
    "ABC",
    "Blob",
    "List",
    "Literal",
    "Path",
    "Sequence",
    "STORAGE_TYPE",
    "Storage",
    "Union",
    "abstractmethod",
    "cast",
    "json",
    "logger",
    "shutil",
    "storage",
]
