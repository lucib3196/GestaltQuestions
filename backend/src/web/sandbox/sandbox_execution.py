import httpx
from fastapi import HTTPException
from fastapi.routing import APIRouter
from starlette import status

from src.core.logging import logger
from src.service.runtime_preparer.models import Language
from src.service.runtime_preparer.runtime_preparer import RuntimePreparer
from src.web.dependencies import SettingDependency, StorageDependency

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.post("/")
async def execute(
    app_settings: SettingDependency, storage: StorageDependency, language: Language
):
    """Example development endpoint for packaging files and calling the sandbox."""
    sandbox_url = app_settings.SANDBOX_URL
    if not sandbox_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sandbox URL is not configured.",
        )

    try:
        file_paths = storage.list("/questions")
        if not file_paths:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No files were found under '/questions'.",
            )

        files = {}

        for path in file_paths:
            filename = path.split("/")[-1]
            content = storage.read(path)

            if content is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Storage returned no data for file '{path}'.",
                )

            try:
                files[filename] = content.decode("utf-8")
            except UnicodeDecodeError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File '{path}' could not be decoded as UTF-8.",
                ) from e

        logger.info(
            "Preparing runtime for sandbox execution. language=%s file_count=%s",
            language,
            len(files),
        )
        runtime = RuntimePreparer().prepare_runtime(files, language=language)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to prepare runtime for sandbox execution.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to prepare runtime: {e}",
        ) from e

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            execution_endpoint = f"{sandbox_url}/code_runner/generate"
            payload = runtime.model_dump(mode="json")
            logger.info("[SANDBOX] Sending runtime payload to %s", execution_endpoint)
            logger.debug("[SANDBOX] Payload: %s", payload)

            res = await client.post(execution_endpoint, json=payload)

            if res.is_error:
                logger.error(
                    "[SANDBOX] Sandbox returned %s: %s", res.status_code, res.text
                )
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=(
                        f"Sandbox request failed with status {res.status_code}: "
                        f"{res.text}"
                    ),
                )
    except HTTPException:
        raise
    except httpx.TimeoutException as e:
        logger.exception("Sandbox request timed out.")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Sandbox request timed out.",
        ) from e
    except httpx.RequestError as e:
        logger.exception("Failed to connect to sandbox service.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to sandbox service: {e}",
        ) from e
    except Exception as e:
        logger.exception("Unexpected sandbox execution failure.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected sandbox execution failure: {e}",
        ) from e

    try:
        data = res.json()
    except ValueError as e:
        logger.exception("Sandbox returned a non-JSON response.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Sandbox returned an invalid JSON response.",
        ) from e

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Sandbox returned no response data.",
        )

    logger.info("Sandbox execution completed successfully.")
    return data
