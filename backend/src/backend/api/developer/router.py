from fastapi import APIRouter

from backend.api.developer import (
    collection_access,
    collections,
    profile,
    question_access,
    question_manager,
    roles,
    tables,
    user_lookup,
)

router = APIRouter(prefix="/developer", tags=["Developer"])
router.include_router(profile.router)
router.include_router(question_access.router)
router.include_router(collection_access.router)
router.include_router(question_manager.router)
router.include_router(collections.router)
router.include_router(roles.router)
router.include_router(tables.router)
router.include_router(user_lookup.router)
