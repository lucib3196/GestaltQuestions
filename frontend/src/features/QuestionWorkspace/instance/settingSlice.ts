import type { StateCreator } from "zustand";
import type { WorkspaceSettingStore } from "./types";
import type { WorkspacePane } from "./types";

const defaultPane: WorkspacePane = "livePreview";
const defaultActivePanes: WorkspacePane[] = [
  "livePreview",
  "editor",
  "metadata",
];

export type WorkspaceSettingSliceCreator<
  Store extends WorkspaceSettingStore = WorkspaceSettingStore,
  Slice = WorkspaceSettingStore,
> = StateCreator<
  Store,
  [],
  [],
  Slice
>;
export function createWorkspaceSettingsSlice<
  Store extends WorkspaceSettingStore = WorkspaceSettingStore,
>(): WorkspaceSettingSliceCreator<Store, WorkspaceSettingStore> {
  return (set) => ({
    layoutMode: "split",
    activePanes: defaultActivePanes,
    selectedRuntimeLanguage: null,
    runtimeLanguages: [],
    setLayoutMode: (mode) =>
      set(
        (state) =>
          ({
            layoutMode: mode,
            activePanes:
              mode === "single"
                ? [state.activePanes[0] ?? defaultPane]
                : state.activePanes.length
                  ? state.activePanes
                  : defaultActivePanes,
          }) as Partial<Store>,
      ),

    setActivePanes: (panes) =>
      set({
        activePanes: panes.length ? panes : [defaultPane],
      } as Partial<Store>),

    togglePane: (pane) =>
      set(
        (state) => {
          const nextPanes = state.activePanes.includes(pane)
            ? state.activePanes.filter((activePane) => activePane !== pane)
            : [...state.activePanes, pane];

          return {
            activePanes: nextPanes.length ? nextPanes : [defaultPane],
          } as Partial<Store>;
        },
      ),

    showSinglePane: (pane) =>
      set({
        layoutMode: "single",
        activePanes: [pane],
      } as Partial<Store>),

    setRuntimeLanguages: (languages) =>
      set(
        (state) =>
          ({
            runtimeLanguages: languages,
            selectedRuntimeLanguage:
              state.selectedRuntimeLanguage &&
              languages.includes(state.selectedRuntimeLanguage)
                ? state.selectedRuntimeLanguage
                : languages[0] ?? null,
          }) as Partial<Store>,
      ),

    setSelectedRuntimeLanguage: (language) =>
      set({ selectedRuntimeLanguage: language } as Partial<Store>),
  });
}
