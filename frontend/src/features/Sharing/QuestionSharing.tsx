import { useState } from "react";

import type { ShareableAccessLevel } from "../../services";
import { ShareQuestionCard } from "./components";

export default function QuestionSharing() {
  const [accessLevel, setAccessLevel] = useState<ShareableAccessLevel>("view");

  return (
    <ShareQuestionCard
      accessLevel={accessLevel}
      onAccessLevelChange={setAccessLevel}
    />
  );
}
