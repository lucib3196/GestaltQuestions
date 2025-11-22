from typing import Annotated, List, Literal, TypedDict
import operator
from pathlib import Path
import json
from ai_workspace.code_generator.models.models import question_types
from pydantic import BaseModel, Field

# --- Project Imports ---
from ai_base.settings import get_settings
from ai_workspace.code_generator.models.models import (
    CodeResponse,
    Question,
    question_types,
)
from ai_workspace.code_generator.retrievers import (
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
base_prompt = client.pull_prompt("base_metadata")
if isinstance(base_prompt, str):
    prompt: ChatPromptTemplate = ChatPromptTemplate.from_template(base_prompt)
else:
    prompt: ChatPromptTemplate = base_prompt


class QuestionMetaData(BaseModel):
    title: str = Field(..., description="A concise title summarizing the question")
    question_type: question_types
    topics: List[str] = Field(default=[])


class State(TypedDict):
    question: Question
    metadata: QuestionMetaData | None


def generate_question_metadata(state: State):
    question_text = state["question"].question_text
    structured_model = model.with_structured_output(QuestionMetaData)
    messages = prompt.format_prompt(question=question_text).to_messages()
    result = structured_model.invoke(messages)
    result = QuestionMetaData.model_validate(result)
    return {"metadata": result}


workflow = StateGraph(State)
# Define Nodes
workflow.add_node("generate_question_metadata", generate_question_metadata)
# Connect
workflow.add_edge(START, "generate_question_metadata")
workflow.add_edge("generate_question_metadata", END)

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)
if __name__ == "__main__":
    config = {"configurable": {"thread_id": "customer_123"}}
    question = Question(
        question_text="A car is traveling along a straight rode at a constant speed of 100mph for 5 hours calculate the total distance traveled",
        solution_guide=None,
        final_answer=None,
        question_html="",
    )
    input_state: State = {"question": question, "metadata": None}
    result = app.invoke(input_state, config=config)  # type: ignore
    print(result["metadata"])

    # Save output
    output_path = Path(r"src/ai_processing/code_generator/outputs/question_metadata")
    save_graph_visualization(app, output_path, filename="graph.png")
    data_path = output_path / "output.json"
    data_path.write_text(json.dumps(to_serializable(result)))
