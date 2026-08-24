import { createStore, } from "zustand";
import type { UserDetailRead } from "../../../services";
import { useStore } from "zustand";
export type UserLookUpState = {
  userById: Record<string, UserDetailRead>;
  selectedUserIds: string[];
};

export type UserLookUpActions = {
  setUserById: (u: UserDetailRead[]) => void;
  setSelectedUserIds: (ids: string[]) => void;
};

export type UserLookUpStore = UserLookUpState & UserLookUpActions;

const initialState: UserLookUpState = {
  userById: {},
  selectedUserIds: [],
};
export function createUserLookUpStore(preloaded?: Partial<UserLookUpState>) {
  return createStore<UserLookUpStore>()((set) => ({
    ...initialState,
    ...preloaded,
    setSelectedUserIds: (ids) => {
      set({ selectedUserIds: ids });
    },
    setUserById: (users) => {
      const usersById: Record<string, UserDetailRead> = {};
      users.forEach((user) => {
        usersById[user.id] = user;
      });

      return set({ userById: usersById });
    },
  }));
}

export const userLookUpStore = createUserLookUpStore();

export function useUserLookUpStore<T>(
  selector: (state: UserLookUpStore) => T
) {
  return useStore(userLookUpStore, selector);
}