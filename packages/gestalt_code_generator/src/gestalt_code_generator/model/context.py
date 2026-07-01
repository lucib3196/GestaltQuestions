from langchain_core.vectorstores import VectorStore
from dataclasses import dataclass


# Context for the vectorstore to use
## and for the provided model
@dataclass
class ContextSchema:
    model: str
    model_provider: str


@dataclass
class GeneratorContext(ContextSchema):
    vectorstore: VectorStore
