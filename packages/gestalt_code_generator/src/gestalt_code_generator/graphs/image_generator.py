import base64

from langchain.chat_models import init_chat_model
from langchain.messages import AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph
from langgraph.runtime import Runtime
from pydantic import BaseModel, Field

from gestalt_code_generator.model import (
    ContextSchema,
    GeneralResponse,
    Question,
    QuestionImageAnalysis,
)


def get_image_base64(response: AIMessage) -> None:
    image_block = next(
        block
        for block in response.content
        if isinstance(block, dict) and block.get("image_url")
    )
    return image_block["image_url"].get("url").split(",")[-1]


IMAGE_ANALYSIS_PROMPT = """
You are analyzing a textbook-style question to decide whether it needs a generated image.

Return whether an image would materially help the learner understand or answer the question.
Prefer generating an image for questions involving diagrams, geometry, graphs, spatial layouts,
visual comparisons, physical systems, annotated scenes, or other concepts that are difficult to
communicate with text alone. Do not generate an image for straightforward symbolic, arithmetic,
definition, or short-answer questions where text is sufficient.

Question:
{question}
""".strip()
PHYSICS_TEXTBOOK_IMAGE_PROMPT_GENERATOR = """
You are generating a refined image-generation prompt for a physics textbook diagram.

Given the physics question below, write a clear, reusable prompt that can be passed to an image-generation model. The refined prompt should describe the diagram the model should create, not solve the problem.

Requirements for the refined prompt:
- Make the image textbook-style: clean line art, simple arrows, labels, and minimal shading.
- Keep it general enough for dynamically generated questions.
- Do not invent or hardcode numeric values unless they are explicitly present in the question.
- Prefer symbolic labels such as m, v, a, F, T, N, W, theta, d, h, or t when appropriate.
- Describe the physical setup, relevant objects, surfaces, directions of motion, angles, distances, and forces.
- Include only labels that help explain the setup.
- Avoid decorative, photorealistic, cinematic, or cluttered styling.
- Do not include equations, final answers, or solution steps unless the question explicitly asks for them.
- Use a white or transparent background.
- Make the output prompt concise but specific enough to generate a useful textbook diagram.

Physics question:
{question}

Return only the refined image-generation prompt.
""".strip()


class ImageGeneratorInput(BaseModel):
    question: Question


class ImageGeneratorState(ImageGeneratorInput):
    analysis: QuestionImageAnalysis | None = Field(
        default=None,
        exclude=True,
        description="Internal graph state. Not intended as user input.",
    )
    image_prompt: str | None = None
    image: str | None = None


def analyze(state: ImageGeneratorState, runtime: Runtime[ContextSchema]):
    source_question = state.question.text
    model = init_chat_model(
        model=runtime.context.model, model_provider=runtime.context.model_provider
    ).with_structured_output(QuestionImageAnalysis)
    response = model.invoke(IMAGE_ANALYSIS_PROMPT.format(question=source_question))
    response = QuestionImageAnalysis.model_validate(response)
    return {"analysis": response}


def routing_function(state: ImageGeneratorState):
    if not state.analysis:
        print("Error in graph construction")
        return "stop"
    if state.analysis.requires_image:
        return "generate_prompt"
    return "stop"


def generate_prompt(state: ImageGeneratorState, runtime: Runtime[ContextSchema]):
    source_question = state.question.text
    model = init_chat_model(
        model=runtime.context.model, model_provider=runtime.context.model_provider
    ).with_structured_output(GeneralResponse)
    response = model.invoke(
        PHYSICS_TEXTBOOK_IMAGE_PROMPT_GENERATOR.format(question=source_question)
    )
    response = GeneralResponse.model_validate(response)
    return {"image_prompt": response.response}


def generate_image(state: ImageGeneratorState):
    source_question = state.question.text
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-image")
    prompt = (
        PHYSICS_TEXTBOOK_IMAGE_PROMPT_GENERATOR.format(question=source_question)
        + state.image_prompt
    )
    response = model.invoke(prompt)
    image_base64 = get_image_base64(response)
    return {"image": image_base64}


builder = StateGraph(
    ImageGeneratorState,
    input_schema=ImageGeneratorInput,
    output_schema=ImageGeneratorState,
    context_schema=ContextSchema,
)

builder.add_node("analyze", analyze)
builder.add_node("generate_prompt", generate_prompt)
builder.add_node("generate_image", generate_image)

builder.add_edge(START, "analyze")
builder.add_conditional_edges(
    "analyze", routing_function, {"generate_prompt": "generate_prompt", "stop": END}
)

builder.add_edge("generate_prompt", "generate_image")

builder.add_edge("generate_image", END)
builder.add_edge("analyze", END)
graph = builder.compile()


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()

    result = graph.invoke(
        ImageGeneratorInput(
            question=Question(
                text="A 2 kg block rests on a frictionless inclined plane angled 30 degrees above the horizontal. A rope pulls the block up the incline with a tension of 15 N, parallel to the surface. Draw or refer to the diagram of the forces on the block, then determine the block's acceleration along the incline."
            ),
        ),
        context=ContextSchema(
            model="gemini-2.5-flash",
            model_provider="google_genai",
        ),
    )
    # print(result)
    result = ImageGeneratorState.model_validate(result)
    png_data = graph.get_graph().draw_mermaid_png()
    with open("graph.png", "wb") as f:
        f.write(png_data)
    image_bytes = base64.b64decode(result.image)
    with open("generated_image.png", "wb") as f:
        f.write(image_bytes)
    print("Saved to generated_image.png")
