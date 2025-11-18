from pydantic import BaseModel


class ExecutionResult(BaseModel):
    output: str | dict  # final returned value
    logs: str | dict = ""  # print statements / console output


class ExecutionRequest(BaseModel):
    language: str  # python, js, cpp, etc.
    code: str  # the actual code to run
