import zipfile
import io
from typing import Dict
from pathlib import PurePosixPath, Path
from typing import Optional
from .utils import safe_dir_name


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


def download_zip(
    files: Dict[str, bytes | bytearray], folder_name: Optional[str] = None
) -> bytes:

    buffer = io.BytesIO()

    folder_name = safe_dir_name(folder_name) if folder_name else "Download_Zip"

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as z:
        for filename, content in files.items():
            target = f"{folder_name}/{filename}"
            z.writestr(target, content)

    buffer.seek(0)
    return buffer.getvalue()
