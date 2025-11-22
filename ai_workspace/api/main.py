import os
from fastapi import FastAPI
import uvicorn


def get_app():
    app = FastAPI()
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
