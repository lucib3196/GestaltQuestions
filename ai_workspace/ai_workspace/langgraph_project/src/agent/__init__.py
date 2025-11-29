"""New LangGraph Agent.

This module defines a custom graph.
"""

from dotenv import load_dotenv
from pathlib import Path

env_path = Path(r"ai_workspace/.env").resolve().as_posix()
load_dotenv(env_path)
from agent.graph import graph

__all__ = ["graph"]
