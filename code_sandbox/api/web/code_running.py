from fastapi.routing import APIRouter
from code_runner import PythonScriptRunner, JavaScriptRunner
from code_runner.models import ExecutionRequest, ExecutionResult
from fastapi import HTTPException
from starlette import status

router = APIRouter(prefix="/code_runner", tags=["code_running"])

ALLOWED_LANGUAGES = ["javascript", "python"]


@router.post("/generate")
def execute_code(data: ExecutionRequest) -> ExecutionResult:
    language = data.language
    if language not in ALLOWED_LANGUAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Language {data.language} is not supported for sandbox environment",
        )
    try:

        if language == "python":
            runner = PythonScriptRunner()
            return runner.run(data.code)
        elif language == "javascript":
            runner = JavaScriptRunner()
            return runner.run(data.code)
        else:
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occured when running the scripts, for some reason an unsupported language passed through",
            )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={f"Could not execute code {e}"},
        )
