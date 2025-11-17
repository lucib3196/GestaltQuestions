from fastapi import FastAPI
from code_sandbox.api.executor import main

app = FastAPI()


@app.post("/execute")
async def execute():
    return {"data": main()}
