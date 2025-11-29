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

