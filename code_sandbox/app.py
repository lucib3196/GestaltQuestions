from fastapi import FastAPI
from executor import main

app = FastAPI()


@app.post("/execute")
async def execute():
    return {"data": main()}
