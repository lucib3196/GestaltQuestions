from src.data.user import UserDB
from src.model.users import User, UserCreate, UserRoles, DeveloperProfile
from firebase_admin import auth
from sqlmodel import Session
from uuid import UUID
from src.data.role import RoleDB
from src.service.storage.base import Storage
from src.core.logging import logger
from src.app_types.general import ID
from src.data.user import Role
from typing import List, Union


class UserManager:
    def __init__(self, session: Session):
        """Initialize user and role repositories for the provided session."""
        self.udb = UserDB(session)
        self.rm = RoleDB(session)
        self.session = session

    async def create_user(self, data: UserCreate, role: UserRoles) -> User:
        """Create a user and optionally attach a role."""
        user_orm = None
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
            logger.debug("Got a user create response %s", response)
            assert response
            logger.debug(f"Attempting to add role {role}")
            if role:
                user_orm = await self.add_role_to_user(role, user_orm)
            return user_orm
        except Exception as e:
            # Try best to role back
            if user_orm is not None:
                logger.warning(f"Failed to create user {e} attempting to rollback")
                failed_id = getattr(user_orm, "id")
                await self.udb.delete_user(failed_id)
            raise ValueError(f"[UserManager] Failed to create user {e}")

    async def add_role_to_user(self, role: UserRoles, user: Union["User", ID]) -> User:
        if isinstance(user, ID):
            user_orm = await self.get_user(user)
            if not user_orm:
                raise ValueError("User not found")
        else:
            user_orm = user

        # Get role
        r = await self.rm.get_role(role)
        if not r:
            raise ValueError("Role not found")

        # Ensure same session
        r = self.session.merge(r)

        # Avoid duplicates
        if r not in user_orm.roles:
            user_orm.roles.append(r)

        # Persist
        self.session.add(user_orm)
        self.session.commit()
        self.session.refresh(user_orm)

        return user_orm

    async def delete_user(self, id: ID) -> None:
        try:
            logger.debug("Attempting to delete user")
            await self.udb.delete_user(id)
            logger.debug("Deleted user from database")
            logger.debug("Deleted user from fb ")
            auth.delete_user(uid=id)
            return None
        except Exception as e:
            raise ValueError(f"Failed to delete user {e}")

    async def get_user(self, id: ID) -> User | None:
        """Return a user by UUID or string ID."""
        return await self.udb.get_user(id)

    async def get_user_role(self, id: ID) -> List[Role]:
        try:
            user = await self.get_user(id)
            if not user:
                raise ValueError("Failed to get user. User does not exist")
            logger.debug(f"Getting user roles {user.roles}")
            return user.roles
        except Exception as e:
            raise e
