import type { QuestionFileSpec } from "../constants/questionFiles";
import type { QuestionTemplateFile } from "../constants/templateFiles";

export async function assetURLToFile(
  url: string,
  filename: string,
  mimeType: string,
) {
  const response = await globalThis.fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load ${filename}`);
  }
  const blob = await response.blob();

  return new globalThis.File([blob], filename, { type: mimeType });
}
export function questionFileSpecToFile(spec: QuestionFileSpec) {
  return new globalThis.File([spec.content], spec.filename, {
    type: spec.mimeType,
  });
}

export async function questionTemplateFileToFile(
  templateFile: QuestionTemplateFile,
) {
  if (templateFile.assetUrl) {
    const file = await assetURLToFile(
      templateFile.assetUrl,
      templateFile.filename,
      templateFile.mimeType,
    );
    return file;
  }

  return new globalThis.File(
    [templateFile.content ?? ""],
    templateFile.filename,
    {
      type: templateFile.mimeType,
    },
  );
}
