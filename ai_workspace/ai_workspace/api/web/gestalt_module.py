from ai_workspace.api.service.gestalt_module import run_text
from fastapi import APIRouter
from langchain_core.runnables.config import RunnableConfig
from typing import Dict

router = APIRouter(prefix="/gestal_module", tags=["code_generation"])
config: RunnableConfig = {"configurable": {"thread_id": "customer_123"}}


@router.post("/")
def generate_gestalt_module(question: str) -> Dict[str, str]:
    return run_text(question, config)
