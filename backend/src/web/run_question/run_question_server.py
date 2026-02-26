import json
from pathlib import Path
from typing import Any, Dict, Tuple
from uuid import UUID

import httpx
from fastapi import APIRouter

from src.core import logger
from src.data import UserManagerDependeny
from src.types import (
    AllowedLanguages,
    AllowedServer,
    ID,
    MappingServer,
    QuizData,
    SandboxResponse,
    ServerExecutionError,
    ServerRunResponse,
    ServerRunSuccess,
)
from src.web.dependencies import (
    FireBaseToken,
    QuestionManagerDependency,
    SettingDependency,
)


router = APIRouter(prefix="/run_server", tags=["code_running", "questions"])


async def read_server_file(
    qid: ID, qm: QuestionManagerDependency, server_language: AllowedLanguages
) -> str:
    # Check that we got a valid language for execution
    server_file = MappingServer.get(server_language)
    if not server_file:
        raise ValueError(
            f"[WEB Run Server]: {server_language} not allowed for execution"
        )
    # Ensure that the retrieved files contain the file of interest
    question_files = await qm.retrieve_question_files(qid)
    normalized = [Path(q).name for q in question_files]
    logger.info(f"These are the normalized files {normalized}")
    if server_file not in normalized:
        raise ValueError(
            f"[WEB Run Server] {server_file} not present for question. Only files are {normalized}"
        )
    content = await qm.read_question_file(qid, server_file)
    return content.decode()


async def _validate(res: Any, language: AllowedLanguages) -> ServerRunResponse:
    # Ensure data is of right type
    try:
        raw_data = res.json()
        data = SandboxResponse.model_validate(raw_data)
    except Exception as e:
        raw_data = res.text
        return ServerExecutionError(
            error_type="validation",
            language=language,
            message=f"[WEB Question Running Failed to validate data Error: {e}",
        )
    # Check if the data output is not noen
    if not data.output:
        msg = (
            f"Sandbox executed file success but returned no quiz output. "
            f"Logs: {data.logs}"
        )
        logger.error(msg)
        return ServerExecutionError(
            error_type="validation", message=msg, language=language
        )
    try:
        # Try to validate the output and get the quiz data
        if isinstance(data.output, str):
            data.output = json.loads(data.output)
        quiz_data = QuizData.model_validate(data.output)
        # Append the log to the quiz data
        quiz_data.logs.extend(data.logs)
        logger.info(
            f"QuizData successfully generated for question . "
            f"Logs count: {len(quiz_data.logs)}"
        )
        return ServerRunSuccess(data=quiz_data)
    except Exception as e:
        msg = "Failed to get the quiz data Error: {e}"
        return ServerExecutionError(
            error_type="validation", language=language, message=msg
        )


@router.post("/{qid}/{server_language}", response_model=ServerRunResponse)
async def run_server(
    qid: str | UUID,
    server_language: AllowedLanguages,
    qm: QuestionManagerDependency,
    app_settings: SettingDependency,
) -> ServerRunResponse:

    sandbox_url = app_settings.SANDBOX_URL
    assert sandbox_url
    logger.info(f"This is the sandbox url {sandbox_url}")
    try:
        server_content = await read_server_file(qid, qm, server_language)
        assert server_content
    except Exception as e:
        return ServerExecutionError(
            error_type="dependency",
            language=server_language,
            message=f"[WEB Server]: Failed to execute server. File {server_language} does not exist for question {qid}",
        )

    # Execute the file
    try:
        async with httpx.AsyncClient() as client:
            generate_endpoint = f"{sandbox_url}/code_runner/generate"
            payload = {
                "language": server_language,
                "code": server_content,
            }
            logger.info(f"[RUNSERVER] This is the payload {payload}")
            res = await client.post(generate_endpoint, json=payload)
            res.raise_for_status()

    except httpx.HTTPStatusError as e:
        message = (
            f"Sandbox execution failed for question '{qid}' "
            f"language='{server_language}'  error: {e.response.text}'"
        )
        logger.error(message)
        return ServerExecutionError(
            error_type="runtime", message=message, language=server_language
        )
    # Validate the data and return the response
    return await _validate(res, server_language)


@router.post("/submit")
async def submit_answers(
    data: Dict[str, Any],
    user_manager: UserManagerDependeny,
    token: FireBaseToken,
):
    logger.info("Got quiz data", data)
    user = user_manager.get_user_by_fb(token["uid"])
    logger.info("User submitted answer %s", user.username)

    return {"status": data}
