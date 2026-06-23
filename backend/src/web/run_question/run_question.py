from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from starlette import status

from src.core.logging import logger
from src.model.files import FileData
from src.model.question import QuestionRead
from src.model.question_attempt import QuizData
from src.service.question_rendering.parser import TemplateParser
from src.service.question_runtime.exceptions import MissingQuestionFileError
from src.service.question_runtime.models import PreparedQuestion
from src.service.question_runtime.question_runtime import (
    QuestionRunTime,
)
from src.web.dependencies import SettingDependency
from src.web.question_manager.dependencies import QuestionManagerDependency


def get_runtime(app_settings: SettingDependency) -> QuestionRunTime:
    return QuestionRunTime(base_url=app_settings.SANDBOX_URL)


QuestionRuntimeDependency = Annotated[QuestionRunTime, Depends(get_runtime)]

router = APIRouter(
    prefix="/runtime/questions",
    tags=["questions", "runtime"],
)


class RenderedQuestionBundle(BaseModel):
    instance: UUID = Field(default_factory=uuid4)
    question_meta: QuestionRead
    question_html: str
    solution_html: str | None = None
    files: list[FileData]
    logs: list[str] | None = None
    quiz_data: QuizData | dict | None = None


@router.get("/{qid}", response_model=PreparedQuestion)
async def get_question_configuration(
    qm: QuestionManagerDependency,
    qrun: QuestionRuntimeDependency,
    qid: str | UUID,
    language: Literal["javascript", "python"] | None = Query(default=None),
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

        return qrun.build(question_files, question.isAdaptive, language=language)
    except MissingQuestionFileError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question does not contain question.html file",
        ) from None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed {e}") from e


@router.post("/{qid}")
async def run_question(
    qm: QuestionManagerDependency,
    qid: str | UUID,
    qrun: QuestionRuntimeDependency,
    language: Literal["javascript", "python"] | None = Query(default=None),
) -> RenderedQuestionBundle:

    # Attempt to resolve the bundle for the question
    try:
        # Get the qmeta and the files
        question_metadata = await qm.get_question(qid, method="full")
        question_files = await qm.get_question_filedata(qid)
        bundle = qrun.build(
            question_files, question_metadata.isAdaptive, language=language
        )
    except MissingQuestionFileError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question does not contain question.html file",
        ) from None
    except Exception as e:
        logger.exception("Failed to prepare question runtime bundle.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to prepare question runtime bundle. {e}",
        ) from e

    # Actual Logic for proper rendiering of the question

    if bundle.kind == "static":
        return RenderedQuestionBundle(
            question_meta=question_metadata,
            question_html=bundle.question_files.question_html,
            solution_html=bundle.question_files.solution_html,
            files=question_files,
        )
    payload = bundle.runtime.model_dump(mode="json")  # type: ignore
    raw_output = await qrun.execute(payload)
    output = raw_output.get("output", None)
    logs = raw_output.get("logs", None)

    formatted_question = TemplateParser().render(
        bundle.question_files.question_html, output or {}
    )
    formatted_solution = TemplateParser().render(
        bundle.question_files.solution_html or "", output or {}
    )
    return RenderedQuestionBundle(
        question_meta=question_metadata,
        question_html=formatted_question,
        solution_html=formatted_solution,
        files=question_files,
        logs=logs,
        quiz_data=output,
    )
