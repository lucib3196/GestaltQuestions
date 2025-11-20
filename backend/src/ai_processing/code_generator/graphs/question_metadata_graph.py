from typing import Annotated, List, Literal, TypedDict
import operator
from pathlib import Path
import json

# --- Project Imports ---
from src.ai_base.settings import get_settings
from src.ai_processing.code_generator.models.models import (
    CodeResponse,
    Question,
    question_types,
)
from src.ai_processing.code_generator.retrievers import (
    server_js_vectorstore,
)

# --- LangChain / LangGraph ---
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command
from langgraph.checkpoint.memory import MemorySaver
from src.utils import save_graph_visualization, to_serializable

# --- External Services ---
from langsmith import Client


settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model
model = init_chat_model(
    settings.base_model.model,
    model_provider=settings.base_model.provider,
)

client = Client()
base_prompt = client.pull_prompt("server_js_graph_prompt")
if isinstance(base_prompt, str):
    prompt: ChatPromptTemplate = ChatPromptTemplate.from_template(base_prompt)
else:
    prompt: ChatPromptTemplate = base_prompt
