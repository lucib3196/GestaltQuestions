import { TemplateCard } from "../components/TemplateCard";
import type { QuestionTemplate } from "../constants/templateFiles";
import { QuestionTemplates } from "../constants/templateFiles";
import { useQuestionCreate } from "../instance";
import { questionTemplateFileToFile } from "../utils/fileConversion";

export function TemplateSelectionSection() {
  const selectedTemplate = useQuestionCreate((s) => s.selectedTemplate);
  const setTemplate = useQuestionCreate((s) => s.setTemplate);
  const setQuestionData = useQuestionCreate((s) => s.setQuestionData);
  const addFile = useQuestionCreate((s) => s.addFile);
  const clearFiles = useQuestionCreate((s) => s.clearFiles);

  const handleSelect = async (template: QuestionTemplate) => {
    clearFiles();
    setTemplate(template.id);
    setQuestionData(template.questionData);

    const files = await Promise.all(
      template.files.map((file) => questionTemplateFileToFile(file)),
    );

    files.forEach(addFile);
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
