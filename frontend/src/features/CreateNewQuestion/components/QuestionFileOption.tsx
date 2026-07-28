import { Checkbox } from "@mui/material";
import { useEffect } from "react";
import { MdCode } from "react-icons/md";

import type { QuestionFileSpec } from "../constants/questionFiles";
import { useQuestionCreate } from "../instance";
import { questionFileSpecToFile } from "../utils/fileConversion";
import { FileIcon } from "./FileIcon";

type QuestionFileOptionProps = {
  spec: QuestionFileSpec;
};

export function QuestionFileOption({ spec }: QuestionFileOptionProps) {
  const files = useQuestionCreate((s) => s.files);
  const questionIsAdaptive = useQuestionCreate(
    (s) => s.questionData.isAdaptive,
  );
  const add = useQuestionCreate((s) => s.addFile);
  const remove = useQuestionCreate((s) => s.removeFileByName);

  // Check the current file array to see if file is present
  const adaptiveRequired = questionIsAdaptive && spec.isAdaptive;
  const shouldBeRequired = spec.required || adaptiveRequired;
  const isIncluded = files.some((file) => file.name === spec.filename);
  const isChecked = shouldBeRequired || isIncluded;

  useEffect(() => {
    if (shouldBeRequired && !isIncluded) {
      add(questionFileSpecToFile(spec));
    }
  }, [add, isIncluded, shouldBeRequired, spec]);

  const handleChange = (event: { target: { checked: boolean } }) => {
    const checked = event.target.checked;

    if (checked) {
      add(questionFileSpecToFile(spec));
    } else {
      remove(spec.filename);
    }
  };

  return (
    <div className="flex min-h-18 items-center gap-4 rounded-xl border border-border bg-surface-strong/60 px-4 py-3 transition hover:border-border-strong">
      <Checkbox
        value={spec.filename}
        checked={isChecked}
        onChange={handleChange}
        className="shrink-0"
      />

      <div className="shrink-0">
        <FileIcon filename={spec.filename} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-text">
            {spec.filename}
          </span>

          {spec.required && (
            <span className="rounded-full border border-accent-strong/35 bg-accent-strong/15 px-2 py-0.5 text-[11px] font-semibold text-accent-strong">
              required
            </span>
          )}

          {!spec.required && adaptiveRequired && (
            <span className="rounded-full border border-accent/35 bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
              required when adaptive
            </span>
          )}
        </div>

        <p className="text-sm text-text-muted">{spec.description}</p>
      </div>

      <MdCode className="shrink-0 text-text-soft" size={22} />
    </div>
  );
}
