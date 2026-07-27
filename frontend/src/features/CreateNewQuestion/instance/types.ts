/* eslint-disable no-unused-vars */
import type { QuestionMetadataFormValue } from "../../QuestionMetadata";
import type { Filenames } from "../constants/questionFiles";
import type { QuestionTemplateId } from "../constants/templateFiles";

export type Mode = "blank" | "template" | "upload";
export type CreateMode = "blank" | "upload";

export type QuestionCreationState = {
  mode: Mode;
  questionData: QuestionMetadataFormValue;
  selectedTemplate: QuestionTemplateId | null;
  files: string[];


  uploadedFiles: globalThis.File[] | null;
  questionIsAdaptive: boolean;
  fileDrafts: Partial<Record<Filenames, string>>;
};

export type QuestionCreationActions = {
  setMode(val: Mode): void;
  setQuestionData(payload: Partial<QuestionMetadataFormValue>): void;
  resetQuestionData(): void;
  setTemplate(v: QuestionTemplateId): void;

  // Just handles the the filenames
  setFiles(files: string[]): void;
  addFile(file: string): void;
  removeFile(file: string): void;

  // Handles the uploaded files

  setUploadedFiles(files: globalThis.File[]): void;
  removeUploadedFile(file: globalThis.File): void;
  removeUploadedFileByIndex(index: number): void;
  setIsAdaptive(value: boolean): void;
  setFileDraft(filename: Filenames, content: string): void;
};

export type QuestionCreationStore = QuestionCreationState &
  QuestionCreationActions;
