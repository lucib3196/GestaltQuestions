import type { StateCreator } from "zustand";

import type {
  WorkspacePane,
  WorkspaceSettingStore,
} from "../../features/QuestionWorkspace/store/types";

const defaultPane: WorkspacePane = "livePreview";
const defaultActivePanes: WorkspacePane[] = [
  "livePreview",
  "editor",
  "metadata",
];

export type WorkspaceSettingSliceCreator<
  Store extends WorkspaceSettingStore = WorkspaceSettingStore,
  Slice = WorkspaceSettingStore,
> = StateCreator<Store, [], [], Slice>;
export function createWorkspaceSettingsSlice<
  Store extends WorkspaceSettingStore = WorkspaceSettingStore,
>(): WorkspaceSettingSliceCreator<Store, WorkspaceSettingStore> {
  return (set) => ({
    layoutMode: "split",
    activePanes: defaultActivePanes,
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
      set((state) => {
        const nextPanes = state.activePanes.includes(pane)
          ? state.activePanes.filter((activePane) => activePane !== pane)
          : [...state.activePanes, pane];

        return {
          activePanes: nextPanes.length ? nextPanes : [defaultPane],
        } as Partial<Store>;
      }),

    showSinglePane: (pane) =>
      set({
        layoutMode: "single",
        activePanes: [pane],
      } as Partial<Store>),
  });
}
