import re
from unicodedata import normalize

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
        ascii_title = (
            normalize("NFKD", payload.folder_name)
            .encode("ascii", "ignore")
            .decode("ascii")
        )
        words = re.findall(
            r"[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+", ascii_title
        )
        stem = "".join(word.capitalize() for word in words)
        stem = stem[:1].lower() + stem[1:100]
        filename = f"{stem or f'untitledQuestion{payload.question_id.hex[:5]}'}.zip"

        return Response(
            content=download_zip(payload.files, folder_name=payload.folder_name),
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}"
        ) from e


@router.post("/{question_id}/{filename}/download")
async def donwload_question_file(
    question_id: ID,
    filename: str,
    current_user: CurrentUser,
    downloader: ExporterDep,
):
    try:
        content = await downloader.download_question_file(
            current_user, question_id, filename
        )
        return Response(
            content=content,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}"
        ) from e
