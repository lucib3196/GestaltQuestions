from google.cloud.storage.blob import Blob
from pathlib import Path
from typing import Literal
from src.core.logging import logger
STORAGE_TYPE = Literal["cloud", "local"]

