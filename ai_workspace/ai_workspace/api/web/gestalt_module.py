from ai_workspace.api.service.gestalt_module import run_text
from fastapi import APIRouter
from langchain_core.runnables.config import RunnableConfig
from typing import Dict
from pydantic import BaseModel

router = APIRouter(prefix="/gestal_module", tags=["code_generation"])
config: RunnableConfig = {"configurable": {"thread_id": "customer_123"}}


class Output(BaseModel):
    files: dict


@router.post("/")
async def generate_gestalt_module(question: str) -> Output:
    return Output(files=run_text(question, config))
