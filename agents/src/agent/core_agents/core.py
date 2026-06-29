"""Dynamic agent configured with runtime model routing."""

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.agents.middleware import HumanInTheLoopMiddleware, InterruptOnConfig
from langchain.tools import tool
from src.agent.core.context import (
    GeminiModel,
    ModelProvider,
    ConfigSchema,
    ModelRoutingMiddleware,
)


@tool
def write_to_database(query: str):
    """A simple tool to write in the database"""
    return f"Wrote to database {query}"


model = init_chat_model(
    model_provider=ModelProvider.GEMINI.value,
    model=GeminiModel.GEMINI_2_5_FLASH.value,
)
agent = create_agent(
    model=model,
    system_prompt="You are a helpful assistant",
    middleware=[
        ModelRoutingMiddleware(),  # type: ignore
        HumanInTheLoopMiddleware(
            interrupt_on={
                "write_to_database": {
                    "allowed_decisions": ["approve", "reject", "edit"]
                },  # No editing allowed
            },
            description_prefix="Tool execution pending approval",
        ),
    ],  # type: ignore
    context_schema=ConfigSchema,
    tools=[write_to_database],
)  # type: ignore
