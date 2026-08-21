class QuestionCollectionReader2(Generic[ProfileT]):
    def __init__(self, session: Session) -> None:
        self._session = session

    def _access_table(
        self,
    ) -> None:
        select(QuestionCollection, QuestionCollectionAccess).join(
            QuestionCollection,
            col(QuestionCollection.id == QuestionCollectionAccess.collection_id),
        )
