from langchain.chat_models import init_chat_model

# Initialize a configurable model
model = init_chat_model(
    temperature=0, model_provider="google_genai", configurable_fields=("model",)
)

# Invoke with different models at runtime
response_1 = model.invoke(
    "what's your name",
    config={"configurable": {"model": "gemini-2.5-flash"}},
)
response_2 = model.invoke(
    "what's your name",
    config={"configurable": {"model": "gemini-2.5-flash"}},
)
