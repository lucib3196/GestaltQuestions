import type { UserDetailRead } from "../../services";
import type { SelectedUsersById } from "./state";
export function getUserId(user: UserDetailRead) {
  return String(user.id);
}

export function usersToRecord(users: UserDetailRead[]): SelectedUsersById {
  return users.reduce<SelectedUsersById>((usersById, user) => {
    usersById[getUserId(user)] = user;
    return usersById;
  }, {});
}