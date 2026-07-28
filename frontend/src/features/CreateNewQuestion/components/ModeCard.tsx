import type { IconType } from "react-icons";
import { IoIosCreate } from "react-icons/io";
import { LuLayoutTemplate } from "react-icons/lu";
import { MdOutlineUploadFile } from "react-icons/md";
import { SelectableInfoCard } from "../../../components/SelectableInfoCard";
import { useQuestionCreate } from "../instance";
import type { Mode } from "../instance";
import { SectionTitle, StepLabel } from "./ViewText";

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

export default function ModeCard({ mode }: { mode: Mode }) {
    const selectedMode = useQuestionCreate((s) => s.mode);
    const selectMode = useQuestionCreate((s) => s.setMode);
    const isSelected = selectedMode === mode;
    const { icon, title, description, iconClassName } = MODE_CARD_CONTENT[mode];

    return (
        <SelectableInfoCard
            title={title}
            description={description}
            icon={icon}
            iconClassName={iconClassName}
            isSelected={isSelected}
            onClick={() => selectMode(mode)}
        />
    );
}

export function ModeCardContainer() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <StepLabel>Step 1</StepLabel>
                <SectionTitle>Choose how to start</SectionTitle>
            </div>
            <div className="flex flex-row gap-5 ">
                <ModeCard mode={"blank"} />
                <ModeCard mode={"template"} />
                <ModeCard mode={"upload"} />
            </div>
        </div>
    );
}
