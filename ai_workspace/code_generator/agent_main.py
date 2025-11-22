from src.ai_processing.code_generator.graphs.gestalt_generator import (
    app as gestalt_generator,
)
from src.ai_processing.code_generator.models.models import Question
from langchain.tools import tool, ToolRuntime
from langchain.agents import create_agent
from pydantic import BaseModel
from src.ai_base.settings import get_settings
from langchain.chat_models import init_chat_model
from pathlib import Path
from langgraph.checkpoint.memory import InMemorySaver


settings = get_settings()
embedding_model = settings.embedding_model
base_model = settings.base_model

model = init_chat_model(
    settings.base_model.model,
    model_provider=settings.base_model.provider,
)
config = {"configurable": {"thread_id": "1"}}


@tool
def generate_gestalt_module(
    question_text: str,
    solution_guide: str | None,
    final_answer: str | None,
):
    """
    Generate a complete Gestalt module package.

    This tool should be invoked whenever a user wants to create a **full Gestalt module**.
    A Gestalt module is a fully self-contained set of educational assets representing a
    polished textbook-style STEM problem.

    ------------------------------
    Required Inputs
    ------------------------------

    question_text : str
        A *fully formatted*, high-quality problem statement—written exactly as it would
        appear in a textbook, exam, or structured engineering module.
        This must include:
        - Descriptive problem narration
        - Clean mathematical formatting (inline/block LaTeX using `$` or `$$`)
        - All variables and units required for computation
        - No missing context

    solution_text : str | None
        If the problem is computational, this is the **complete step-by-step solution guide**
        showing the reasoning, formulas, substitutions, and intermediate results.
        This is used to generate `solution.html`.
        If the problem is conceptual or multiple-choice, this may be `None`.

    question_solution : str | None
        The final numeric or conceptual answer to the question.
        This is used to populate the correctness backend and cannot be omitted if the question
        requires grading.
        For conceptual questions, this may be a short written answer.

    ------------------------------
    What This Tool Generates
    ------------------------------

    Calling this tool will automatically construct a **full Gestalt module package**, including:

    - `question.html`
      Generated from `question_text`, properly structured with PL components.

    - `solution.html`
      Derived from `solution_text`, with vectorstore-aligned formatting and pedagogy.

    - `server.py` (if computational)
      Automatically generated Python backend implementing deterministic parameter
      generation and evaluation logic.

    - `server.js`
      JavaScript runtime that mirrors the Python backend behavior.

    - Metadata required by the Gestalt rendering and execution system.

    ------------------------------
    Developer Note
    ------------------------------
    This tool ONLY returns a simple string.
    The agent is responsible for generating **all module files** upon calling the tool.
    """
    question = Question(
        question_text=question_text,
        solution_text=solution_guide,
        question_solution=final_answer,
    )
    input_state = {"question": question, "metadata": None, "files": {}}
    
    result = gestalt_generator.invoke(input_state, config)  # type: ignore
    files:dict = result["files"]
    for filename,content in files.items():
        path = Path(f"src/ai_processing/code_generator/outputs/agent_output")
        fpath = path/str(filename)
        fpath.write_text(content)
    
    return result


@tool
def brainstorm_ideas(request: str):
    """
    Brainstorm question ideas with the user.

    Use this tool when the user is unsure, vague, or ambiguous about what kind
    of question they want to generate. This tool helps them explore topics,
    refine scope, and decide on the exact problem they want.

    Args:
        request: The topic, subject area, or vague description provided by the user.

    Returns:
        A list of brainstormed question ideas or directions.
    """
    response = model.invoke(
        f"Brainstorm 1-3 possible high-quality STEM questions or approaches based on: {request}"
    ).content
    return response


@tool
def ask_the_user(request: str):
    """
    Confirm final question content before module generation.

    This tool should be called AFTER the user has a concrete idea AND BEFORE
    calling `generate_gestalt_module`. It ensures the user has provided all required
    components of a Gestalt module:

    Required:
        - question_text: the complete, fully formatted problem statement
        - solution_guide: step-by-step explanation (if computational)
        - final_answer: the final numeric or conceptual answer

    The tool asks the user to confirm that these components are correct, complete,
    and ready to generate the module.

    Args:
        request: A formatted summary of what the agent believes the question,
                 solution guide, and final answer currently are.

    Returns:
        A confirmation prompt for the user to validate, correct, or update the content.
    """
    response = model.invoke(
        f"Before generating the module, confirm the following question information with the user:\n\n{request}"
    ).content
    return response


agent = create_agent(
    model="gpt-4o",
    checkpointer=InMemorySaver(),
    tools=[generate_gestalt_module, brainstorm_ideas, ask_the_user],
    system_prompt="""
You are an AI assistant responsible for generating complete, production-ready Gestalt modules.

A Gestalt module contains:
- question.html
- solution.html
- server.js
- server.py (if computational)
- metadata for rendering and execution

Your job is to ensure high-quality, textbook-level content with correct math and consistent logic across all files.

------------------------------------------------------------
TOOL USAGE RULES
------------------------------------------------------------

1. Use `brainstorm_ideas` when:
   - The user is unclear, vague, or exploring options.
   - The user says “I need a question about X” or “help me come up with something.”

2. Use `ask_the_user` when:
   - The user has provided a concrete question idea.
   - BUT we must confirm that we have all required module inputs:
        • question_text (the full formatted question)
        • solution_guide (if computational)
        • final_answer
   - This is the last step before generating the module.

   You MUST confirm correctness before generating.

3. Use `generate_gestalt_module` when:
   - All required inputs are confirmed.
   - The user explicitly wants the final formatted module created.

   You MUST call this tool when the user wants the completed module package.

------------------------------------------------------------
BEHAVIOR RULES
------------------------------------------------------------

- Be precise, concise, and technically accurate.
- Never generate a full module until the user confirms all components.
- Never invent missing information—ask instead.
- Maintain identical variable names across question, solution, server.js, and server.py.
- Follow vectorstore formatting conventions for all generated files.
- Ensure mathematical correctness and pedagogical clarity.

""",
)


if __name__ == "__main__":
    print("Interactive Agent Chat\nType 'exit' to quit.\n")

    while True:
        user_input = input("You: ")

        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break

        # Stream LLM tokens as they arrive
        print("Agent: ", end="", flush=True)
        for token, metadata in agent.stream(
            {"messages": [{"role": "user", "content": user_input}]},
            stream_mode="messages",  # Stream tokens instead of full messages
            config=config,  # type: ignore
        ):
            # token is the content chunk from the LLM
            # Print token content without newlines for continuous output
            if hasattr(token, "content") and token.content:
                print(token.content, end="", flush=True)
        print()  # Newline after response completes
