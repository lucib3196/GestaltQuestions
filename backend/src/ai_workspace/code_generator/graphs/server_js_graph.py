from typing import Annotated, List, Literal, TypedDict
import operator
from pathlib import Path
import json

# --- Project Imports ---
from src.ai_base.settings import get_settings
from src.ai_workspace.code_generator.models.models import (
    CodeResponse,
    Question,
    question_types,
)
from src.ai_workspace.code_generator.retrievers import (
    server_js_vectorstore,
)
from src.ai_workspace.code_validation.code_validation_graph import (
    graph as code_validation,
)
from src.ai_workspace.utils import extract_langsmith_prompt


# --- LangChain / LangGraph ---
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command
from langgraph.checkpoint.memory import MemorySaver
from src.utils import save_graph_visualization, to_serializable
from src.ai_workspace.code_validation.code_validation_graph import (
    graph as code_validation_graph,
    State as CodeValidationState,
)

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


class State(TypedDict):
    question: Question
    question_type: question_types
    server_js: str | None

    retrieved_documents: Annotated[List[Document], operator.add]
    formatted_examples: str


def retrieve_examples(state: State) -> Command[Literal["generate_code"]]:
    isAdaptive = False
    if state["question_type"] == "computational":
        isAdaptive = True
    retriever = server_js_vectorstore.as_retriever(
        search_type="similarity", kwargs={"isAdaptive": isAdaptive}, k=2
    )

    question_html = state["question"].question_html
    if not question_html:
        question_html = state["question"].question_text

    results = retriever.invoke(question_html)
    # Format docs
    formatted_docs = "\n".join(p.page_content for p in results)
    return Command(
        update={"formatted_examples": formatted_docs, "retrieved_documents": results},
        goto="generate_code",
    )


def generate_code(state: State):
    solution = state["question"].solution_guide
    examples = state["formatted_examples"]

    question_html = state["question"].question_html
    if not question_html:
        question_html = state["question"].question_text

    messages = prompt.format_prompt(
        question=question_html, examples=examples, solution=solution
    ).to_messages()

    structured_model = model.with_structured_output(CodeResponse)
    server = structured_model.invoke(messages)
    server = CodeResponse.model_validate(server)
    return {"server_js": server.code}


def solution_present(state: State) -> Literal["validate_solution", "improve_code"]:
    if state["question"].solution_guide:
        return "validate_solution"
    return "improve_code"


def validate_solution(state: State):
    solution_guide = state["question"].solution_guide

    input_state: CodeValidationState = {
        "prompt": (
            "You are tasked with analyzing the following Python server file. "
            "Verify that the generated code is valid, consistent, and follows "
            "the logic described in the provided solution guide.\n\n"
            f"Solution Guide:\n{solution_guide}"
        ),
        "generated_code": state["server_js"] or "",
        "validation_errors": [],
        "refinement_count": 0,
        "final_code": "",
    }

    # Run the code validation refinement graph
    result = code_validation_graph.invoke(input_state)  # type: ignore

    final_code = result["final_code"]

    return {"server_py": final_code}


def improve_code(state: State):
    input_state: CodeValidationState = {
        "prompt": (
            "You are tasked with reviewing and improving the following Python "
            "server file. Your goal is to ensure that the code is correct, "
            "numerically consistent, and integrates dynamic unit handling "
            "based on the problem statement.\n\n"
            "Carefully analyze the logic, verify alignment with the solution "
            "guide, and update the code to properly account for variable units, "
            "scaling factors, or engineering constants that may be required.\n\n"
            f"General Guidelines for Server File Guide:\n{extract_langsmith_prompt(base_prompt)}"
        ),
        "generated_code": state.get("server_js", "") or "",
        "validation_errors": [],
        "refinement_count": 0,
        "final_code": "",
    }

    # Execute the refinement / validation graph
    result = code_validation_graph.invoke(input_state)  # type: ignore

    final_code = result["final_code"]

    return {"server_js": final_code}


workflow = StateGraph(State)
# Define Nodes
workflow.add_node("retrieve_examples", retrieve_examples)
workflow.add_node("generate_code", generate_code)
workflow.add_node("validate_solution", validate_solution)
workflow.add_node("improve_code", improve_code)
# Connect
# Connect
workflow.add_edge(START, "retrieve_examples")
workflow.add_conditional_edges(
    "generate_code",
    solution_present,
    {"improve_code": "improve_code", "validate_solution": "validate_solution"},
)
workflow.add_edge("validate_solution", "improve_code")
workflow.add_edge("improve_code", END)
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
        "server_js": None,
        "retrieved_documents": [],
        "formatted_examples": "",
    }
    result = app.invoke(input_state, config=config)  # type: ignore
    print(result["server_js"])

    # Save output
    output_path = Path(r"src/ai_processing/code_generator/outputs/server_js")
    save_graph_visualization(app, output_path, filename="graph.png")
    data_path = output_path / "output.json"
    data_path.write_text(json.dumps(to_serializable(result)))
