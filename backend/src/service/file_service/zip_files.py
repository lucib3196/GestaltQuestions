import zipfile
import io
from typing import Dict
from pathlib import PurePosixPath


def extract_zip_files(content: bytes) -> Dict[str, bytes]:
    """Extract non-directory files from a ZIP archive payload.

    Args:
        content: Raw bytes of a ZIP archive.

    Returns:
        A mapping of archive file paths to their extracted file bytes.
    """
    extracted_files = {}
    with zipfile.ZipFile(io.BytesIO(content), "r") as z:
        for info in z.infolist():
            # Skip directories
            if info.is_dir():
                continue
            # Clean up name
            member_path = PurePosixPath(info.filename.replace("\\", "/"))
            # Ensure nto absoulte
            if member_path.is_absolute() or ".." in member_path.parts:
                continue
            extracted_files[member_path] = z.read(member_path.as_posix())
    return extracted_files
