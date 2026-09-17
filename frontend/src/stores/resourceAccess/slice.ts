import type { StateCreator } from "zustand";

import type { ResourceAccessStore } from "./state";
import type {
  AnyResourceSchema,
  Capabilities,
  ResourceAccessSchema,
} from "./types";

export type ResourceAccessSliceCreator<
  Schema extends ResourceAccessSchema = AnyResourceSchema,
  Store extends ResourceAccessStore<Schema> = ResourceAccessStore<Schema>,
  Slice = ResourceAccessStore<Schema>,
> = StateCreator<Store, [], [], Slice>;

export function createResourceAccessSlice<
  Schema extends ResourceAccessSchema = AnyResourceSchema,
  Store extends ResourceAccessStore<Schema> = ResourceAccessStore<Schema>,
>(): ResourceAccessSliceCreator<Schema, Store, ResourceAccessStore<Schema>> {
  return (set) => ({
    access: null,
    capabilities: {} as Capabilities<Schema>,

    setAccess: (access) => set({ access } as Partial<Store>),
    setCapabilities: (cap) => set({ capabilities: cap } as Partial<Store>),
    clearAccess: () =>
      set({
        access: null,
        capabilities: {} as Capabilities<Schema>,
      } as Partial<Store>),
  });
}
