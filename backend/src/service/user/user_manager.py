from src.data.user import UserDB
from src.model.users import User, UserCreate, UserRoles, DeveloperProfile
from firebase_admin import auth
from sqlmodel import Session
from uuid import UUID
from src.data.role import RoleDB
from src.service.storage.base import Storage
from src.core.logging import logger

ID = UUID | str


class UserManager:
    def __init__(self, session: Session):
        """Initialize user and role repositories for the provided session."""
        self.udb = UserDB(session)
        self.rm = RoleDB(session)

    async def create_user(self, data: UserCreate, role: UserRoles) -> User:
        """Create a user and optionally attach a role."""
        try:
            user_orm = await self.udb.create_user(data)
            username = user_orm.username
            if not username:
                username = (
                    f"{user_orm.first_name}_{user_orm.last_name}_{str(user_orm.id)[:4]}"
                )
            response = auth.create_user(
                email=user_orm.email,
                display_name=username,
                uid=str(user_orm.id),
                password=data.password,
            )

            if role:
                r = await self.rm.get_role(role)
                if not r:
                    logger.error("failed to add user role")
                    return user_orm
                user_orm.roles.append(r)
            return user_orm
        except Exception as e:
            # Try best to role back
            raise ValueError(f"[UserManager] Failed to create user {e}")

    async def get_user(self, id: ID):
        """Return a user by UUID or string ID."""
        return await self.udb.get_user(id)


