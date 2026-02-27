from fastapi import APIRouter, UploadFile
from src.web.dependencies import StorageDependency
from pydantic import BaseModel
from src.service.file_service.zip_files import extract_zip_files
from src.service.file_service.utils import safe_dir_name


router = APIRouter(
    prefix="/questions/upload",
    tags=["questions", "upload", "files"],
)


class UploadZipResponse(BaseModel):
    detail: str
    zip_path: str
    file_count: int


@router.post("/upload_zip")
async def upload_zip(file: UploadFile, storage: StorageDependency) -> UploadZipResponse:
    filename = file.filename

    # Validate the zip file
    if not filename:
        raise ValueError(f"File {file} has no name")
    if not filename.endswith(".zip"):
        ext = filename.split(".")[-1]
        raise ValueError(f"Expected zip file extension, received '{ext}'")
    content = await file.read()
    if not content:
        raise ValueError("Zip file is empty")

    # Create the base path to store the content
    base = f"{"questions"}/{safe_dir_name(f'{filename.removesuffix(".zip")}')}"
    # Extract and reset file

    extracted_files = extract_zip_files(content)
    await file.seek(0)

    # Write the content
    # Ensure dir exist
    storage.create_dir(base)

    for filename, content in extracted_files.items():
        target = f"{base}/{filename}"
        storage.write(target, content)

    return UploadZipResponse(
        detail=f"Uploaded zip and extracted files to {base}",
        zip_path=base,
        file_count=len(extracted_files),
    )
