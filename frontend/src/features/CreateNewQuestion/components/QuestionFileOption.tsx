import { Checkbox } from "@mui/material";
import { useEffect } from "react";

import type { Filenames, QuestionFileSpec } from "../constants/questionFiles";
import { useQuestionCreate } from "../instance";

type QuestionFileOptionProps = Pick<
  QuestionFileSpec,
  "filename" | "required" | "isAdaptive" | "description"
>;

export function QuestionFileOption({
  filename,
  required,
  isAdaptive,
  description,
}: QuestionFileOptionProps) {
  const selectedFiles = useQuestionCreate((s) => s.files);
  const questionIsAdaptive = useQuestionCreate(
    (s) => s.questionData.isAdaptive,
  );
  const add = useQuestionCreate((s) => s.addFile);
  const remove = useQuestionCreate((s) => s.removeFile);

  const adaptiveRequired = questionIsAdaptive && isAdaptive;
  const isChecked =
    required || adaptiveRequired || selectedFiles.includes(filename);

  useEffect(() => {
    if (required && !selectedFiles.includes(filename)) {
      add(filename);
    }
  }, [add, filename, required, selectedFiles]);

  const handleChange = (event: {
    target: { value: string; checked: boolean };
  }) => {
    const value = event.target.value as Filenames;
    const checked = event.target.checked;
    checked ? add(value) : remove(value);
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3 py-2 transition hover:border-border-strong">
      <Checkbox
        value={filename}
        checked={isChecked}
        onChange={handleChange}
        className="mt-0.5"
      />

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-text">
            {filename}
          </span>

          {required && (
            <span className="rounded-full border border-accent-strong/35 bg-accent-strong/15 px-2 py-0.5 text-[11px] font-semibold text-accent-strong">
              required
            </span>
          )}

          {!required && adaptiveRequired && (
            <span className="rounded-full border border-accent/35 bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
              required when adaptive
            </span>
          )}
        </div>

        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </div>
  );
}
