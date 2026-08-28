import { useEffect, useState } from "react";

import { questionAPIURL } from "../../../config/apiConfig";
import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import { QuestionRuntimeApi } from "../../../services/QuestionRuntime";
import { useQuestionInstance } from "../instance";

export function useRunQuestion(
  questionID: string,
  serverMode: QuestionRuntimeLanguage | null,
  refreshKey?: number,
) {
  const setRunTimeContent = useQuestionInstance((s) => s.setRunTimeContent);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await QuestionRuntimeApi.runQuestion(
          questionID,
          serverMode,
        );

        if (!cancelled) {
          setRunTimeContent(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [questionID, serverMode, refreshKey, setRunTimeContent]);

  return {
    error,
    loading,
  };
}
export function useQuestionFigure(src: string, baseStorage?: string) {
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const normalizedBase = baseStorage?.replace(/\/+$/, "") ?? "";
    const normalizedSrc = src.replace(/^\/+|\/+$/g, "");

    if (!normalizedBase || !normalizedSrc) {
      setImage("");
      return;
    }

    const resolvedSrc = `${normalizedBase}/${normalizedSrc}`;
    const imageUrl = `${questionAPIURL}/images/firebase-data-url?path=${encodeURIComponent(resolvedSrc)}`;

    const load = async () => {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        const data = (await response.json()) as { src?: string };
        if (!cancelled) {
          setImage(data.src ?? "");
        }
      } catch {
        if (!cancelled) {
          setImage("");
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [src, baseStorage]);

  return { image };
}
