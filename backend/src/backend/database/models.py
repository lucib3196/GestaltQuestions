from importlib import import_module

MODEL_MODULES = (
    "backend.accounts.model",
    "backend.chat.model",
    "backend.developer.model",
    "backend.question.models",
    "backend.question.access.models",
    "backend.question.collections.models",
    "backend.question_attempt.model",
    "backend.question_runtime.model",
    "backend.storage.model",
)


def import_models() -> None:
    """Import all SQLModel table modules so metadata is registered."""
    for module in MODEL_MODULES:
        import_module(module)
