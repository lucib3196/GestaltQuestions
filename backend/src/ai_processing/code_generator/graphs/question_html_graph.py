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
    question_html_vectorstore,
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
base_prompt = client.pull_prompt("question_html_graph_prompt")
if isinstance(base_prompt, str):
    prompt: ChatPromptTemplate = ChatPromptTemplate.from_template(base_prompt)
else:
    prompt: ChatPromptTemplate = base_prompt


class State(TypedDict):
    question: Question
    question_type: question_types
    question_html: str | None

    retrieved_documents: Annotated[List[Document], operator.add]
    formatted_examples: str


def retrieve_examples(state: State) -> Command[Literal["generate_code"]]:
    isAdaptive = False
    if state["question_type"] == "computational":
        isAdaptive = True
    retriever = question_html_vectorstore.as_retriever(
        search_type="similarity", kwargs={"isAdaptive": isAdaptive}, k=2
    )
    question_text = state["question"].question_text
    # If the question html is none default to the other case

    results = retriever.invoke(question_text)
    # Format docs
    formatted_docs = "\n".join(p.page_content for p in results)
    return Command(
        update={"formatted_examples": formatted_docs, "retrieved_documents": results},
        goto="generate_code",
    )


def generate_code(state: State):
    question_text = state["question"].question_text
    examples = state["formatted_examples"]
    messages = prompt.format_prompt(
        question=question_text, examples=examples
    ).to_messages()

    structured_model = model.with_structured_output(CodeResponse)
    question_html = structured_model.invoke(messages)
    question_html = CodeResponse.model_validate(question_html)
    return {"question_html": question_html.code}


workflow = StateGraph(State)
# Define Nodes
workflow.add_node("retrieve_examples", retrieve_examples)
workflow.add_node("generate_code", generate_code)
# Connect
workflow.add_edge(START, "retrieve_examples")
workflow.add_edge("retrieve_examples", END)

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
    input_state: State = {
        "question": question,
        "question_type": "computational",
        "question_html": None,
        "retrieved_documents": [],
        "formatted_examples": "",
    }
    result = app.invoke(input_state, config=config)  # type: ignore
    print(result["question_html"])

    # Save output
    output_path = Path(r"src/ai_processing/code_generator/outputs")
    save_graph_visualization(app, output_path, filename="question_html_graph.png")
    data_path = output_path / "output.json"
    data_path.write_text(json.dumps(to_serializable(result)))
