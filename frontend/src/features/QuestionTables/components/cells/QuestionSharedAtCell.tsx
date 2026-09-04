export function QuestionSharedAtCell({
  row,
}: {
  row: { shared_at: string | null };
}) {
  if (!row.shared_at) {
    return <span>-</span>;
  }

  return <span>{new Date(row.shared_at).toLocaleDateString()}</span>;
}
