import subprocess
from fastapi.routing import APIRouter
from src.api.dependencies import SettingDependency
import httpx
from src.api.core import logger
router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.post("/")
async def execute(app_settings: SettingDependency):

    # Run the code using http
    if app_settings.MODE == "production":
        sandbox_url = app_settings.SANDBOX_URL
        if not sandbox_url:
            raise ValueError("Production Mode must set Sandbox URL for execution")
        async with httpx.AsyncClient() as client:
            res = await client.post(sandbox_url)
            logger.info("Got Sandbox response %s", res)
            try:
                data = res.json()
            except ValueError:
                data = res.text
            return {"data": f"{data}"}
    else:
        process = subprocess.Popen(
            ["docker", "run", "-i", "--rm", "sandbox"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        stdout, stderr = process.communicate()
        return {"data": f"STDOUT: {stdout} STDERR: {stderr}"}
