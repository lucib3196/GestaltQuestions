import { useCallback, useEffect, useState } from "react";

import type { FileData } from "../../../types/fileTypes";

export function useEditableQuestionFiles(sourceFiles: FileData[]) {
  const [files, setFiles] = useState<FileData[]>([]);

  useEffect(() => {
    setFiles(sourceFiles);
  }, [sourceFiles]);

  const updateFileContent = useCallback((filename: string, content: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.filename === filename ? { ...file, content } : file,
      ),
    );
  }, []);

  return {
    files,
    setFiles,
    updateFileContent,
  };
}
