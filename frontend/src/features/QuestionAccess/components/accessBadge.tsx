import type { AccessLevel } from "../../../services";

import { FaCrown } from "react-icons/fa6";
import { IoEye, IoShieldCheckmark } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import type { IconType } from "react-icons";

type AccessBadgeConfig = {
  icon: IconType;
  label: string;
  description: string;
};

const accessBadgeConfig: Record<AccessLevel, AccessBadgeConfig> = {
  view: {
    icon: IoEye,
    label: "View",
    description: "Can view the question but cannot make changes.",
  },
  edit: {
    icon: MdEdit,
    label: "Edit",
    description: "Can view and edit the question.",
  },
  full: {
    icon: IoShieldCheckmark,
    label: "Full",
    description: "Can view, edit, and delete the question.",
  },
  owner: {
    icon: FaCrown,
    label: "Owner",
    description: "Owns the question and has complete control.",
  },
};

export default function AccessBadge({ level }: { level: AccessLevel }) {
  // const [showDescription, setShowDescription] = useState<boolean>(false);
  const { icon: Icon, label, description } = accessBadgeConfig[level];

  return (
    <div className="relative">
      <span
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-secondary p-2 text-xs font-semibold text-text"
        title={description}
        aria-label={`${label}: ${description}`}
        // onMouseOver={() => setShowDescription(true)}
        // onMouseLeave={() => setShowDescription(false)}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      {/* {showDescription && <div className="top-0">{description}</div>} */}
    </div>
  );
}
