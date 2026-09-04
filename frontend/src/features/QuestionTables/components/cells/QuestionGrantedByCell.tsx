export function QuestionGrantedByCell({
  row,
}: {
  row: { granted_by_email: string | null };
}) {
  return <span>{row.granted_by_email || "-"}</span>;
}
