import type { UserDetailRead } from "../../../services";
import type { SelectedUsersById } from "../instance/store";
import { SelectedUserKeyList } from "./SelectedUserKeyList";

type SelectedUsersTrayProps = {
  isCompact: boolean;
  selectedUsersById: SelectedUsersById;
  // eslint-disable-next-line no-unused-vars
  onRemove: (user: UserDetailRead) => void;
};

export function SelectedUsersTray({
  isCompact,
  selectedUsersById,
  onRemove,
}: SelectedUsersTrayProps) {
  if (Object.keys(selectedUsersById).length === 0) {
    return null;
  }

  return (
    <div
      className={
        isCompact
          ? "mt-2 flex flex-wrap gap-2"
          : "mt-3 flex flex-wrap gap-2 rounded-md border border-border bg-surface-muted p-2"
      }
    >
      <SelectedUserKeyList
        selectedUsersById={selectedUsersById}
        onRemove={onRemove}
      />
    </div>
  );
}
