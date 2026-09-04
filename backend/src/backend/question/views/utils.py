import json
from enum import StrEnum
from typing import Any, TypeVar

EnumT = TypeVar("EnumT", bound=StrEnum)


def normalize_list(value: Any) -> list[Any] | None:
    if value is None:
        return None

    if isinstance(value, list):
        return value

    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return [value]

        if isinstance(parsed, list):
            return parsed

        return [parsed]

    return [value]


def coerce_str_enum[EnumT: StrEnum](value: Any, enum_type: type[EnumT]) -> EnumT | Any:
    if isinstance(value, enum_type):
        return value

    if isinstance(value, str):
        try:
            return enum_type(value)
        except ValueError:
            pass

        try:
            return enum_type[value]
        except KeyError:
            pass

    return value
