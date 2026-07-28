import type { IconType } from "react-icons";
import { IoIosCreate } from "react-icons/io";
import { LuLayoutTemplate } from "react-icons/lu";
import { MdOutlineUploadFile } from "react-icons/md";

import { SelectableInfoCard } from "../../../components/SelectableInfoCard";
import type { Mode } from "../instance";

const MODE_CARD_CONTENT: Record<
  Mode,
  {
    icon: IconType;
    title: string;
    description: string;
    iconClassName: string;
  }
> = {
  blank: {
    icon: IoIosCreate,
    title: "Blank",
    description: "Start from an empty question.",
    iconClassName: "bg-accent/10 text-accent",
  },
  template: {
    icon: LuLayoutTemplate,
    title: "Template",
    description: "Use a starter template.",
    iconClassName: "bg-accent-strong/10 text-accent-strong",
  },
  upload: {
    icon: MdOutlineUploadFile,
    title: "Upload",
    description: "Create from uploaded files.",
    iconClassName: "bg-surface-muted text-text-muted",
  },
};

type ModeCardProps = {
  mode: Mode;
  isSelected: boolean;
  onSelect: () => void;
};

export function ModeCard({ mode, isSelected, onSelect }: ModeCardProps) {
  const { icon, title, description, iconClassName } = MODE_CARD_CONTENT[mode];

  return (
    <SelectableInfoCard
      title={title}
      description={description}
      icon={icon}
      iconClassName={iconClassName}
      isSelected={isSelected}
      onClick={onSelect}
    />
  );
}
