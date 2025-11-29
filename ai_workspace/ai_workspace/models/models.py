from typing import Literal, Dict
from pydantic import BaseModel, Field
from typing import List, Literal
from pydantic import BaseModel, Field

allowed_files = Literal["question.html", "solution.html", "server.js", "server.py"]
question_types = Literal[
    "computational",
    "static",
]


class PageRange(BaseModel):
    start_page: int
    end_page: int


class Question(BaseModel):
    question_text: str
    solution_guide: str | None
    final_answer: str | None
    question_html: str


class CodeResponse(BaseModel):
    """Output schema from the LLM for code generation."""

    code: str = Field(..., description="The generated code. Only return the code.")


class ExtractedQuestion(BaseModel):
    """
    A general-purpose representation of a question and its solution extracted
    from lecture notes, handwritten work, PDFs, slides, or any multimodal source.
    This model does not assume a specific question format; instead, it captures
    the essential components that may appear across conceptual, computational,
    derivation-based, or multiple-choice problems.
    """

    question_text: str = Field(
        ..., description="The raw question extracted from the source material."
    )

    qtype: question_types = Field(
        ...,
        description=(
            "The detected type of the question (e.g., 'conceptual', 'computational', "
            "'derivation', 'multiple_choice', 'short_answer')."
        ),
    )

    topics: List[str] = Field(
        default_factory=list,
        description=(
            "A list of detected topics, keywords, or concepts associated with the question."
        ),
    )

    options: List["Option"] | None = Field(
        default=None,
        description=(
            "If the question is multiple-choice, the extracted answer options. "
            "Otherwise, this field is None."
        ),
    )

    reference: PageRange | None = Field(
        default=None,
        description=(
            "Where in the lecture material the question was found. Can be a page range, "
            "slide number, or location index. Optional."
        ),
    )

    solution: str | None = Field(
        default=None,
        description="The extracted or reconstructed solution guide corresponding to the question.",
    )

    def as_string(self) -> str:
        """Return a formatted string representation of the extracted question."""
        base = [
            "### **Extracted Question**",
            f"**Type:** {self.qtype}",
            f"**Question:** {self.question_text}",
            f"**Topics:** {', '.join(self.topics) if self.topics else 'N/A'}",
        ]

        # Options
        if self.options:
            options_formatted = "\n".join(
                [
                    f"- {'✅ ' if opt.is_correct else ''}{opt.text}"
                    for opt in self.options
                ]
            )
            base.append(f"**Options:**\n{options_formatted}")

        # Solution
        base.append(f"**Solution:**\n{self.solution or 'N/A'}")

        # Explanation
        # Reference
        base.append(f"**Reference:** {self.reference or 'N/A'}")

        return "\n\n".join(base) + "\n"


class Option(BaseModel):
    text: str = Field(..., description="Text of the answer choice.")
    is_correct: bool = Field(
        ..., description="True if this option is the correct answer, otherwise False."
    )


class ConceptualQuestion(BaseModel):
    question: str = Field(..., description="The conceptual question being asked.")
    topics: List[str] = Field(
        ...,
        description="A list of three key topics or concepts that this question addresses.",
    )
    options: List["Option"] = Field(
        ...,
        description="Multiple-choice options corresponding to possible answers for the question.",
    )
    reference: "PageRange" = Field(
        ...,
        description="Page range within the lecture material where the concept or question originates.",
    )
    explanation: str = Field(
        ...,
        description="A concise explanation of the correct answer intended to help students understand the reasoning.",
    )

    def as_string(self) -> str:
        """Return a formatted string representation of the conceptual question."""
        options_formatted = "\n".join(
            [f"- {'✅ ' if opt.is_correct else ''}{opt.text}" for opt in self.options]
        )
        topics_formatted = ", ".join(self.topics)

        return (
            f"### **Conceptual Question**\n"
            f"**Question:** {self.question}\n\n"
            f"**Topics:** {topics_formatted}\n\n"
            f"**Options:**\n{options_formatted}\n\n"
            f"**Explanation:** {self.explanation}\n\n"
            f"**Reference:** {self.reference}\n"
        )
