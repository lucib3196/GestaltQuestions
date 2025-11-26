# Standard library
from pathlib import Path
from typing import Literal, Sequence
from uuid import UUID
import httpx
from pydantic import ValidationError
import json

# Third-party libraries
from fastapi import APIRouter, HTTPException

# Local application imports
from src.api.core import logger
from src.code_runner.models import QuizData
from src.api.service.question_resource import QuestionResourceDepencency
from src.api.dependencies import SettingDependency
from pydantic import BaseModel

router = APIRouter(prefix="/code_generation", tags=["code_generation", "questions"])


class Output(BaseModel):
    files: dict


@router.post("/code_generation/")
async def run_server(
    qr: QuestionResourceDepencency,
    question: str,
    app_settings: SettingDependency,
):
    ai_url = app_settings.AI_WORKSPACE_URL
    logger.info(f"This is the ai url {ai_url}")
    try:
        async with httpx.AsyncClient() as client:
            generate_endpoint = f"{ai_url}/gestalt_module/"
            payload = {
                "question": question
            }
            res = await client.post(generate_endpoint, json=payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute generation {e}")
    logger.info("This is the res %s", res)
    # Validate that the output is in the right form
    try:
        res = Output.model_validate(res)
    except ValidationError:
        raise HTTPException(
            status_code=400, detail="Received a payload in the incorrect form"
        )
