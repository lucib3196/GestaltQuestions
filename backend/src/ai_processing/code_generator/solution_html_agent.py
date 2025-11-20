# --- LangChain & OpenAI ---
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import OpenAIEmbeddings
from langchain.chat_models import init_chat_model

# --- Pydantic ---

# --- Project Imports ---
from src.ai_base.settings import get_settings
from src.ai_processing.code_generator.utils import load_vectorstore
from src.ai_processing.code_generator.prompts import SOLUTION_HTML_PROMPT

# Get settings
settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model
embeddings = OpenAIEmbeddings(model=settings.embedding_model)

QUESTION_STORE_PATH = r"src/ai_processing/code_generator/vectorstores/solution_store"
solution_vectorstore = load_vectorstore(
    QUESTION_STORE_PATH, name="server_js_store", embeddings=embeddings
)


model = init_chat_model(
    settings.base_model.model,
    model_provider=settings.base_model.provider,
)


@tool
def retrieve_solution_context(query: str, computational: bool):
    """
    Retrieve high-quality solution HTML examples from the Solution vectorstore.

    This tool takes the *complete question.html file* as input and returns:
    - Step-by-step explanation structures
    - Mathematical derivation formatting
    - Common solution layouts and markup conventions
    - Examples of intermediate reasoning, diagrams, and narrative flow
    - Styles for presenting final answers, units, and clarity

    Use this tool when:
    - You are generating a new solution.html file.
    - You need reference examples for how full worked solutions are structured.
    - You want to match the pedagogical tone, layout, and formatting standards
    used in existing solutions.

    The retrieved examples should guide the final solution.html output, ensuring
    that it is clear, educational, well-formatted, and aligned with system-wide
    solution conventions.
    """

    retrieved_docs = solution_vectorstore.similarity_search(
        query, k=3, filter={"isAdaptive": computational}
    )
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs


tools = [retrieve_solution_context]
agent = create_agent(model, tools=tools, system_prompt=SOLUTION_HTML_PROMPT)

if __name__ == "__main__":
    print("Interactive Agent Chat\nType 'exit' to quit.\n")

    while True:
        user_input = input("You: ")

        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break

        # Stream the agent's response
        for event in agent.stream(
            {"messages": [{"role": "user", "content": user_input}]},
            stream_mode="values",
        ):
            event["messages"][-1].pretty_print()
