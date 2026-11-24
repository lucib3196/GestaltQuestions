type CollectionQuestionsTabsProps = {
  questionCount: number;
};

export function CollectionQuestionsTabs({
  questionCount,
}: CollectionQuestionsTabsProps) {
  return (
    <div className="mt-10 border-b border-border">
      <button
        type="button"
        className="relative h-12 px-1 text-sm font-semibold text-accent after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-accent"
      >
        Questions ({questionCount})
      </button>
    </div>
  );
}
