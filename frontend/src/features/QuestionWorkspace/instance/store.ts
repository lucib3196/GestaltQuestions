import { createStore } from "zustand";
import type { WorkspaceStore } from "./types";
import type { AnyResourceSchema } from "../../ResourceAccess/types";
import { createWorkspaceSettingsSlice } from "./settingSlice";
import { createResourceAccessSlice } from "../../ResourceAccess/slice";
import { persist } from "zustand/middleware";

export function createWorkspaceStore<
  Schema extends AnyResourceSchema = AnyResourceSchema,
>(options: { persistKey: string }) {
  return createStore<WorkspaceStore<Schema>>()(
    persist(
      (...args) => ({
        ...createResourceAccessSlice<Schema>()(...args),
        ...createWorkspaceSettingsSlice()(...args),
      }),
      {
        name: options.persistKey,
        partialize: (state) => ({
          activePanes: state.activePanes,
        }),
      },
    ),
  );
}
