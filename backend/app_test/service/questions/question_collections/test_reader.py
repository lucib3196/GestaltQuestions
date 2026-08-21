from backend.question.collections import QuestionCollectionLink


def test_get_collection_returns_collection_by_id(
    question_collection_reader,
    make_collection,
) -> None:
    collection = make_collection(title="Reader Collection")

    result = question_collection_reader.get_collection(collection.id)

    assert result is not None
    assert result.id == collection.id
    assert result.title == "Reader Collection"


def test_get_collections_containing_question_returns_linked_collections(
    db_session,
    question_collection_reader,
    make_collection,
    make_question,
) -> None:
    question = make_question(title="Linked Question")
    collection_1 = make_collection(title="Collection 1")
    collection_2 = make_collection(title="Collection 2")
    unrelated_collection = make_collection(title="Unrelated Collection")

    db_session.add(
        QuestionCollectionLink(
            question_id=question.id,
            collection_id=collection_1.id,
        )
    )
    db_session.add(
        QuestionCollectionLink(
            question_id=question.id,
            collection_id=collection_2.id,
        )
    )
    db_session.commit()

    results = question_collection_reader.get_collections_containing_question(question)

    collection_ids = {collection.id for collection in results}
    assert len(results) == 2
    assert collection_ids == {collection_1.id, collection_2.id}
    assert unrelated_collection.id not in collection_ids


def test_get_questions_in_collection_returns_linked_questions(
    db_session,
    question_collection_reader,
    make_collection,
    make_question,
) -> None:
    collection = make_collection(title="Question Reader Collection")
    question_1 = make_question(title="Question 1")
    question_2 = make_question(title="Question 2")
    unrelated_question = make_question(title="Unrelated Question")

    db_session.add(
        QuestionCollectionLink(
            question_id=question_1.id,
            collection_id=collection.id,
        )
    )
    db_session.add(
        QuestionCollectionLink(
            question_id=question_2.id,
            collection_id=collection.id,
        )
    )
    db_session.commit()

    results = question_collection_reader.get_questions_in_collection(collection)

    question_ids = {question.id for question in results}
    assert len(results) == 2
    assert question_ids == {question_1.id, question_2.id}
    assert unrelated_question.id not in question_ids
