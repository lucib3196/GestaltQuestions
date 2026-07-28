import {
  DefaultQuestionFiles,
  type Filename,
} from "../constants/questionFiles";

export type FileStatus = "valid" | "custom";

export const knownQuestionFiles = new Map(
  DefaultQuestionFiles.map((file) => [file.filename, file]),
);

export function getFileStatus(file: File): FileStatus {
  return knownQuestionFiles.has(file.name as Filename) ? "valid" : "custom";
}

export function getKnownQuestionFile(file: File) {
  return knownQuestionFiles.get(file.name as Filename);
}

export function hasQuestionHtml(files: File[]) {
  return files.some((file) => file.name === "question.html");
}

export function getValidQuestionFileCount(files: File[]) {
  return files.filter((file) => getFileStatus(file) === "valid").length;
}
