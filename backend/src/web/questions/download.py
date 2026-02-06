from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from starlette import status


from src.web.dependencies import (
    QuestionManagerDependency,
)

router = APIRouter(
    prefix="/questions/download",
    tags=["questions", "download"],
)


@router.post("/{qid}")
async def download_question(
    qid: str | UUID,
    qm: QuestionManagerDependency,
):
    try:
        zip_bytes, folder_name = await qm.download_as_zip(qid)

        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{folder_name}.zip"'
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not download question as zip {e}",
        )


@router.post("/{qid}/filename")
async def download_question_file(
    qid: str | UUID,
    filename: str,
    qm: QuestionManagerDependency,
    qr: QuestionManagerDependency,
):
    try:
        zip_bytes, folder_name = await qm.download_file_as_zip(qid, filename)
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={folder_name}.zip"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not download file {filename}: {e}",
        )
