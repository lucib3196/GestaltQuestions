from pydantic import BaseModel
from gestalt_code_generator.model.models import CodeArtifact
from .base_generator import InputState, State, graph as subgraph
from gestalt_code_generator.model import GeneratorContext


import json
import operator
from typing import Annotated, List
from gestalt_code_generator.utils import save_graph
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langgraph.graph import END, START, StateGraph
from langgraph.runtime import Runtime
from langgraph.types import Command
from pydantic import BaseModel

from gestalt_code_generator.model import (
    CodeArtifact,
    CodeResponse,
    ExampleColumn,
    Question,
    GeneratorContext,
)

PREDEFINED_PARAMETERS_PROMPT = """
You are modifying generated server code for a PrairieLearn-style question.

Goal:
Update the existing `generate` function so it supports both random and deterministic generation.

Required structure:
1. The `generate` function must accept one optional positional parameter.
2. The parameter must default to `0`.
3. A value of `0` means: preserve the original random generation behavior.
4. A value of `1` means: use deterministic predefined values extracted from the original question text.
5. Extract deterministic values from the original question text below, not from the randomized code.
6. Keep the existing return shape, output keys, helper functions, imports, and surrounding code unless a change is required for this feature.
7. Preserve all existing randomized behavior when the parameter is omitted or set to `0`.
8. Return only the complete updated code. Do not include explanation or markdown.

Expected signatures:
Python:
```py
def generate(predefined: int = 0):
```

JavaScript:
```js
function generate(predefined = 0) {
```

Python examples:
```py
def generate(predefined: int = 0):
    if predefined == 1:
        speed = 100
        time = 5
        distance = 500
    else:
        speed = random.randint(40, 120)
        time = random.randint(1, 8)
        distance = speed * time

    return {
        "params": {"speed": speed, "time": time},
        "correct_answers": {"distance": distance},
    }
```

```py
def generate(predefined: int = 0):
    if predefined == 1:
        a = 3
        b = 7
    else:
        a = random.randint(1, 9)
        b = random.randint(1, 9)

    return {
        "params": {"a": a, "b": b},
        "correct_answers": {"sum": a + b},
    }
```

JavaScript examples:
```js
function generate(predefined = 0) {
    let speed;
    let time;
    let distance;

    if (predefined === 1) {
        speed = 100;
        time = 5;
        distance = 500;
    } else {
        speed = Math.floor(Math.random() * 81) + 40;
        time = Math.floor(Math.random() * 8) + 1;
        distance = speed * time;
    }

    return {
        params: { speed, time },
        correct_answers: { distance },
    };
}
```

```js
function generate(predefined = 0) {
    let a;
    let b;

    if (predefined === 1) {
        a = 3;
        b = 7;
    } else {
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
    }

    return {
        params: { a, b },
        correct_answers: { sum: a + b },
    };
}
```

Original question:
__ORIGINAL_QUESTION__

Code to modify:
__CODE__
"""


def add_predefined_parameters(state: State, runtime: Runtime[GeneratorContext]):
    if state.code is None:
        raise ValueError("add_predefined_parameters requires state.code to be present.")
    original_question = state.question.text
    code = state.code.content
    prompt = PREDEFINED_PARAMETERS_PROMPT.replace(
        "__ORIGINAL_QUESTION__", original_question
    ).replace("__CODE__", code)
    model = init_chat_model(
        model=runtime.context.model, model_provider=runtime.context.model_provider
    ).with_structured_output(CodeResponse)
    response = model.invoke(prompt)
    code = CodeResponse.model_validate(response).code
    return {"code": CodeArtifact(filename=state.code.filename, content=code)}


builder = StateGraph(
    State,
    input_schema=InputState,
    context_schema=GeneratorContext,
)
builder.add_node("generate_base_code", subgraph)
builder.add_node("add_predefined_parameters", add_predefined_parameters)

builder.add_edge(START, "generate_base_code")
builder.add_edge("generate_base_code", "add_predefined_parameters")
builder.add_edge("add_predefined_parameters", END)


graph = builder.compile()


if __name__ == "__main__":
    from pathlib import Path

    from dotenv import load_dotenv
    from langchain_core.vectorstores import InMemoryVectorStore
    from langchain_google_genai import GoogleGenerativeAIEmbeddings

    from gestalt_code_generator.document_loader import QuestionDocumentLoader
    from gestalt_code_generator.utils import to_serializable

    load_dotenv()
    csv_path = Path(
        r"gestalt_code_generator/data/QuestionDataV2_06122025_classified.csv"
    ).resolve()
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vector_store = InMemoryVectorStore(embeddings)
    loader = QuestionDocumentLoader(
        input_col="question.html", output_col="server.js", csv_path=csv_path
    )
    docs = list(loader.lazy_load())
    vector_store.add_documents(docs)
    results = vector_store.as_retriever().invoke(
        "A car is traveling along a straight rode"
    )
    result = graph.invoke(
        State(
            question=Question(
                text="A car is traveling along a straight rode at a constant speed of 100mph for 5 hours what is the total distance covered"
            ),
            prompt="Generate a server.js file for the following",
            source_example_col="question.html",
            target_example_col="server.js",
            testing=True,
        ),
        context=GeneratorContext(
            model="gemini-2.5-flash",
            model_provider="google_genai",
            vectorstore=vector_store,
        ),
    )
    Path("./output").write_text(json.dumps(to_serializable(result), indent=2))
    
    save_graph(graph, "./server_generator.png")
