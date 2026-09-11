import clsx from "clsx";
import type React from "react";
import { FaPython } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { MdBolt } from "react-icons/md";

import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";

export type RuntimeToggleValue = QuestionRuntimeLanguage;

type RuntimeToggleProps = {
  value: RuntimeToggleValue | null;
  options?: RuntimeToggleValue[];
  // eslint-disable-next-line no-unused-vars
  onChange: (next: RuntimeToggleValue) => void;
};

const fallbackOptions: RuntimeToggleValue[] = ["javascript", "python"];

const runtimeMeta: Record<
  RuntimeToggleValue,
  {
    label: string;
    icon: React.ReactNode;
  }
> = {
  javascript: {
    label: "JavaScript",
    icon: <IoLogoJavascript className="h-4 w-4" />,
  },
  python: {
    label: "Python",
    icon: <FaPython className="h-4 w-4" />,
  },
  static: {
    label: "Static",
    icon: <MdBolt className="h-4 w-4" />,
  },
};

export function RuntimeToggle({
  value,
  options = fallbackOptions,
  onChange,
}: RuntimeToggleProps) {
  const runtimeOptions = options.length ? options : fallbackOptions;
  const selectedValue = value ?? runtimeOptions[0];

  return (
    <div className="flex min-w-fit items-center gap-2">
      <span className="text-xs font-semibold uppercase text-text-soft">
        Runtime
      </span>

      <div className="inline-flex h-9 items-center gap-1 rounded-md bg-surface-muted p-1">
        {runtimeOptions.map((runtime) => {
          const active = runtime === selectedValue;
          const meta = runtimeMeta[runtime] ?? {
            label: runtime,
            icon: <MdBolt className="h-4 w-4" />,
          };

          return (
            <button
              key={runtime}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(runtime)}
              className={clsx(
                "inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-surface-strong text-accent shadow-sm"
                  : "text-text-muted hover:bg-surface-secondary hover:text-text",
              )}
            >
              {meta.icon}
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
