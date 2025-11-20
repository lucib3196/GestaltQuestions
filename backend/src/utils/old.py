def inject_message(
    messages: Union[Sequence[BaseMessage], ChatPromptValue],
    content: str,
    insert_idx: int = 0,
) -> list[BaseMessage]:
    """
    Insert a SystemMessage into a chat message sequence (or ChatPromptValue).

    - Accepts either a concrete sequence[List[BaseMessage]] or a ChatPromptValue.
    - Returns a new list with the injected SystemMessage at insert_idx.
    """
    # Convert ChatPromptValue -> list[BaseMessage]
    if isinstance(messages, ChatPromptValue):
        messages = messages.to_messages()  # <-- critical conversion
    # Ensure we can slice safely
    seq = list(messages)
    return seq[:insert_idx] + [SystemMessage(content=content)] + seq[insert_idx:]


def validate_llm_output(output: Any, model_class: type):
    if isinstance(output, dict):
        return model_class.parse_obj(output)
    elif isinstance(output, model_class):
        return output
    else:
        raise TypeError(
            f"Unexpected Resuls: Output is of type {type(output)} expected type {model_class}"
        )


def merge_files_data(
    existing: Union[FilesData, dict], new: Union[FilesData, dict]
) -> "FilesData":
    """
    Merges two FilesData instances by taking non-empty fields from the new value.
    Accepts `new` as either a dict or FilesData.
    """
    if isinstance(new, dict):
        new = FilesData(**new)  # Coerce dict to FilesData
    if isinstance(existing, dict):
        existing = FilesData(**existing)

    return FilesData(
        question_html=new.question_html or existing.question_html,
        server_js=new.server_js or existing.server_js,
        server_py=new.server_py or existing.server_py,
        solution_html=new.solution_html or existing.solution_html,
        metadata=new.metadata or existing.metadata,
    )
