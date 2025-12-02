# Standard library
import asyncio
import json
import shutil
import tempfile
from io import BytesIO
from pathlib import Path

# Third-party
import httpx
from fastapi import APIRouter, HTTPException, UploadFile
from langchain_core.runnables.config import RunnableConfig
from pydantic import BaseModel

# Local imports
from ai_workspace.api.core.config import get_settings
from ai_workspace.api.core.logging import logger
from ai_workspace.api.service.gestalt_module import run_image, run_text

router = APIRouter(prefix="/gestal_module", tags=["code_generation"])
config: RunnableConfig = {"configurable": {"thread_id": "customer_123"}}

QUESTION_API = get_settings().QUESTION_API


async def convert_to_upload_file(
    filename: str, content: str | dict | bytes
) -> UploadFile:
    # Handle conversion
    if isinstance(content, str):
        content = content.encode()
    elif isinstance(content, dict):
        content = json.dumps(content).encode()

    return UploadFile(filename=filename, file=BytesIO(content))


async def read_file(file: UploadFile):
    await file.seek(0)
    file_bytes = await file.read()
    return (file.filename, file_bytes, file.content_type or "application/octet-stream")


class QuestionDataText(BaseModel):
    question: str


@router.post("/")
async def generate_gestalt_module(question: QuestionDataText):
    try:
        question_files = run_text(question.question, config)
        logger.info("Generated question success")
        question_meta = question_files["info.json"]
        # Prepare data
        tasks = []
        for filename, content in question_files.items():
            tasks.append(convert_to_upload_file(filename, content))
        files = await asyncio.gather(*tasks)

        file_data = await asyncio.gather(*(read_file(f) for f in files))
        httpx_files = [
            (
                "files",
                (filename, bytes_data, content_type or "application/octet-stream"),
            )
            for filename, bytes_data, content_type in file_data
        ]
        data = {
            "question_data": json.dumps(question_meta),
            "auto_handle_images": "true",
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{QUESTION_API}/questions/files", files=httpx_files, json=data
            )
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to handle question {e}")


@router.post("/image")
async def generate_gestalt_module_image(image: UploadFile):
    try:
        filename = image.filename or "untitled.png"
        with tempfile.TemporaryDirectory() as tmpdir:
            temp_path = Path(tmpdir) / filename
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            result = await run_image(temp_path, config=config)
            logger.info("Generated questions success")
        for r in result:
            question_files = r.get("files")
            if not question_files:
                continue
            question_meta = question_files.get("info.json")
            tasks = []
            for filename, content in question_files.items():
                tasks.append(convert_to_upload_file(filename, content))
            files = await asyncio.gather(*tasks)
            file_data = await asyncio.gather(*(read_file(f) for f in files))
            httpx_files = [
                (
                    "files",
                    (filename, bytes_data, content_type or "application/octet-stream"),
                )
                for filename, bytes_data, content_type in file_data
            ]
            data = {
                "question_data": json.dumps(question_meta),
                "auto_handle_images": "true",
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{QUESTION_API}/questions/files", files=httpx_files, json=data
                )
                return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to handle question {e}")
