import { useMemo } from "react";

import type { FileData } from "../../../types/fileTypes";
import { getImageBase64FileData, isImageExt } from "../../../utils";

type ActiveFilePreview =
  | { type: "none" }
  | { type: "image"; url: string }
  | { type: "pdf"; url: string };

export function useActiveFilePreview(
  activeFile: FileData | null | undefined,
): ActiveFilePreview {
  return useMemo(() => {
    if (!activeFile) {
      return { type: "none" };
    }

    if (isImageExt(activeFile.filename)) {
      const url = getImageBase64FileData(activeFile);
      if (!url) {
        return { type: "none" };
      }

      return {
        type: "image",
        url,
      };
    }

    const isPdf =
      activeFile.filename.toLowerCase().endsWith(".pdf") ||
      activeFile.mime_type?.includes("pdf");

    if (isPdf) {
      return {
        type: "pdf",
        url: `data:${activeFile.mime_type || "application/pdf"};base64,${activeFile.content}`,
      };
    }

    return { type: "none" };
  }, [activeFile]);
}
