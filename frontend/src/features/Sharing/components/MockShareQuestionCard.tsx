import { useState } from "react";

import type { ShareableAccessLevel } from "../../../services";
import { UserLookupProvider } from "../../UserLookUp/instance/context";
import { ShareQuestionCard } from "./ShareQuestionCard";

export function MockShareQuestionCard() {
  const [accessLevel, setAccessLevel] = useState<ShareableAccessLevel>("view");

  return (
    <UserLookupProvider>
      <ShareQuestionCard
        accessLevel={accessLevel}
        onAccessLevelChange={setAccessLevel}
        questionPreview={
          <div>
            <h3 className="text-sm font-semibold">Add Numbers Adaptive</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Create a function that takes two numbers as arguments and returns
              their sum.
            </p>
          </div>
        }
      />
    </UserLookupProvider>
  );
}
