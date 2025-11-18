import subprocess
from fastapi.routing import APIRouter
from src.api.dependencies import SettingDependency
import httpx
from src.api.core import logger

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.post("/")
async def execute(app_settings: SettingDependency):
    sandbox_url = app_settings.SANDBOX_URL
    if not sandbox_url:
        raise ValueError("SANDBOX_URL must set Sandbox URL for execution")

    try:
        async with httpx.AsyncClient() as client:
            logger.info("This is the sandbox_url %s", sandbox_url)
            res = await client.post(sandbox_url)
            logger.info("Got Sandbox response %s", res)
            try:
                data = res.json()
            except ValueError:
                data = res.text
            return {"data": f"{data}"}
    except Exception as e:
        raise ValueError(f"Could not make request {e}")
