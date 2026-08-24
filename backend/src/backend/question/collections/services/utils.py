from backend.authorization import Profile
from backend.question.collections.exceptions import QuestionCollectionValidationError


def require_profile_id(profile: Profile):
    if profile.id is None:
        raise QuestionCollectionValidationError("Profile must be persisted")
    return profile.id
