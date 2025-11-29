from langchain.tools import tool
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from io import BytesIO
from pydantic import BaseModel
import base64

app = FastAPI()


@tool
def prepare_file(content: str, filename: str = "output.txt"):
    """A tool meant to return the filename and base64 encoded content to serve to the user"""
    encoded = base64.b64encode(content.encode()).decode()
    return {"filename": filename, "base64": encoded}


@tool
def generate_report(topic: str) -> str:
    """Generate a report and return its content.

    Args:
        topic: The topic to report on
    """
    report = f"""
    Report: {topic}
    ===============================
    
    Executive Summary:
    This report covers {topic} in detail.
    
    Key Points:
    1. Point one about {topic}
    2. Point two about {topic}
    3. Point three about {topic}
    
    Conclusion:
    {topic} is important.
    """
    return report


class FileOutput(BaseModel):
    content: str
    filename: str


tools = [generate_report, prepare_file]
agent = create_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=tools,
    system_prompt="You are a helpful assistant. When asked to generate reports or exports, use the appropriate tool and confirm what you've created. Then you can save the file if the user asks",
)
