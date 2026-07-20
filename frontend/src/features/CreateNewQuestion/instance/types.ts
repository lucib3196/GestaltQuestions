import type { QuestionMetadataFormValue } from "../../QuestionMetadata";
import type { Filenames } from "../constants/questionFiles";
import type { QuestionTemplateId } from "../constants/templateFiles";

export type Mode = "blank" | "template" | "upload";
export type CreateMode = "blank" | "upload";

export type QuestionCreationState = {
  mode: Mode;
  questionData: QuestionMetadataFormValue;
  selectedTemplate: QuestionTemplateId | null;
  files: string[]
  // OLD
  uploadedFiles: File[] | null;
  questionIsAdaptive: boolean;
  fileDrafts: Partial<Record<Filenames, string>>;
};

export type QuestionCreationActions = {
  setMode: (val: Mode) => void;
  setQuestionData: (payload: Partial<QuestionMetadataFormValue>) => void;
  resetQuestionData: () => void;
  setTemplate: (v: QuestionTemplateId) => void;

  setFiles: (files: string[])=>void
  addFile: (file: string)=>void
  removeFile: (file: string)=>void

  //Old


  setUploadedFiles: (files: File[]) => void;
  removeUploadedFile: (file: File) => void;
  removeUploadedFileByIndex: (index: number) => void;
  setIsAdaptive: (value: boolean) => void;
  setFileDraft: (filename: Filenames, content: string) => void;
};

export type QuestionCreationStore = QuestionCreationState &
  QuestionCreationActions;
