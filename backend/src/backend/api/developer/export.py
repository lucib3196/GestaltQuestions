from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.api.developer.dependencies import ExporterDep
from backend.shared import ID
from backend.storage import download_zip

router = APIRouter(
    prefix="/questions",
    tags=["Questions", "Export"],
)


@router.post("/{question_id}/download")
async def download_question_as_zip(
    question_id: ID,
    current_user: CurrentUser,
    downloader: ExporterDep,
):
    try:
        payload = await downloader.download_question(current_user, question_id)
        response = download_zip(payload.files, folder_name=payload.folder_name)
        return Response(
            content=response,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{payload.folder_name}.zip"'
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}"
        ) from e
