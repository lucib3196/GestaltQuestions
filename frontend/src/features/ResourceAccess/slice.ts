import type { StateCreator } from "zustand";
import type { ResourceAccessSchema, AnyResourceSchema } from "./types";
import type { ResourceAccessStore } from "./state";

export type ResourceAccessSliceCreator<
  Schema extends ResourceAccessSchema = AnyResourceSchema,
  Slice = unknown,
> = StateCreator<ResourceAccessStore<Schema>, [], [], Slice>;

export function createResourceAccessSlice<
  Schema extends ResourceAccessSchema = AnyResourceSchema,
>(): ResourceAccessSliceCreator<Schema, ResourceAccessStore<Schema>> {
  return (set) => ({
    access: null,
    capabilities: {},

    setAccess: (access) => set({ access: access }),
    setCapabilities: (cap) => set({ capabilities: cap }),
  });
}
