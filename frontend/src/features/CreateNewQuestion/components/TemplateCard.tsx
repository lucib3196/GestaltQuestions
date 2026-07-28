import { SelectableInfoCard } from "../../../components/SelectableInfoCard";
import { QuestionTemplates } from "../constants/templateFiles";
import type { QuestionTemplate } from "../constants/templateFiles";
import { useQuestionCreate } from "../instance";
import type { IconType } from "react-icons";
import { LuCalculator, LuImage, LuShuffle } from "react-icons/lu";
import { questionTemplateFileToFile } from "../utils/fileConversion";
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
  "image-question": {
    icon: LuImage,
    iconClassName: "bg-surface-muted text-text-muted",
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

export function TemplateCardContainer() {
  const selectedTemplate = useQuestionCreate((s) => s.selectedTemplate);
  const setTemplate = useQuestionCreate((s) => s.setTemplate);
  const setQuestionData = useQuestionCreate((s) => s.setQuestionData);
  const addFile = useQuestionCreate((s) => s.addFile);
  const clearFiles = useQuestionCreate((s) => s.clearFiles);

  const handleSelect = (template: QuestionTemplate) => {
    clearFiles();
    setTemplate(template.id);
    setQuestionData(template.questionData);
    template.files.map((f) => {
      addFile(questionTemplateFileToFile(f));
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {QuestionTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => handleSelect(template)}
          isSelected={selectedTemplate === template.id}
        />
      ))}
    </div>
  );
}
