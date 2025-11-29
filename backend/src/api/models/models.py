# Standard library
from typing import List, Optional, Union
from uuid import UUID, uuid4
from enum import Enum

# Third-party libraries
from sqlmodel import Field, Relationship, SQLModel


# ENUMS
class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    DEVELOPER = "developer"
    STUDENT = "student"


class QuestionStatus(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


# Actual SQLModels


class QuestionTopicLink(SQLModel, table=True):
    question_id: UUID | None = Field(
        default=None, foreign_key="question.id", primary_key=True
    )
    topic_id: UUID | None = Field(
        default=None, foreign_key="topic.id", primary_key=True
    )


class QuestionLanguageLink(SQLModel, table=True):
    question_id: UUID | None = Field(
        default=None, foreign_key="question.id", primary_key=True
    )
    language_id: UUID | None = Field(
        default=None, foreign_key="language.id", primary_key=True
    )


class QuestionQTypeLink(SQLModel, table=True):
    question_id: UUID | None = Field(
        default=None, foreign_key="question.id", primary_key=True
    )
    qtype_id: UUID | None = Field(
        default=None, foreign_key="qtype.id", primary_key=True
    )


# --------------------------------------------
# -----------------Users----------------------
# --------------------------------------------


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: str | None
    email: str | None
    role: UserRole = UserRole.STUDENT
    institution: str | None = None
    fb_id: str | None = None


class Question(SQLModel, table=True):
    id: UUID | None = Field(default_factory=uuid4, primary_key=True, index=True)
    # Question metadata contains basic fields
    title: Optional[str] = Field(default=None, index=True)
    topics: List["Topic"] = Relationship(
        back_populates="questions", link_model=QuestionTopicLink
    )
    languages: List["Language"] = Relationship(
        back_populates="questions", link_model=QuestionLanguageLink
    )
    qtypes: List["QType"] = Relationship(
        back_populates="questions", link_model=QuestionQTypeLink
    )

    # Question status
    ai_generated: bool = False
    isAdaptive: bool = False
    status: QuestionStatus = Field(default=QuestionStatus.PRIVATE)

    # Storage
    local_path: Optional[str] = None
    blob_path: Optional[str] = None

    created_by_id: UUID | None = Field(default=None, foreign_key="user.id")


# Question metadata


class Language(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True, unique=True)

    questions: List[Question] = Relationship(
        back_populates="languages",
        link_model=QuestionLanguageLink,
    )


class QType(SQLModel, table=True):

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True, unique=True)

    questions: List[Question] = Relationship(
        back_populates="qtypes",
        link_model=QuestionQTypeLink,
    )


class Topic(SQLModel, table=True):
    __tablename__ = "topic"  # type: ignore

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str = Field(index=True, unique=True)

    questions: List[Question] = Relationship(
        back_populates="topics",
        link_model=QuestionTopicLink,
    )
