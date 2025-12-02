# Standard library
import asyncio
import json
import shutil
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Dict

# Third-party
import httpx
from fastapi import APIRouter, HTTPException, UploadFile
from langchain_core.runnables.config import RunnableConfig
from pydantic import BaseModel
from starlette import status

# Local imports
from ai_workspace.api.core.config import get_settings
from ai_workspace.api.core.logging import logger
from ai_workspace.api.service.gestalt_module import run_image, run_text


router = APIRouter(prefix="/gestal_module", tags=["code_generation"])
config: RunnableConfig = {"configurable": {"thread_id": "customer_123"}}


QUESTION_API = get_settings().QUESTION_API


class QuestionDataText(BaseModel):
    question: str


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


async def upload_question(question_files: Dict[str, str]):
    if not question_files:
        logger.warning("upload_question called with empty question_files dictionary.")
        return

    try:
        logger.info("Extracting question metadata...")
        question_meta = question_files.get("info.json")

        if not question_meta:
            logger.warning("info.json was not found in question_files.")
            raise ValueError("Missing info.json metadata.")

        # Convert dict of filename -> content into UploadFile objects
        logger.info("Converting raw question files into UploadFile objects...")
        upload_files = await asyncio.gather(
            *[
                convert_to_upload_file(filename, content)
                for filename, content in question_files.items()
            ]
        )

        # Prepare parallel reading of each UploadFile's bytes
        logger.info("Reading UploadFile content into memory for HTTPX upload...")
        file_data = await asyncio.gather(*(read_file(f) for f in upload_files))

        # Format files into HTTPX multipart format
        httpx_files = [
            (
                "files",
                (
                    filename,
                    bytes_data,
                    content_type or "application/octet-stream",
                ),
            )
            for filename, bytes_data, content_type in file_data
        ]

        logger.info(f"Prepared {len(httpx_files)} files for upload to question API.")

        # Build the additional form-data fields
        data = {
            "question_data": json.dumps(question_meta),
            "auto_handle_images": "true",
        }

    except Exception as e:
        logger.warning(f"Failed to parse and prepare question files: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse and prepare question files: {e}",
        )

    # Send request to Question API
    try:
        logger.info(
            f"Sending prepared question files to {QUESTION_API}/questions/files"
        )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{QUESTION_API}/questions/files",
                files=httpx_files,
                json=data,  
            )

        logger.info(f"Question API responded with status {response.status_code}.")
        return response.json()

    except Exception as e:
        logger.warning(f"Failed to send request to Question API: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send response to question API: {e}",
        )


@router.post("/")
async def generate_gestalt_module(question: QuestionDataText):
    """
    Generate a Gestalt module from a text-based question.

    This endpoint:
    - Receives a question in structured format (`QuestionDataText`)
    - Passes it to the text-based Gestalt generator (`run_text`)
    - Receives a dictionary of generated question files
    - Uploads the generated files to the Question API using `upload_question`

    Returns:
        The result of uploading the generated question files.

    Raises:
        HTTPException: If the generation or upload process fails.
    """
    try:
        question_files = await run_text(question.question, config)
        return await upload_question(question_files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to handle question {e}")


@router.post("/image")
async def generate_gestalt_module_image(image: UploadFile):
    """
    Generate one or more Gestalt modules from an uploaded image.

    This endpoint:
    - Saves the uploaded image to a temporary directory
    - Runs the image-based Gestalt extractor (`run_image`)
    - For each detected question, retrieves its generated file package
    - Uploads each package to the Question API
    - Uses asyncio.gather with `return_exceptions=True` to continue processing
      even if individual uploads fail

    Returns:
        A list of successful responses and/or captured exceptions.

    Raises:
        HTTPException: If processing the image or generating modules fails.
    """
    try:
        logger.info("Got an image attempting to generate")
        filename = image.filename or "untitled.png"
        with tempfile.TemporaryDirectory() as tmpdir:
            temp_path = Path(tmpdir) / filename
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            result = await run_image(temp_path, config=config)
            logger.info("Generated questions successfully.")

        tasks = []
        for r in result:
            question_files = r.get("files", {})
            tasks.append(upload_question(question_files))

        # Run all uploads with error continuation
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        for res in responses:
            if isinstance(res, Exception):
                logger.warning(f"Task failed: {res}")
            else:
                logger.info(f"Task succeeded: {res}")

        return responses

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to handle question {e}")
