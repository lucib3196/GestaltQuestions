import type { StateCreator } from "zustand";

import type {
  QuestionEditorPane,
  QuestionEditorSettingsStore,
} from "../../features/QuestionEditor/store/types";

const defaultPane: QuestionEditorPane = "livePreview";
const defaultActivePanes: QuestionEditorPane[] = [
  "livePreview",
  "editor",
  "metadata",
];

export type QuestionEditorSettingsSliceCreator<
  Store extends QuestionEditorSettingsStore = QuestionEditorSettingsStore,
  Slice = QuestionEditorSettingsStore,
> = StateCreator<Store, [], [], Slice>;
export function createQuestionEditorSettingsSlice<
  Store extends QuestionEditorSettingsStore = QuestionEditorSettingsStore,
>(): QuestionEditorSettingsSliceCreator<Store, QuestionEditorSettingsStore> {
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
