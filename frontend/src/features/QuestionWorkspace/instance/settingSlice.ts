import type { StateCreator } from "zustand";
import type { WorkspaceStore, WorkspaceSettingStore } from "./types";
import type { WorkspacePane } from "./types";

const defaultPane: WorkspacePane = "livePreview";
const defaultActivePanes: WorkspacePane[] = ["livePreview"];

export type WorkspaceSettingSliceCreator<Slice = unknown> = StateCreator<
  WorkspaceStore,
  [],
  [],
  Slice
>;
export function createWorkspaceSettingsSlice(): WorkspaceSettingSliceCreator<WorkspaceSettingStore> {
  return (set) => ({
    layoutMode: "single",
    activePanes: ["editor"],
    selectedRuntimeLanguage: null,
    runtimeLanguages: [],
    setLayoutMode: (mode) =>
      set((state) => ({
        layoutMode: mode,
        activePanes:
          mode === "single"
            ? [state.activePanes[0] ?? defaultPane]
            : state.activePanes.length
              ? state.activePanes
              : defaultActivePanes,
      })),

    setActivePanes: (panes) =>
      set({
        activePanes: panes.length ? panes : [defaultPane],
      }),

    togglePane: (pane) =>
      set((state) => {
        const nextPanes = state.activePanes.includes(pane)
          ? state.activePanes.filter((activePane) => activePane !== pane)
          : [...state.activePanes, pane];

        return {
          activePanes: nextPanes.length ? nextPanes : [defaultPane],
        };
      }),

    showSinglePane: (pane) =>
      set({
        layoutMode: "single",
        activePanes: [pane],
      }),

    setRuntimeLanguages: (languages) =>
      set((state) => ({
        runtimeLanguages: languages,
        selectedRuntimeLanguage:
          state.selectedRuntimeLanguage ?? languages[0] ?? null,
      })),

    setSelectedRuntimeLanguage: (language) =>
      set({ selectedRuntimeLanguage: language }),
  });
}
