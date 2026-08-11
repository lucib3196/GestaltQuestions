from fastapi import APIRouter

from backend.api.developer import (
    collections,
    profile,
    question_access,
    question_manager,
    roles,
    tables,
)

router = APIRouter(prefix="/developer", tags=["Developer"])
router.include_router(profile.router)
router.include_router(question_access.router)
router.include_router(question_manager.router)
router.include_router(collections.router)
router.include_router(roles.router)
router.include_router(tables.router)
