import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .core.config import get_settings
from .web import routes

settings = get_settings()


def get_app():
    app = FastAPI()
    for r in routes:
        app.include_router(r)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin) for origin in settings.BACKEND_CORS_ORIGINS
        ],  # allow specific frontend origins
        allow_credentials=True,  # allow cookies, Authorization headers
        allow_methods=["*"],  # allow all HTTP methods (GET, POST, etc.)
        allow_headers=["*"],  # allow all headers (including Authorization)
        expose_headers=["Content-Disposition"],
    )
    return app


app = get_app()


def main():
    uvicorn.run(
        "ai_workspace.api.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8001)),
        reload=True,
    )


if __name__ == "__main__":
    main()
