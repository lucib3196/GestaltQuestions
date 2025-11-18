from fastapi import FastAPI
import os
import uvicorn
from api.web.code_running import router

app = FastAPI()
app.include_router(router)


def main():
    uvicorn.run(
        "api.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8080)),
        reload=True,
    )


if __name__ == "__main__":
    main()
