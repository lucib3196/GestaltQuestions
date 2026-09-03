import type { PropsWithChildren } from "react";

import { TableBaseProvider } from "../../TableBase/state";

export function QuestionTableStoreProvider({ children }: PropsWithChildren) {
  return <TableBaseProvider>{children}</TableBaseProvider>;
}
