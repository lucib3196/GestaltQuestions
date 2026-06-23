from enum import StrEnum

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.runtime import Runtime
from pydantic import BaseModel, Field, model_validator


class ModelProvider(StrEnum):
    GEMINI = "google_genai"


class GeminiModel(StrEnum):
    GEMINI_3_5_FLASH = "gemini-3.5-flash"
    GEMINI_2_5_FLASH = "gemini-2.5-flash"
    GEMINI_2_5_FLASH_LITE = "gemini-2.5-flash-lite"
    GEMINI_2_5_PRO = "gemini-2.5-pro"


MODELS_BY_PROVIDER: dict[ModelProvider, tuple[StrEnum, ...]] = {
    ModelProvider.GEMINI: tuple(GeminiModel),
}


class ConfigSchema(BaseModel):
    model_provider: ModelProvider = ModelProvider.GEMINI
    model: GeminiModel = Field(default=GeminiModel.GEMINI_3_5_FLASH)

    @model_validator(mode="after")
    def validate_model_matches_provider(self) -> "ConfigSchema":
        valid_models = MODELS_BY_PROVIDER[self.model_provider]

        if self.model not in valid_models:
            raise ValueError(
                f"Model {self.model!r} is not valid for provider {self.model_provider!r}"
            )

        return self
