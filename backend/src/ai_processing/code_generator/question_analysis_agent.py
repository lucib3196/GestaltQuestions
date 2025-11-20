from typing import TypedDict, Literal, Annotated
import operator
from pydantic import BaseModel

# --- LangChain & OpenAI ---
from langchain.chat_models import init_chat_model
from src.ai_base.settings import get_settings
from langchain.messages import AnyMessage
from langgraph.types import Command
from langgraph.checkpoint.memory import MemorySaver
from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command

# Get settings
settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model

model = init_chat_model(
    settings.base_model.model,
    model_provider=base_model.provider,
)


class QuestionClassification(BaseModel):
    question_type: Literal["static", "computational"]
    question_stub: str


class RequestType(BaseModel):
    request_type: Literal["specific_files", "full_module", "not_sure"]


class QuestionBuildeState(TypedDict):
    request: str
    request_type: RequestType | None
    classification: QuestionClassification | None
    messages: Annotated[list[AnyMessage], operator.add]


def process_request(
    state: QuestionBuildeState,
) -> Command[Literal["full_module", "specific_file", "gather_more_info"]]:
    structured_llm = model.with_structured_output(RequestType)
    request_prompt = f"""
    You are a chatbot tasked with helping educators create educational content
    You can either make a full module which will be a complete package or
    you can create a specific file

    Provide classification
    Request: {state["request"]}
    
    Request type: 
    full_module: If they want to generate an entire module already packaged
    speficic file: If they want to generate a spefic file or files
    gather more info: If they have an ambiguous request
    """
    request = structured_llm.invoke(request_prompt)
    print(request)
    request = RequestType.model_validate(request)

    if request.request_type == "full_module":
        goto = "full_module"
    elif request.request_type == "specific_files":
        goto = "specific_file"
    else:
        goto = "gather_more_info"
    return Command(update={"request_type": request}, goto=goto)


def full_module(state: QuestionBuildeState):
    print("Generating Full Module")


def specific_file(state: QuestionBuildeState):
    print("Generating Single File")


def gather_more_info(state: QuestionBuildeState):
    print("Gather more info")


# Create the graph
workflow = StateGraph(QuestionBuildeState)

# Add nodes with appropriate error handling
workflow.add_node("process_request", process_request)
workflow.add_node("full_module", full_module)
workflow.add_node("specific_file", specific_file)
workflow.add_node("gather_more_info", gather_more_info)


# Add only the essential edges
workflow.add_edge(START, "process_request")
workflow.add_edge("process_request", END)


# Compile with checkpointer for persistence, in case run graph with Local_Server --> Please compile without checkpointer
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)
config = {"configurable": {"thread_id": "customer_123"}}
initial_state: QuestionBuildeState = {
    "classification": None,
    "request": "I want to generate a question.html file",
    "messages": [],
    "request_type": None,
}
result = app.invoke(initial_state, config=config) # type: ignore
