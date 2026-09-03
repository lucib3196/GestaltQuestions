import type { RowId } from "../../TableBase";
import type { PartialQuery, AnyTableSchema } from "../../TableBase";
export type TableProps<Schema extends AnyTableSchema = AnyTableSchema> = {
  onRowSelect?: (_rowId: RowId) => void;
  baseQuery?: PartialQuery<Schema>;
};
