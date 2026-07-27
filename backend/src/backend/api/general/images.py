import base64
from mimetypes import guess_type

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import Response

from backend.api.deps import StorageDependency

router = APIRouter(prefix="/images", tags=["images"])


@router.get("/firebase")
async def get_firebase_image(storage: StorageDependency, path: str = Query(...)):
    content = storage.read(path)

    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    media_type = guess_type(path)[0] or "application/octet-stream"
    if not media_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File is not an image: {media_type}",
        )

    return Response(
        content=content,
        media_type=media_type,
        headers={"Cache-Control": "no-store"},
    )


@router.get("/firebase-data-url")
async def get_firebase_image_data_url(
    storage: StorageDependency,
    path: str = Query(...),
):
    content = storage.read(path)

    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    media_type = guess_type(path)[0] or "application/octet-stream"
    if not media_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File is not an image: {media_type}",
        )

    try:
        text = content.decode("utf-8")
        encoded = (
            text
            if text.startswith(("iVBOR", "/9j/", "R0lGOD", "UklGR"))
            else base64.b64encode(content).decode("utf-8")
        )
    except UnicodeDecodeError:
        encoded = base64.b64encode(content).decode("utf-8")

    return {"src": f"data:{media_type};base64,{encoded}"}
