type CollectionQuestionsTabsProps = {
  questionCount: number;
};

export function CollectionQuestionsTabs({
  questionCount,
}: CollectionQuestionsTabsProps) {
  return (
    <div className="mt-10 border-b border-slate-700/80">
      <button
        type="button"
        className="relative h-12 px-1 text-sm font-semibold text-slate-50 after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-pink-500"
      >
        Questions ({questionCount})
      </button>
    </div>
  );
}
