import { Header } from "../../components/Header";
import Divider from "../../components/Divider/Divider";
import { Section } from "../../components/Section";

import ModeToggle from "./ModeToggle";
import { useCreateMode } from "./context";
import { CreateQuestionFromBlank } from "./components/CreateQuestionFromBlank";
import type { CreateMode } from "./types";
import UploadZipQuestionModal from "./components/UploadQuestionZip";


const MODE_COMPONENTS: Partial<Record<CreateMode, React.ReactNode>> = {
  blank: <CreateQuestionFromBlank />,
  upload: <UploadZipQuestionModal setShowModal={() => {}} />,

};

export default function CreateQuestion() {
  const { mode } = useCreateMode();

  return (
    <Section variant="questionBuilder" id="create-question" className="gap-3">
      <Header
        variant="QuestionBuilder"
        title="Create Question"
        className="flex flex-row justify-between"
      />
      <Divider />
      <ModeToggle />

      {MODE_COMPONENTS[mode]}
    </Section>
  );
}
