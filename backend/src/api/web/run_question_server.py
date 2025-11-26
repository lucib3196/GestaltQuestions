# Standard library
from pathlib import Path
from typing import Literal
from uuid import UUID
import httpx

# Third-party libraries
from fastapi import APIRouter, HTTPException
from starlette import status

# Local application imports
from src.api.core import logger
from src.code_runner.models import QuizData
from src.api.service.question_resource import QuestionResourceDepencency
from src.api.dependencies import SettingDependency

router = APIRouter(prefix="/run_server", tags=["code_running", "questions"])

MAPPING_DB = {"python": "server.py", "javascript": "server.js"}
MAPPPING_FILENAME = {"python": "server.py", "javascript": "server.js"}


@router.post("/{qid}/{server_language}")
async def run_server(
    qid: str | UUID,
    server_language: Literal["python", "javascript"],
    qr: QuestionResourceDepencency,
    app_settings: SettingDependency,
):
    sandbox_url = app_settings.SANDBOX_URL
    if server_language not in MAPPPING_FILENAME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language: {server_language}",
        )

    server_file = MAPPPING_FILENAME[server_language]
    question_files = await qr.list_all_question_files(qid)

    if server_file not in question_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question does not contain file {server_file}",
        )

    try:
        server_path = await qr.get_question_file(qid, server_file)
        server_content = Path(server_path).read_text()
        async with httpx.AsyncClient() as client:
            generate_endpoint = f"{sandbox_url}/code_runner/generate"
            data = {
                "language": server_language,
                "code": server_content,
            }
            res = await client.post(generate_endpoint, json=data)
            logger.info("Got Sandbox response %s", res)
    except Exception as e:
        logger.exception("Error running server file")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running {server_language} file {server_file}: {str(e)}",
        ) from e

    try:
        data = res.json()
    except ValueError:
        data = res.text

    return {"data": f"{data}"}

    # if not run_response.quiz_response:
    #     raise HTTPException(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         detail="Code ran successfully but quiz data is None",
    #     )

    # return run_response.quiz_response
