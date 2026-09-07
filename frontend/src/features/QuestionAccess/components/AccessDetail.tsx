import { UserAvatar } from "../../../components/User";
import type { AccessLevel, QuestionAccessDetailRead } from "../../../services";

const editableAccessLevels: AccessLevel[] = ["view", "edit", "full"];

export function AccessDetail({
  details,
}: {
  details: QuestionAccessDetailRead;
}) {
  function handleAccessLevelChange(level: AccessLevel) {
    console.log("Update question access", {
      accessId: details.id,
      developerId: details.developer_id,
      questionId: details.question_id,
      level,
    });
  }

  return (
    <article className="flex min-h-20 items-center justify-between gap-4 border-b border-border px-1 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          user={{
            id: details.developer_id,
            email: details.email,
            username: details.username,
            first_name: details.first_name,
            last_name: details.last_name,
          }}
        />
      </div>

      <select
        value={details.access_level}
        disabled={details.access_level === "owner"}
        onChange={(event) =>
          handleAccessLevelChange(event.target.value as AccessLevel)
        }
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition hover:border-border-strong focus:border-accent"
      >
        {details.access_level === "owner" ? (
          <option value="owner">Owner</option>
        ) : null}
        {editableAccessLevels.map((level) => (
          <option key={level} value={level}>
            {level[0].toUpperCase() + level.slice(1)}
          </option>
        ))}
      </select>
    </article>
  );
}
