/* eslint-disable no-unused-vars */
import type { QuestionMetadataFormValue } from "../../QuestionMetadata";
import type { QuestionTemplateId } from "../constants/templateFiles";

export type Mode = "blank" | "template" | "upload";
export type CreateMode = "blank" | "upload";

export type QuestionCreationState = {
  mode: Mode;
  questionData: QuestionMetadataFormValue;
  selectedTemplate: QuestionTemplateId | null;

  files: globalThis.File[];
};

export type QuestionCreationActions = {
  // General mode
  setMode(val: Mode): void;
  // Question data specific
  setQuestionData(payload: Partial<QuestionMetadataFormValue>): void;
  resetQuestionData(): void;

  // Template logic
  setTemplate(v: QuestionTemplateId): void;

  // Handle file properties
  addFile(file: globalThis.File): void;
  removeFileByName(filename: string): void;
  removeFileByIndex(index: number): void;
  clearFiles(): void;
};

export type QuestionCreationStore = QuestionCreationState &
  QuestionCreationActions;
