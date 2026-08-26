from fastapi import APIRouter, HTTPException, UploadFile
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.question import Question, Status

from .dependencies import DevImporterDep

router = APIRouter(
    prefix="/import",
    tags=["Question Import"],
)


@router.post("/zip", status_code=status.HTTP_201_CREATED)
async def import_zip_question(
    current_user: CurrentUser,
    importer: DevImporterDep,
    file: UploadFile,
    question_status: Status | None = Status.DRAFT,
) -> Question:
    try:
        filename = file.filename or ""
        if not filename.endswith(".zip"):
            raise ValueError("Expected a .zip file")

        content = await file.read()
        if not content:
            raise ValueError("Zip file is empty")

        print("This is the content", content)

        return await importer.import_zip_question(
            user_id=current_user,
            content=content,
            status=question_status,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to import zip question: {e}",
        ) from e
