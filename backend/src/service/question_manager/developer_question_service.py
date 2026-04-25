import sqlalchemy.exc
import typing

from . import *
from .exceptions import (
    DeveloperAccessDenied,
    DeveloperProfileError,
    DeveloperQuestionControlError,
    DeveloperQuestionServiceError,
)
from .question_manager import QuestionManager


@dataclass
class AccessDecision:
    allowed: bool
    reason: str


class DeveloperQuestionService:
    """Gate developer question actions and coordinate developer-owned question data."""

    def __init__(
        self,
        user_manager: UserManager,
        storage: Storage,
        session: Session,
        question_manager: QuestionManager,
    ):
        self.user_mng = user_manager
        self.session = session
        self.qmng = question_manager
        self.storage = storage

    # ------------------------------------------------------------------
    # Role Validation
    # ------------------------------------------------------------------

    async def has_developer_role(self, user_id: ID) -> AccessDecision:
        """Return whether the user has admin or developer privileges."""
        logger.debug("Checking developer role for user %s", user_id)
        try:
            user = await self.user_mng.get_user(user_id)
            if user is None:
                logger.warning(
                    "Developer role check failed: user %s not found", user_id
                )
                return AccessDecision(False, f"User '{user_id}' not found")

            roles = await self.user_mng.get_user_role(user_id)
            role_names = {r.name.strip().lower() for r in roles}
            if (
                UserRoles.ADMIN.value in role_names
                or UserRoles.DEVELOPER.value in role_names
            ):
                logger.debug("Developer access granted for user %s", user_id)
                return AccessDecision(True, "Developer access granted")

            logger.warning("Developer role required for user %s", user_id)
            return AccessDecision(
                False, "Developer role is required to perform this action"
            )
        except DeveloperQuestionServiceError:
            raise
        except Exception as e:
            logger.warning("Failed checking developer role for user %s: %s", user_id, e)
            raise DeveloperAccessDenied(
                "Failed to determine developer role", user_id=str(user_id)
            ) from e

    async def require_developer_access(self, user_id: ID) -> None:
        """Raise when the user does not have developer-level access."""
        access = await self.has_developer_role(user_id)
        if not access.allowed:
            raise DeveloperAccessDenied(access.reason, user_id=str(user_id))

    async def has_question_control(self, user_id: ID, qid: ID) -> AccessDecision:
        """Return whether the developer profile has control over a question."""
        logger.debug(
            "Checking question control for user %s on question %s", user_id, qid
        )
        profile = await self.get_developer_data(user_id)
        if not profile:
            raise DeveloperProfileError("retrieve", str(user_id), "Profile not set")
        try:
            stmt = select(Question).where(Question.created_by_id == profile.id)
            q = self.session.exec(stmt).first()
            if q is None:
                logger.warning(
                    "Question control denied for user %s on question %s", user_id, qid
                )
                return AccessDecision(
                    allowed=False,
                    reason="User does not have access to modify the question",
                )
            return AccessDecision(allowed=True, reason="User has control")
        except SQLAlchemyError as e:
            logger.warning(
                "Database error checking question control for user %s on question %s",
                user_id,
                qid,
            )
            raise DeveloperQuestionControlError(str(user_id), str(qid), str(e)) from e

    async def require_question_control(self, user_id: ID, qid: ID) -> None:
        """Raise when the user does not control the requested question."""
        access = await self.has_question_control(user_id, qid)
        if not access.allowed:
            raise DeveloperAccessDenied(
                access.reason, user_id=str(user_id), question_id=str(qid)
            )

    # ------------------------------------------------------------------
    # Developer Profile Setters And Getters
    # ------------------------------------------------------------------

    async def get_developer_data(self, user_id: ID) -> DeveloperProfile | None:
        """Fetch the developer profile for a user after validating access."""
        await self.require_developer_access(user_id)
        try:
            logger.debug("Fetching developer profile for user %s", user_id)
            return self.session.exec(
                select(DeveloperProfile).where(DeveloperProfile.user_id == user_id)
            ).first()
        except SQLAlchemyError as e:
            logger.warning("Failed fetching developer profile for user %s", user_id)
            raise DeveloperProfileError("retrieve", str(user_id), str(e)) from e

    async def set_developer_data(self, user_id: ID) -> DeveloperProfile:
        """Create or refresh the developer profile and its storage path."""
        try:
            await self.require_developer_access(user_id)
            storage_path = await self.generate_storage_path(user_id)
            logger.debug("Setting developer profile for user %s", user_id)

            dev_profile = self.session.exec(
                select(DeveloperProfile).where(DeveloperProfile.user_id == user_id)
            ).first()

            if dev_profile is None:
                logger.info("Creating developer profile for user %s", user_id)
                dev_profile = DeveloperProfile(
                    user_id=convert_uuid(user_id), storage_path=storage_path
                )
                self.session.add(dev_profile)
            elif storage_path is not None:
                logger.debug("Updating developer storage path for user %s", user_id)
                dev_profile.storage_path = storage_path
                self.session.add(dev_profile)
                self.storage.create_dir(storage_path)

            self.session.commit()
            self.session.refresh(dev_profile)
            return dev_profile
        except DeveloperQuestionServiceError:
            raise
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.warning(
                "Database error setting developer profile for user %s", user_id
            )
            raise DeveloperProfileError("set up", str(user_id), str(e)) from e
        except Exception as e:
            logger.warning(
                "Failed setting developer profile for user %s: %s", user_id, e
            )
            raise DeveloperProfileError("set up", str(user_id), str(e)) from e

    async def generate_storage_path(self, id: ID) -> str:
        """Build the developer storage prefix from the user's institution and id."""
        user = await self.user_mng.get_user(id)
        if not user:
            raise DeveloperProfileError(
                "generate storage path", str(id), "User not found"
            )
        institution = await self.user_mng.get_user_inst(id)
        institution_name = (
            institution.name.value
            if institution and hasattr(institution.name, "value")
            else (institution.name if institution else "untitled_institution")
        )
        institution_slug = (
            re.sub(r"[^a-z0-9_-]+", "_", institution_name.lower()).strip("_")
            or "untitled_institution"
        )
        storage_path = f"{institution_slug}/developers/{user.id}/"
        logger.debug("Generated developer storage path for user %s", id)
        return storage_path

    # ------------------------------------------------------------------
    # Question Lifecycle
    # ------------------------------------------------------------------

    async def create_question(
        self,
        user_id: ID,
        payload: QuestionCreate,
        files: Optional[List[FileData]] = None,
    ) -> Question:
        """Create a question under the developer profile and assign ownership."""
        profile = await self.get_developer_data(user_id)
        if profile is None:
            logger.info("Creating developer profile for user %s", user_id)
            profile = await self.set_developer_data(user_id)

        if not profile.storage_path:
            raise DeveloperProfileError(
                "create question",
                str(user_id),
                f"Profile '{profile.id}' has no storage path",
            )
        question = await self.qmng.create_question(
            qdata=payload,
            storage_base_path=profile.storage_path,
            files=files,
        )
        try:
            logger.debug(
                "Assigning creator profile %s to question %s", profile.id, question.id
            )
            question.created_by = profile
            self.session.add(question)
            self.session.commit()
            self.session.refresh(question)
            return question
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.warning("Failed assigning creator to question %s", question.id)
            raise DeveloperProfileError(
                "assign question creator", str(user_id), str(e)
            ) from e

    async def list_my_questions(self, user_id: ID) -> List[Question]:
        """List questions created by the developer profile for the user."""
        await self.require_developer_access(user_id)
        try:
            user = await self.get_developer_data(user_id)
            if not user:
                raise DeveloperProfileError(
                    "retrieve", str(user_id), "Profile not found"
                )
            logger.debug("Listing questions for developer user %s", user_id)
            return user.created_questions
        except DeveloperQuestionServiceError:
            raise
        except SQLAlchemyError as e:
            raise DeveloperProfileError("list questions", str(user_id), str(e)) from e

    async def get_question(self, user_id: ID, qid: ID) -> Question:
        """Retrieve a question after checking developer question control."""
        await self.has_question_control(user_id, qid)
        q = await self.qmng.qdb.get_question(qid)
        if not q:
            raise QuestionNotFoundError(str(qid))
        return q

    async def update_question(self, user_id: ID, qid: ID, update: QuestionUpdate):
        """Update question metadata after checking developer question control."""
        await self.has_question_control(user_id, qid)
        return await self.qmng.update_question_meta(qid, update)

    async def delete_question(self, user_id: ID, qid: ID) -> bool:
        """Delete a question and its storage after checking developer question control."""
        await self.has_question_control(user_id, qid)
        return await self.qmng.delete_question(qid)

    # ------------------------------------------------------------------
    # Question Files
    # ------------------------------------------------------------------

    async def get_question_files(self, user_id: ID, qid: ID) -> typing.Sequence[str]:
        """List stored files for a controlled question."""
        await self.has_question_control(user_id, qid)
        return await self.qmng.get_question_files(qid)

    async def read_file(self, user_id: ID, qid: ID, filename: str) -> bytes | None:
        """Read a stored question file after checking developer question control."""
        await self.has_question_control(user_id, qid)
        return await self.qmng.read_file(qid, filename)

    async def write_file(self, user_id: ID, qid: ID, filename: str, data: typing.Any):
        """Write or replace a question file after checking developer question control."""
        await self.has_question_control(user_id, qid)
        return await self.qmng.write_file(qid, filename, data)

    async def delete_file(self, user_id: ID, qid: ID, filename: str):
        """Delete a question file after checking developer question control."""
        await self.has_question_control(user_id, qid)
        return await self.qmng.delete_file(qid, filename)

    async def upload_files(self, user_id: ID, qid: ID, files: List[FileData]):
        """Upload files to a question after checking developer question control."""
        await self.has_question_control(user_id, qid)
        return await self.qmng.upload_files(qid, files)
