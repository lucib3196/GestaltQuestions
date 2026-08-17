import pytest

from backend.question_collections import QuestionAlreadyInCollectionError


@pytest.mark.asyncio
async def test_add_question(question_collection_service, creator_with_question) -> None:
    profile = creator_with_question.profile
    question = creator_with_question.question
    collection = await question_collection_service.create_collection(
        profile, title="MyCollection"
    )
    qlink = await question_collection_service.add_question(collection, question)
    assert qlink
    assert qlink.question_id == question.id
    assert qlink.collection_id == collection.id


@pytest.mark.asyncio
async def test_get_all_questions_returns_added_questions(
    question_collection_service,
    creator,
    make_question,
) -> None:
    collection = await question_collection_service.create_collection(
        creator.profile,
        title="Practice",
    )
    question_1 = make_question(creator.profile, title="Question 1")
    question_2 = make_question(creator.profile, title="Question 2")
    unrelated_question = make_question(creator.profile, title="Unrelated")

    await question_collection_service.add_question(collection, question_1)
    await question_collection_service.add_question(collection, question_2)

    questions = await question_collection_service.get_all_questions(collection)

    question_ids = {question.id for question in questions}
    assert question_ids == {question_1.id, question_2.id}
    assert unrelated_question.id not in question_ids


@pytest.mark.asyncio
async def test_get_collection_detail_read_includes_question_ids(
    question_collection_service,
    creator_with_question,
) -> None:
    collection = await question_collection_service.create_collection(
        creator_with_question.profile,
        title="Detail Collection",
    )

    await question_collection_service.add_question(
        collection,
        creator_with_question.question,
    )

    detail = await question_collection_service.get_collection_detail_read(collection)

    assert detail.id == collection.id
    assert detail.title == "Detail Collection"
    assert detail.question_ids == [creator_with_question.question.id]


@pytest.mark.asyncio
async def test_remove_question_unlinks_question_from_collection(
    question_collection_service,
    creator_with_question,
) -> None:
    collection = await question_collection_service.create_collection(
        creator_with_question.profile,
        title="Removable Collection",
    )

    await question_collection_service.add_question(
        collection,
        creator_with_question.question,
    )

    removed = await question_collection_service.remove_question(
        collection,
        creator_with_question.question,
    )
    questions = await question_collection_service.get_all_questions(collection)

    assert removed is True
    assert questions == []


@pytest.mark.asyncio
async def test_add_question_raises_when_question_already_in_collection(
    question_collection_service,
    creator_with_question,
) -> None:
    collection = await question_collection_service.create_collection(
        creator_with_question.profile,
        title="No Duplicates",
    )

    await question_collection_service.add_question(
        collection,
        creator_with_question.question,
    )

    with pytest.raises(QuestionAlreadyInCollectionError):
        await question_collection_service.add_question(
            collection,
            creator_with_question.question,
        )
