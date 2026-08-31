import type { PropsWithChildren } from "react";

import { QuestionTableProvider } from "../state/context";

export function QuestionTableStoreProvider({ children }: PropsWithChildren) {
  return (
    <QuestionTableProvider
      initialState={{
        limit: 25,
      }}
    >
      {children}
    </QuestionTableProvider>
  );
}
