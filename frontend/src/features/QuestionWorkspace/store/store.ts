import { createStore } from "zustand";
import { persist } from "zustand/middleware";

import { createWorkspaceSettingsSlice } from "../../../stores/paneLayout/settingSlice";
import {
  type AnyResourceSchema,
  createResourceAccessSlice,
} from "../../../stores/resourceAccess";
import { createWorkspaceSessionSlice } from "./sessionSlice";
import type { WorkspaceStore } from "./types";

export const QUESTION_WORKSPACE_PERSIST_KEY = "question-workspace-settings:v1";

export function createWorkspaceStore<
  Schema extends AnyResourceSchema = AnyResourceSchema,
>(options: { persistKey?: string } = {}) {
  return createStore<WorkspaceStore<Schema>>()(
    persist(
      (...args) => ({
        ...createResourceAccessSlice<Schema, WorkspaceStore<Schema>>()(...args),
        ...createWorkspaceSettingsSlice<WorkspaceStore<Schema>>()(...args),
        ...createWorkspaceSessionSlice<WorkspaceStore<Schema>>()(...args),
      }),
      {
        name: options.persistKey ?? QUESTION_WORKSPACE_PERSIST_KEY,
        partialize: (state) => ({
          layoutMode: state.layoutMode,
          activePanes: state.activePanes,
        }),
      },
    ),
  );
}
