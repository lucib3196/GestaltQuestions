import { useEffect, useState } from "react";

import type { FileData } from "../../../types/fileTypes";

export function useActiveQuestionFile(files: FileData[]) {
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!files.length) {
      setActiveFile(null);
      setLoading(false);
      return;
    }

    setActiveFile((current) => {
      if (current && files.some((file) => file.filename === current.filename)) {
        return (
          files.find((file) => file.filename === current.filename) ?? current
        );
      }

      return files[0];
    });

    setLoading(false);
  }, [files]);

  return {
    activeFile,
    setActiveFile,
    loading,
  };
}
