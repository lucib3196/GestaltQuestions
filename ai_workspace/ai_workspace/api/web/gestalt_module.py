from ai_workspace.api.service.gestalt_module import run_text
from fastapi import APIRouter
from langchain_core.runnables.config import RunnableConfig
from typing import Dict
from pydantic import BaseModel

router = APIRouter(prefix="/gestalt_module", tags=["code_generation"])
config: RunnableConfig = {"configurable": {"thread_id": "customer_123"}}


class Output(BaseModel):
    files: dict


class GestaltRequest(BaseModel):
    question: str


@router.post("/")
async def generate_gestalt_module(payload: GestaltRequest) -> Output:
    print("This is the questions", payload.question)
    try:
        result = run_text(payload.question, config)
    except Exception as e:
        raise ValueError(f"Could not execute {e}")
    return Output(files=result)
