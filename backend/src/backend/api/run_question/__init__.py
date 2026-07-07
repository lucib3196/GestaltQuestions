from .run_question import router
from .runtime_config import router as config_router

RUNTIME_ROUTES = [router, config_router]

__all__ = ["RUNTIME_ROUTES"]
