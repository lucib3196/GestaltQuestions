import { createStore } from "zustand";
import { useStore } from "zustand";

import type { UserDetailRead } from "../../../services";

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

const initialState: UserLookupState = {
  selectedUsersById: {},
};

function getUserId(user: UserDetailRead) {
  return String(user.id);
}

function usersToRecord(users: UserDetailRead[]): SelectedUsersById {
  return users.reduce<SelectedUsersById>((usersById, user) => {
    usersById[getUserId(user)] = user;
    return usersById;
  }, {});
}

export function createUserLookupStore(preloaded?: Partial<UserLookupState>) {
  return createStore<UserLookupStore>()((set) => ({
    ...initialState,
    ...preloaded,

    setSelectedUsers: (users) =>
      set({
        selectedUsersById: usersToRecord(users),
      }),

    clearSelectedUsers: () =>
      set({
        selectedUsersById: {},
      }),

    addSelectedUser: (user) =>
      set((state) => ({
        selectedUsersById: {
          ...state.selectedUsersById,
          [getUserId(user)]: user,
        },
      })),

    removeSelectedUser: (userId) =>
      set((state) => {
        const nextSelectedUsers = { ...state.selectedUsersById };
        delete nextSelectedUsers[String(userId)];

        return {
          selectedUsersById: nextSelectedUsers,
        };
      }),

    toggleSelectedUser: (user) =>
      set((state) => {
        const userId = getUserId(user);
        const nextSelectedUsers = { ...state.selectedUsersById };

        if (Object.hasOwn(nextSelectedUsers, userId)) {
          delete nextSelectedUsers[userId];
        } else {
          nextSelectedUsers[userId] = user;
        }

        return {
          selectedUsersById: nextSelectedUsers,
        };
      }),
  }));
}

export const userLookupStore = createUserLookupStore();

export function useUserLookupStore<T>(selector: (state: UserLookupStore) => T) {
  return useStore(userLookupStore, selector);
}
