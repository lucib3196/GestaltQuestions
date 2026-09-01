import type { PropsWithChildren } from "react";

import { QuestionTableProvider } from "../state/context";

export function QuestionTableStoreProvider({ children }: PropsWithChildren) {
  return (
    <QuestionTableProvider
     
    >
      {children}
    </QuestionTableProvider>
  );
}
