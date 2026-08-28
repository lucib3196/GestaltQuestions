import clsx from "clsx";
import type React from "react";
import type { IconType } from "react-icons";
import { FiFileText, FiTarget } from "react-icons/fi";

import type { QuestionRead } from "../../QuestionBuilder";
import type { QuestionBodyVariant } from "../question/QuestionBody";

type QuestionHeaderProps = {
  qdata: QuestionRead | null | undefined;
  topicIcon?: IconType | null;
  variant?: QuestionBodyVariant;
};

const headerVariantStyles: Record<QuestionBodyVariant, string> = {
  default: "mb-5 gap-3",
  compact: "mb-3 gap-2",
  flush: "mb-3 gap-2",
  centered: "mb-5 gap-3",
};

const titleVariantStyles: Record<QuestionBodyVariant, string> = {
  default: "text-2xl",
  compact: "text-xl",
  flush: "text-xl",
  centered: "text-2xl",
};

function MetadataChip({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: IconType | null;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-secondary px-2.5 py-1.5 text-xs font-medium text-text-muted">
      {Icon ? <Icon className="size-3.5 text-accent" /> : null}
      {children}
    </span>
  );
}

export default function QuestionHeader({
  qdata,
  topicIcon: TopicIcon = null,
  variant = "compact",
}: QuestionHeaderProps) {
  return (
    <header className={clsx("flex flex-col", headerVariantStyles[variant])}>
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-md bg-accent/15 text-accent">
          <FiTarget className="size-4" />
        </span>
        <h1
          className={clsx(
            "font-semibold leading-tight text-text",
            titleVariantStyles[variant],
          )}
        >
          {qdata?.title ?? "Untitled question"}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        Topics: {qdata?.topics?.map((topic) => (
          <MetadataChip key={topic} icon={TopicIcon}>
            {topic}
          </MetadataChip>
        ))}

        {qdata?.qType?.length ? (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted">
            <FiFileText className="size-3.5 text-accent" />
            Question Type:
          </span>
        ) : null}

        {qdata?.qType?.map((qType) => (
          <MetadataChip key={qType}>{qType}</MetadataChip>
        ))}
      </div>
    </header>
  );
}
