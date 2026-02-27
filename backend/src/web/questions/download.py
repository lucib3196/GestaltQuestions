from uuid import UUID
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from starlette import status

from src.web.dependencies import (
    QuestionManagerDependency,
    QuestionDBDependency,
    StorageDependency,
)
from pathlib import PurePosixPath
from typing import Dict
from src.service.file_service.zip_files import download_zip

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/questions/download",
    tags=["questions", "questions_download", "download"],
)


@router.post("/{qid}")
async def download_question(
    qid: str | UUID,
    qdb: QuestionDBDependency,
    storage: StorageDependency,
):
    """Download all files for a question as a ZIP archive.

    The endpoint resolves the question and its storage path, reads all files
    under that path, and returns a ZIP file named after the question title.
    """
    try:
        storage_type = storage.get_storage_type()
        logger.info(
            "[QDownload] Starting question download for qid=%s storage=%s",
            qid,
            storage_type,
        )

        q = await qdb.get_question(qid)
        if not q:
            logger.warning("[QDownload] Question not found for qid=%s", qid)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question not found: {qid}",
            )

        question_path = await qdb.get_question_path(qid, storage_type)
        if not question_path:
            logger.error(
                "[QDownload] Missing question path for qid=%s storage=%s",
                qid,
                storage_type,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not determine question path for download",
            )

        data: Dict[str, bytes] = {}
        file_count = 0

        for f in storage.list(question_path, recursive=True):
            c = storage.read(f)
            if c:
                filename = (PurePosixPath(f).relative_to(question_path)).as_posix()
                data[filename] = c
                file_count += 1

        logger.info("[QDownload] Prepared %s files for qid=%s", file_count, qid)
        response = download_zip(data, q.title)
        return Response(
            content=response,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{q.title}.zip"'},
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("[QDownload] Unexpected error while downloading qid=%s", qid)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not download question as zip",
        )


@router.post("/{qid}/{filename}")
async def download_question_file(
    qid: str | UUID, filename: str, qm: QuestionManagerDependency
):
    try:
        """Download one file from a question as a ZIP attachment.

        Reads `filename` for the given `qid` and returns a single-file ZIP named
        `download.zip`.
        """
        logger.info(
            "[QDownload] Starting single-file download qid=%s filename=%s",
            qid,
            filename,
        )

        content = await qm.read_question_file(qid, filename)
        if not content:
            logger.warning(
                "[QDownload] File not found or empty qid=%s filename=%s", qid, filename
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found: {filename}",
            )

        response = download_zip({filename: content}, "download")
        return Response(
            content=response,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=download.zip"},
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception(
            "[QDownload] Failed single-file download qid=%s filename=%s", qid, filename
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not download file {filename}",
        )
