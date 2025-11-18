from fastapi.routing import APIRouter
from code_runner.javascript_runner import JavaScriptRunner
from code_runner.models import ExecutionRequest, ExecutionResult

router = APIRouter(prefix="/code_runner", tags=["code_running"])


@router.post("/generate")
def execute_code(data: ExecutionRequest) -> ExecutionResult:
    result = JavaScriptRunner(data.code).run()
    return result
