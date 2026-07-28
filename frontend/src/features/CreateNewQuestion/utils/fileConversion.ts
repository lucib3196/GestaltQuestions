import type { QuestionFileSpec } from "../constants/questionFiles";
import type { QuestionTemplateFile } from "../constants/templateFiles";

export function questionFileSpecToFile(spec: QuestionFileSpec): File {
  return new globalThis.File([spec.content], spec.filename, {
    type: spec.mimeType,
  });
}

export function questionTemplateFileToFile(
  templateFile: QuestionTemplateFile,
): File {
  return new globalThis.File([templateFile.content], templateFile.filename, {
    type: templateFile.mimeType,
  });
}
