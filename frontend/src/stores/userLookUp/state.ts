import type { UserDetailRead } from "../../services";
export type SelectedUsersById = Record<string, UserDetailRead>;

export type UserLookupState = {
  selectedUsersById: SelectedUsersById;
};

export type UserLookupActions = {
  setSelectedUsers(users: UserDetailRead[]): void;
  clearSelectedUsers(): void;
  addSelectedUser(user: UserDetailRead): void;
  removeSelectedUser(userId: string): void;
  toggleSelectedUser(user: UserDetailRead): void;
};

export type UserLookupStore = UserLookupState & UserLookupActions;
