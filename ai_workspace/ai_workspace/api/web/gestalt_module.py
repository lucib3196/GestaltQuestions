from ai_workspace.api.service.gestalt_module import run_text
from fastapi import APIRouter
from langchain_core.runnables.config import RunnableConfig
from typing import Dict
import httpx
from ai_workspace.api.core.config import get_settings
from fastapi import UploadFile
from io import BytesIO
import json
import asyncio
from fastapi import HTTPException

router = APIRouter(prefix="/gestal_module", tags=["code_generation"])
config: RunnableConfig = {"configurable": {"thread_id": "customer_123"}}

QUESTION_API = get_settings().QUESTION_API


async def convert_to_upload_file(filename: str, content: str | dict | bytes):
    # Handle conversion
    if isinstance(content, str):
        content = content.encode()
    elif isinstance(content, dict):
        content = json.dumps(content).encode()

    return UploadFile(filename=filename, file=BytesIO(content))


@router.post("/")
async def generate_gestalt_module(question: str) -> Dict[str, str]:
    try:
        question_files = run_text(question, config)
        question_meta = question_files["info.json"]
        # Prepare data
        tasks = []
        for filename, content in question_files.items():
            tasks.append(convert_to_upload_file(filename, content))
        files = await asyncio.gather(*tasks)
        data = {
            "question_data": json.dumps(question_meta),
            "auto_handle_images": "true",
        }
        async with httpx.AsyncClient() as client:
            response = await client.post("/questions/files", files=files, data=data)
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to handle question {e}")
