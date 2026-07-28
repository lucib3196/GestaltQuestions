import { ModeCard } from "../components/ModeCard";
import { SectionTitle, StepLabel } from "../components/ViewText";
import type { Mode } from "../instance";
import { useQuestionCreate } from "../instance";

const MODES: Mode[] = ["blank", "template", "upload"];

export function ModeSelectionSection() {
  const selectedMode = useQuestionCreate((s) => s.mode);
  const selectMode = useQuestionCreate((s) => s.setMode);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <StepLabel>Step 1</StepLabel>
        <SectionTitle>Choose how to start</SectionTitle>
      </div>
      <div className="flex flex-row gap-5">
        {MODES.map((mode) => (
          <ModeCard
            key={mode}
            mode={mode}
            isSelected={selectedMode === mode}
            onSelect={() => selectMode(mode)}
          />
        ))}
      </div>
    </div>
  );
}
