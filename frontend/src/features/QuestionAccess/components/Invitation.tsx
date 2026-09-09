import { useState } from "react";
import type { ShareableAccessLevel } from "../../../services";

export function QuestionInvitation() {
  const [shareLevel, setShareLevel] = useState<ShareableAccessLevel>("view");
  return (
    <div className="mt-4 rounded-md border border-border bg-surface-secondary p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium text-text">
          Access level
          <select
            value={shareLevel}
            onChange={(event) =>
              setShareLevel(event.target.value as ShareableAccessLevel)
            }
            className="ml-3 h-9 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none transition hover:border-border-strong focus:border-accent"
          >
            {shareLevels.map((level) => (
              <option key={level} value={level}>
                {level[0].toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={sharingBatch || selectedUserIds.length === 0}
          onClick={handleShareSelected}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Share {selectedUserIds.length || ""}
        </button>
      </div>
    </div>
  );
}
