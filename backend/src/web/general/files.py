import io
import zipfile
from pathlib import Path, PurePosixPath

from fastapi import APIRouter, HTTPException, UploadFile

from src.service.storage.base import Storage
from src.utils import safe_dir_name
from src.web.dependencies import StorageDependency

router = APIRouter()


async def upload_zip_and_extract(
    file: UploadFile, storage: Storage, path: str | Path
) -> dict[str, str | int]:
    filename = file.filename
    if not filename:
        raise ValueError(f"File {file} has no name")
    if not filename.endswith(".zip"):
        ext = filename.split(".")[-1]
        raise ValueError(f"Expected zip file extension, received '{ext}'")

    root_path = PurePosixPath(Path(path).as_posix())
    cleaned_name = safe_dir_name(filename.removesuffix(".zip"))
    folder_path = root_path / cleaned_name

    contents = await file.read()
    if not contents:
        raise ValueError("Zip file is empty")

    # Upload raw zip bytes.
    zip_blob_path = (folder_path / filename).as_posix()
    storage.write(zip_blob_path, contents)

    extracted_files = 0
    with zipfile.ZipFile(io.BytesIO(contents), "r") as zip_ref:
        for info in zip_ref.infolist():
            if info.is_dir():
                continue

            member_path = PurePosixPath(info.filename.replace("\\", "/"))
            if member_path.is_absolute() or ".." in member_path.parts:
                continue

            target_path = (folder_path / member_path).as_posix()
            storage.write(target_path, zip_ref.read(info))
            extracted_files += 1

    return {
        "detail": f"Uploaded zip and extracted files to {folder_path.as_posix()}",
        "zip_path": zip_blob_path,
        "files_extracted": extracted_files,
    }


@router.post("/upload_zip")
async def upload_zip(
    file: UploadFile, storage: StorageDependency, path: str = "questions"
):
    try:
        return await upload_zip_and_extract(file, storage, path)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
