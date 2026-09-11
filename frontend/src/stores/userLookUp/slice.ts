import type { StateCreator } from "zustand";

import type { UserLookupStore } from "./state";
import { usersToRecord } from "./utils";
import { getUserId } from "./utils";

export type UserLookUpSliceCreator<
  Store extends UserLookupStore = UserLookupStore,
  Slice = UserLookupStore,
> = StateCreator<Store, [], [], Slice>;

export function createUserLookUpSlice<
  Store extends UserLookupStore = UserLookupStore,
>(): UserLookUpSliceCreator<Store, UserLookupStore> {
  return (set) => ({
    selectedUsersById: {},
    setSelectedUsers: (users) =>
      set({
        selectedUsersById: usersToRecord(users),
      } as Partial<Store>),

    clearSelectedUsers: () =>
      set({
        selectedUsersById: {},
      } as Partial<Store>),

    addSelectedUser: (user) =>
      set(
        (state) =>
          ({
            selectedUsersById: {
              ...state.selectedUsersById,
              [getUserId(user)]: user,
            },
          }) as Partial<Store>,
      ),

    removeSelectedUser: (userId) =>
      set((state) => {
        const nextSelectedUsers = { ...state.selectedUsersById };
        delete nextSelectedUsers[String(userId)];

        return {
          selectedUsersById: nextSelectedUsers,
        } as Partial<Store>;
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
        } as Partial<Store>;
      }),
  });
}
