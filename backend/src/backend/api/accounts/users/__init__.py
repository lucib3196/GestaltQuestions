from .auth import router as auth_router
from .by_id import router as by_id_router
from .current import router as current_router
from .health import router as health_router

user_routes = [
    auth_router,
    current_router,
    health_router,
    by_id_router,
]

__all__ = ["user_routes"]
