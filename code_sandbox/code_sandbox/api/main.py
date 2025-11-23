import os
from fastapi import FastAPI
import uvicorn
from src.code_sandbox.api.web.code_running import router


def get_app():
    app = FastAPI()
    app.include_router(router)
    return app


app = get_app()


def main():
    uvicorn.run(
        "api.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8080)),
        reload=True,
    )


if __name__ == "__main__":
    main()
