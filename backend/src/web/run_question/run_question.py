from uuid import UUID

from fastapi import APIRouter, HTTPException
from starlette import status

from src.core.logging import logger
from src.service.question_packaging.exceptions import MissingQuestionFileError
from src.service.question_packaging.models import PreparedQuestion
from src.service.question_packaging.question_package_builder import (
    QuestionPackageBuilder,
)
from src.web.dependencies import SettingDependency
from src.web.question_manager.dependencies import QuestionManagerDependency

from .sandbox_client import execute_sandbox_runtime


router = APIRouter(
    prefix="/runtime/questions",
    tags=["questions", "runtime"],
)


@router.get("/{qid}", response_model=PreparedQuestion)
async def get_question_configuration(
    qm: QuestionManagerDependency, qid: str | UUID
) -> PreparedQuestion:
    try:

        # Ensure question exist
        question = await qm.qdb.get_question(qid)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question {qid} does not exist",
            )

        # Get the question files and prepare
        question_files = await qm.get_question_filedata(qid)

        return QuestionPackageBuilder().build(question_files, question.isAdaptive)
    except MissingQuestionFileError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question does not contain question.html file",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed")


@router.post("/{qid}")
async def run_question(
    qm: QuestionManagerDependency,
    qid: str | UUID,
    app_settings: SettingDependency,
):
    sandbox_url = app_settings.SANDBOX_URL
    if not sandbox_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sandbox URL is not configured.",
        )

    try:
        question = await qm.qdb.get_question(qid)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question {qid} does not exist",
            )

        question_files = await qm.get_question_filedata(qid)
        bundle = QuestionPackageBuilder().build(question_files, question.isAdaptive)
    except MissingQuestionFileError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question does not contain question.html file",
        )
    except Exception as e:
        logger.exception("Failed to prepare question runtime bundle.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to prepare question runtime bundle.",
        ) from e

    if bundle.kind == "static":
        return bundle
    else:
        payload = bundle.runtime.model_dump(mode="json")  # type: ignore
        return await execute_sandbox_runtime(sandbox_url, payload)
