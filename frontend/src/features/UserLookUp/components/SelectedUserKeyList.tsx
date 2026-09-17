import type { UserDetailRead } from "../../../services";
import type { SelectedUsersById } from "../instance/store";
import { SelectedUserKey } from "./SelectedUserKey";

type SelectedUserKeyListProps = {
  selectedUsersById: SelectedUsersById;
  // eslint-disable-next-line no-unused-vars
  onRemove: (user: UserDetailRead) => void;
};

export function SelectedUserKeyList({
  selectedUsersById,
  onRemove,
}: SelectedUserKeyListProps) {
  return (
    <>
      {Object.entries(selectedUsersById).map(([userId, user]) => (
        <SelectedUserKey key={userId} user={user} onRemove={onRemove} />
      ))}
    </>
  );
}
