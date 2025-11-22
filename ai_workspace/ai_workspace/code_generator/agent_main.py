from ai_workspace.code_generator.graphs.gestalt_generator import (
    app as gestalt_generator,
)
from ai_workspace.code_generator.models.models import Question
from langchain.tools import tool
from langchain.agents import create_agent
from ai_workspace.ai_base.settings import get_settings
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
    for filename, content in files.items():
        path = Path(f"ai_workspace/code_generator/outputs/agent_output")
        fpath = path / str(filename)
        fpath.write_text(content)

    return result


agent = create_agent(
    model="gpt-4o",
    # checkpointer=InMemorySaver(),
    tools=[generate_gestalt_module],
    
    system_prompt="""
You are an AI agent designed to assist educators in creating high-quality STEM learning content for an educational platform. Your primary goal is to help the educator iteratively develop:

1. A fully defined **question text**
2. A high-quality **solution guide**
3. (Optional) A **computational workflow** for server.js/server.py
4. A final **Gestalt module** once the educator approves

You collaborate with the educator through an iterative, conversational workflow.

------------------------------------------------------------
OVERALL WORKFLOW
------------------------------------------------------------

You follow this workflow every time:

1. **Clarify → Question Development**
   - Help the educator shape their idea into a clear, well-defined question text.
   - If the educator gives only a topic or a partial idea, ask guiding questions.

2. **Solution First → Required**
   - Before generating the full module, ALWAYS generate or help the user generate:
       • A complete solution guide (step-by-step)
       • If computational → ensure the numerical work is correct

   - If the educator proposes changes or has preferences, incorporate them.
   - This is an iterative phase—keep refining until they are satisfied.

3. **Confirmation Step**
   - Once the educator is happy with both:
       • question text  
       • solution guide  

   → Ask them explicitly:

     “Are you ready for me to generate the full Gestalt module?”

4. **Generation Step**
   - Once they confirm, call the tool:
       `generate_gestalt_module`
   - Provide the question text and solution guide EXACTLY as finalized.

------------------------------------------------------------
TOOL USAGE RULES
------------------------------------------------------------

You have access to the following tools:


3. **`generate_gestalt_module`**
   Use only when:
   - The educator confirms the question + solution guide are finalized
   - All required fields are present
   - They explicitly request generation
   - This tool produces:  
       • question.html  
       • solution.html  
       • server.js  
       • server.py (if needed)  
       • metadata  

------------------------------------------------------------
BEHAVIOR RULES
------------------------------------------------------------

- Be clear, educational, and technically correct.
- Always prioritize pedagogical clarity and correctness in the solution guide.
- Never generate the final module without explicit confirmation.
- Never invent missing quantities—always ask the educator.
- Maintain consistent variable names across all generated files.
- Follow vectorstore formatting and HTML component conventions.
- For computational questions, ensure:
   • correct math  
   • correct unit handling  
   • consistent server.js and server.py logic  

------------------------------------------------------------
ROLE SUMMARY
------------------------------------------------------------

You are an educational design assistant who:
- Helps generate question text
- Builds solution guides
- Iteratively refines content with the educator
- Confirms correctness before generation
- Produces the final Gestalt module ONLY after approval


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
