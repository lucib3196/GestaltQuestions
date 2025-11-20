# --- LangChain & OpenAI ---
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import OpenAIEmbeddings
from langchain.chat_models import init_chat_model
# --- Pydantic ---

# --- Project Imports ---
from src.ai_base.settings import get_settings
from src.ai_processing.code_generator.utils import load_vectorstore
from src.ai_processing.code_generator.prompts import SERVER_JS_PROMPT

# Get settings
settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model
embeddings = OpenAIEmbeddings(model=settings.embedding_model)

QUESTION_STORE_PATH = r"src/ai_processing/code_generator/vectorstores/js_store"
server_js_vectorstore = load_vectorstore(
    QUESTION_STORE_PATH, name="server_js_store", embeddings=embeddings
)



model = init_chat_model(
    settings.base_model.model,
    model_provider=settings.base_model.provider,
)


@tool
def retrieve_server_js_context(question: str, computational: bool):
    """
    Retrieve high-quality JavaScript runtime examples from the Server JS vectorstore.

    This tool takes the *complete question.html file* as input and returns:
    - Parameter-generation logic patterns
    - Randomization and variable-seeding examples
    - Student answer validation patterns
    - Expected return structures for correct_answers and intermediate steps
    - Common JS conventions used in question runtime files

    Use this tool when:
    - You are generating a new server.js file.
    - You need reference examples for how JavaScript runtime files are structured.
    - You want consistent logic, naming, and computation patterns aligned with
      the question HTML file.

    The retrieved examples should guide the final server.js output, ensuring
    that the generated file is consistent, functional, and aligned with
    established patterns used across the system.
    """

    retrieved_docs = server_js_vectorstore.similarity_search(
        question, k=3, filter={"isAdaptive": computational}
    )
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs


@tool
def improve_server_js(code: str, solution: str | None = None):
    """
    Improve and refine a server.js implementation.

    Use this tool when:
    - You have an initial draft of a server.js file that needs restructuring or cleanup.
    - The code does not fully follow best practices or consistent logic patterns.
    - Dynamic parameter generation needs to be improved or standardized.
    - Variable names, computations, or validation steps appear inconsistent with 
      the associated question.
    - A solution (step-by-step explanation) is provided and the code needs to be 
      aligned with the mathematical reasoning or logic in the solution.
    - The JS logic must match the intended correct answer(s), rounding rules, 
      or intermediate computations.

    Do NOT use this tool when:
    - You are generating server.js completely from scratch (use the JS vectorstore retrieval instead).
    - The input is not JavaScript code.
    """

    prompt = f"""
    You are an AI assistant tasked with improving an existing `server.js` file.
    Your goal is to produce a clean, correct, and production-ready implementation.

    ===========================
    ### INPUTS PROVIDED TO YOU
    - **Code**: The existing server.js implementation that requires improvement.
    - **Solution (Optional)**: A step-by-step reasoning guide that describes the exact mathematical 
    process the question requires. If present, your code MUST align with this logical flow.

    ===========================
    ### YOUR OBJECTIVES

    1. **Improve Code Structure**
    - Rewrite the code to be clean, modular, and readable.
    - Ensure consistent variable naming and formatting.
    - Remove unused variables, dead code, or inconsistent logic.
    - Organize code into logical sections (parameter generation, computations, validation).

    2. **Ensure Dynamic Parameter Generation**
    - Use randomization or parameter-seeding patterns consistent with existing examples.
    - Make sure all parameters used in the question are dynamically generated.
    - Keep parameter ranges sensible and repeatable.

    3. **Match Logic to the Solution (If Provided)**
    - If a solution explanation is included, ensure the JS computations follow the same steps.
    - Ensure the final numerical results and intermediate values correspond exactly.
    - Match rounding rules, sigfigs, and computational details.

    4. **Correctness & Validation**
    - Ensure the returned object contains:
        - `params`
        - `correct_answers`
        - optional: `intermediate`, `test_results`
    - Validation logic should correctly evaluate student input.
    - Ensure deterministic and reproducible results across runs.

    5. **Follow System-Wide Coding Conventions**
    - Use patterns similar to examples retrieved from the JS vectorstore.
    - Prefer simple and explicit code over clever or ambiguous expressions.
    - Make the file directly executable by the educational environment.

    ===========================
    ### OUTPUT REQUIREMENTS

    - Output ONLY a complete, improved `server.js` file.
    - Do NOT include explanations, comments, or narrative unless they are part of code.
    - The output MUST be syntactically valid JavaScript.

    ===========================

    ### ORIGINAL CODE TO IMPROVE
    {code}

    ### SOLUTION GUIDE (IF PROVIDED)
    {solution}
    """

    return model.invoke(prompt)



tools = [retrieve_server_js_context]
agent = create_agent(model, tools=tools, system_prompt=SERVER_JS_PROMPT)

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
