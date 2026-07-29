import type { IconType } from "react-icons";
import { LuCalculator, LuImage, LuShuffle } from "react-icons/lu";

import { SelectableInfoCard } from "../../../components/SelectableInfoCard";
import type { QuestionTemplate } from "../constants/templateFiles";

const TEMPLATE_CARD_STYLES: Record<
  QuestionTemplate["id"],
  {
    icon: IconType;
    iconClassName: string;
    className: string;
  }
> = {
  "static-question": {
    icon: LuCalculator,
    iconClassName: "bg-accent/10 text-accent",
    className: "min-h-28",
  },
  numerical: {
    icon: LuShuffle,
    iconClassName: "bg-accent-strong/10 text-accent-strong",
    className: "min-h-28",
  },
  "incline-plane-static": {
    icon: LuImage,
    iconClassName: "bg-surface-muted text-text-muted",
    className: "min-h-28",
  },
  "incline-plane-numeric": {
    icon: LuImage,
    iconClassName: "bg-accent/10 text-accent",
    className: "min-h-28",
  },
};

type TemplateCardProps = {
  template: QuestionTemplate;
  isSelected?: boolean;
  onClick?: () => void;
};

export function TemplateCard({
  template,
  isSelected = false,
  onClick,
}: TemplateCardProps) {
  const { icon, iconClassName, className } = TEMPLATE_CARD_STYLES[template.id];

  return (
    <SelectableInfoCard
      title={template.title}
      description={template.description}
      icon={icon}
      iconClassName={iconClassName}
      className={className}
      isSelected={isSelected}
      onClick={onClick}
    />
  );
}
