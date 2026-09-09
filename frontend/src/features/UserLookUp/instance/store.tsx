import { createStore } from "zustand";

import {
  createUserLookUpSlice,
  type UserLookupState,
  type UserLookupStore,
} from "../../../stores/userLookUp";

const initialState: UserLookupState = {
  selectedUsersById: {},
};

export type {
  SelectedUsersById,
  UserLookupState,
  UserLookupStore,
} from "../../../stores/userLookUp";

export function createUserLookupStore(preloaded?: Partial<UserLookupState>) {
  return createStore<UserLookupStore>()((...args) => ({
    ...createUserLookUpSlice<UserLookupStore>()(...args),
    ...initialState,
    ...preloaded,
  }));
}
