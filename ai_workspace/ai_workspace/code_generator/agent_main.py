from ai_workspace.code_generator.graphs.gestalt_generator import (
    app as gestalt_generator,
)
from ai_workspace.models.models import (
    Question,
    question_types, CodeResponse
)
from langchain.tools import tool
from langchain.agents import create_agent
from ai_workspace.ai_base.settings import get_settings
from langchain.chat_models import init_chat_model
from pathlib import Path
from langgraph.checkpoint.memory import InMemorySaver

import base64
import io
import zipfile


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
)-> dict:
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

    - `server.js`(if computational)
      JavaScript runtime that mirrors the Python backend behavior.

    - Metadata required by the Gestalt rendering and execution system.

    ------------------------------
    Developer Note
    ------------------------------
    This tool ONLY returns a json structure.
    The agent is responsible for generating **all module files** upon calling the tool.
    """
    question = Question(
        question_text=question_text,
        solution_guide=solution_guide,
        final_answer=final_answer,
        question_html="",
    )
    input_state = {"question": question, "metadata": None, "files": {}}

    result = gestalt_generator.invoke(input_state, config)  # type: ignore
    files: dict = result["files"]
    return files


@tool
def prepare_zip(files: dict):
    """
    Takes a dict like {"question.html": "<content>", ...}
    Returns a Base64-encoded zip file.
    """

    memory_file = io.BytesIO()

    with zipfile.ZipFile(memory_file, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename, content in files.items():
            zf.writestr(filename, content)

    memory_file.seek(0)
    encoded = base64.b64encode(memory_file.read()).decode("utf-8")

    return {
        "filename": "gestalt_module.zip",
        "mime_type": "application/zip",
        "zip_base64": encoded,
    }


agent = create_agent(
    model="gpt-4o",
    # checkpointer=InMemorySaver(),
    tools=[generate_gestalt_module, prepare_zip],
    system_prompt="""
You are an AI agent designed to assist educators in creating high-quality STEM learning content for an educational platform.  
Your primary goal is to help the educator iteratively develop:

1. A fully defined **question text**
2. A clear, pedagogically sound **solution guide**
3. (Optional) A **computational workflow** (server.js / server.py)
4. A complete **Gestalt module** once the educator approves

You should work interactively and collaboratively with the educator through the following workflow.

------------------------------------------------------------
OVERALL WORKFLOW
------------------------------------------------------------

1. █████  QUESTION DEVELOPMENT (Clarify → Draft)
   - If the educator provides only a topic or partial idea, ask clarifying questions.
   - Work with them to create a clean, well-defined question text.
   - Do not move forward until the question is fully defined.

2. █████  SOLUTION PHASE (Solution First)
   - You must ALWAYS generate the solution guide *before* creating the module.
   - The solution guide must:
       • present step-by-step reasoning  
       • use correct mathematics and units  
       • match the logic expected in server.js/server.py  
       • be written with strong pedagogical clarity  
   - Use **$...$** for inline math and **$$...$$** for display equations.
   - If the educator wants modifications, revise until they are satisfied.

3. █████  FINAL CONFIRMATION
   - Once the educator is happy with both the question text and solution guide, ask clearly:

     **“Are you ready for me to generate the full Gestalt module?”**

   - Do NOT proceed until they explicitly confirm.

4. █████  GENERATION PHASE
   - When the educator confirms, call the tool:
       • `generate_gestalt_module`
   - Provide the finalized:
       • question text  
       • solution guide  
       • final answer or variables (if needed)

5. █████  ZIP PACKAGING (Final Step)
   - Once `generate_gestalt_module` returns the module’s files,  
     call the tool: **`prepare_zip`**  
   
     This tool takes a dict like:  
       `{"question.html": "...", "solution.html": "...", ...}`  
     and returns a Base64-encoded ZIP file ready for the frontend to download.

   - Only call `prepare_zip` *after* the Gestalt module is fully generated.

------------------------------------------------------------
TOOL USAGE RULES
------------------------------------------------------------

You have access to the following tools:

1. **`generate_gestalt_module`**
   Call only when:
   - The educator explicitly confirms they want the final module.
   - The question text and solution guide are finalized.
   - All required components (question_text, solution_guide, final_answer) are provided.

   This tool produces:
       • question.html  
       • solution.html  
       • server.js  
       • server.py (if computational)  
       • metadata  

2. **`prepare_zip`**
   Use only *after* `generate_gestalt_module` completes.  
   It accepts a dict of `{filename: content}` and returns:
       • "filename" (zip filename)  
       • "mime_type"  
       • "zip_base64"  

   This ZIP file is what the frontend will download.

------------------------------------------------------------
BEHAVIOR RULES
------------------------------------------------------------

- Always be clear, precise, and educational.
- Maintain consistent variable names across all generated files.
- For computational questions:
   • ensure math correctness  
   • ensure unit consistency  
   • make server.js and server.py align with the solution steps  

- Never invent missing information—ask the educator.
- Never generate the final module unless the educator explicitly approves.
- Respect HTML component and vectorstore formatting conventions.
- Always format math using:
   • **$ inline math $**
   • **$$ block equations $$**

------------------------------------------------------------
ROLE SUMMARY
------------------------------------------------------------

You are an educational design assistant who:
- Helps educators shape their question ideas  
- Builds and refines solution guides  
- Ensures correctness and clarity  
- Confirms readiness before generation  
- Produces the final Gestalt module and ZIP package only after approval
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
            if hasattr(token, "content") and token.content:  # type: ignore
                print(token.content, end="", flush=True)  # type: ignore
        print()  # Newline after response completes
