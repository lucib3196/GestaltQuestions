from collections.abc import Sequence
from enum import StrEnum
from typing import Any

from backend.question.views.schema import QuestionSearchParams


class QuestionTableFilterBuilder:
    def __init__(self, params: QuestionSearchParams) -> None:
        self.params = params
        self.clauses: list[str] = []
        self.query_params: dict[str, Any] = {
            "limit": params.limit,
            "offset": params.offset,
        }

    def build(
        self,
    ) -> tuple[str, dict[str, Any]]:
        self.add_title()
        self.add_status()
        self.add_topic()
        self.add_qtype()
        self.add_language()
        self.add_institution()
        self.add_is_adaptive()
        self.add_collection()

        where_sql = ""
        if self.clauses:
            where_sql = "WHERE " + " AND ".join(self.clauses)
        return where_sql, self.query_params

    def add(self, clause: str, **params: Any) -> None:
        self.clauses.append(clause)
        self.query_params.update(params)

    def add_title(
        self,
    ) -> None:
        if not self.params.search:
            return
        self.add(
            "title ILIKE :search",
            search=f"%{self.params.search}%",
        )

    def add_status(
        self,
    ) -> None:
        if self.params.published is not None:
            self.add(
                "status = :published_status",
                published_status="PUBLISHED" if self.params.published else "DRAFT",
            )
            return
        if self.params.status:
            self.add("status = :status", status=self.params.status.name)

    def add_topic(self) -> None:
        if not self.params.topic:
            return

        self.add(
            "EXISTS ("
            "SELECT 1 FROM unnest(topics) AS topic_item(topic) "
            "WHERE topic ILIKE :topic"
            ")",
            topic=f"%{self.params.topic}%",
        )

    def add_qtype(
        self,
    ) -> None:
        if not self.params.qtype:
            return
        qtype_names = self._enum_names(self.params.qtype)

        if qtype_names:
            self.add(
                "("
                + " OR ".join(
                    f":qtype_{index} = ANY(question_type)"
                    for index in range(len(qtype_names))
                )
                + ")",
                **{f"qtype_{index}": qtype for index, qtype in enumerate(qtype_names)},
            )

    def add_language(self) -> None:
        if not self.params.language:
            return
        languages = self._enum_names(self.params.language)
        if languages:
            self.add(
                "("
                + " OR ".join(
                    f":language_{index} = ANY(available_runtimes)"
                    for index in range(len(languages))
                )
                + ")",
                **{
                    f"language_{index}": language
                    for index, language in enumerate(languages)
                },
            )

    def add_is_adaptive(self) -> None:
        if self.params.isAdaptive is not None:
            self.add('"isAdaptive" = :isAdaptive', isAdaptive=self.params.isAdaptive)

    def add_institution(self) -> None:
        if not self.params.institution:
            return
        self.add("institution = :institution", institution=self.params.institution.name)

    def add_collection(self) -> None:
        if self.params.collection_id is not None:
            self.add(
                "collection_id = :collection_id",
                collection_id=self.params.collection_id,
            )

        if self.params.collection_title:
            self.add(
                "collection_title ILIKE :collection_title",
                collection_title=self.params.collection_title,
            )

    @staticmethod
    def _enum_names(value: StrEnum | Sequence[StrEnum] | None) -> list[str]:
        if value is None:
            return []

        values = (
            value
            if isinstance(value, Sequence) and not isinstance(value, str)
            else [value]
        )
        return [item.name for item in values]
