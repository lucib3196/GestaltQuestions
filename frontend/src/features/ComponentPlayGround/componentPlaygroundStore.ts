import { create } from "zustand";

import type { ValidComponents } from "../QuestionEngine";
import {
  findPlaygroundComponent,
  getDefaultPlaygroundValues,
  PLAYGROUND_COMPONENTS,
  type PlaygroundAttributeValue,
  type PlaygroundAttributeValues,
} from "./componentPlaygroundRegistry";
import { buildPlaygroundMarkup } from "./playgroundMarkup";

export type PlaygroundTab =
  | "configure"
  | "variants"
  | "code"
  | "props"
  | "accessibility";

export type PlaygroundPreviewMode = "component" | "question";

export const PLAYGROUND_TABS: {
  key: PlaygroundTab;
  label: string;
}[] = [
  { key: "configure", label: "Configure" },
  { key: "variants", label: "Variants" },
  { key: "code", label: "Code" },
  { key: "props", label: "Props" },
  { key: "accessibility", label: "Accessibility" },
];

type ComponentPlaygroundState = {
  selectedTag: ValidComponents;
  activeTab: PlaygroundTab;
  previewMode: PlaygroundPreviewMode;
  searchQuery: string;
  selectedPresetName: string;
  attributeValues: PlaygroundAttributeValues;
  childrenValue: string;
  editorValue: string;
  setActiveTab: (tab: PlaygroundTab) => void;
  setPreviewMode: (mode: PlaygroundPreviewMode) => void;
  setSearchQuery: (query: string) => void;
  selectComponent: (tag: ValidComponents) => void;
  applyPreset: (name: string) => void;
  setAttributeValue: (prop: string, value: PlaygroundAttributeValue) => void;
  setChildrenValue: (value: string) => void;
  setEditorValue: (value: string) => void;
  resetGeneratedMarkup: () => void;
};

function getInitialComponentState(tag: ValidComponents) {
  const component = findPlaygroundComponent(tag);
  const preset = component.presets[0];
  const attributeValues = getDefaultPlaygroundValues(component, preset);
  const childrenValue = preset?.children ?? component.defaultChildren ?? "";

  return {
    selectedTag: component.tag,
    selectedPresetName: preset?.name ?? "Custom",
    attributeValues,
    childrenValue,
    editorValue: buildPlaygroundMarkup(
      component,
      attributeValues,
      childrenValue,
    ),
  };
}

const firstComponent = PLAYGROUND_COMPONENTS[0];
const initialComponentState = getInitialComponentState(firstComponent.tag);

export const useComponentPlaygroundStore = create<ComponentPlaygroundState>(
  (set) => ({
    ...initialComponentState,
    activeTab: "configure",
    previewMode: "component",
    searchQuery: "",
    setActiveTab: (activeTab) => set({ activeTab }),
    setPreviewMode: (previewMode) => set({ previewMode }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    selectComponent: (tag) =>
      set({
        ...getInitialComponentState(tag),
        activeTab: "configure",
      }),
    applyPreset: (name) =>
      set((state) => {
        const component = findPlaygroundComponent(state.selectedTag);
        const preset = component.presets.find((item) => item.name === name);
        const attributeValues = getDefaultPlaygroundValues(component, preset);
        const childrenValue =
          preset?.children ?? component.defaultChildren ?? state.childrenValue;

        return {
          selectedPresetName: preset?.name ?? "Custom",
          attributeValues,
          childrenValue,
          editorValue: buildPlaygroundMarkup(
            component,
            attributeValues,
            childrenValue,
          ),
        };
      }),
    setAttributeValue: (prop, value) =>
      set((state) => {
        const component = findPlaygroundComponent(state.selectedTag);
        const attributeValues = {
          ...state.attributeValues,
          [prop]: value,
        };

        return {
          selectedPresetName: "Custom",
          attributeValues,
          editorValue: buildPlaygroundMarkup(
            component,
            attributeValues,
            state.childrenValue,
          ),
        };
      }),
    setChildrenValue: (childrenValue) =>
      set((state) => {
        const component = findPlaygroundComponent(state.selectedTag);

        return {
          selectedPresetName: "Custom",
          childrenValue,
          editorValue: buildPlaygroundMarkup(
            component,
            state.attributeValues,
            childrenValue,
          ),
        };
      }),
    setEditorValue: (editorValue) =>
      set({
        selectedPresetName: "Custom",
        editorValue,
      }),
    resetGeneratedMarkup: () =>
      set((state) => {
        const component = findPlaygroundComponent(state.selectedTag);

        return {
          editorValue: buildPlaygroundMarkup(
            component,
            state.attributeValues,
            state.childrenValue,
          ),
        };
      }),
  }),
);
