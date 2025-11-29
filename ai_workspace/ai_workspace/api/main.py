import os
from fastapi import FastAPI
import uvicorn
from .web import routes


def get_app():
    app = FastAPI()
    for r in routes:
        app.include_router(r)
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
