from fastapi.routing import APIRouter
from pydantic import BaseModel
from pathlib import Path
from code_runner.javascript_runner import JavaScriptRunner
from fastapi.responses import JSONResponse
router = APIRouter(prefix="/code_runner", tags=["code_running"])


class CodeRun(BaseModel):
    language: str
    content: str


@router.post("/generate")
def execute_code(data: CodeRun):
    data = JavaScriptRunner(data.content).run()
    return JSONResponse(content=data)
