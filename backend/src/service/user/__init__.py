import re
from dataclasses import dataclass
from typing import List, Optional, Union

from firebase_admin import auth
from sqlmodel import Session, select

from src.app_types.general import ID
from src.core.logging import logger
from src.data.institution import InstitutionDB
from src.data.role import RoleDB
from src.data.user import UserDB
from src.model.institution import Institution, ValidInstitutions
from src.model.users import DeveloperProfile, Role, User, UserCreate, UserRoles
from src.service.question_manager.question_manager import QuestionManager
from src.service.storage.base import Storage
from src.utils.database_utils import convert_uuid
from src.model.question import QuestionUpdate, QuestionUpdate, QuestionCreate
from src.model.files import FileData
from src.model.question import QuestionUpdate, Question
from sqlalchemy.exc import SQLAlchemyError
