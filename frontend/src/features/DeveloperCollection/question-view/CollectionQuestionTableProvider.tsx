import type { ReactNode } from "react";

import { TableBaseProvider } from "../../TableBase";
import {
  type CollectionQuestionSchema,
  collectionQuestionTableConfig,
} from "./collectionQuestionTableConfig";

export function CollectionQuestionTableProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TableBaseProvider<CollectionQuestionSchema>
      persistKey={collectionQuestionTableConfig.persistKey}
    >
      {children}
    </TableBaseProvider>
  );
}
