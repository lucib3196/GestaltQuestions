import type { StateCreator } from "zustand";

import type { AnyTableSchema } from "../../types";
import type { TableStore } from "../types";

export type TableSliceCreator<
  Schema extends AnyTableSchema = AnyTableSchema,
  Slice = unknown,
> = StateCreator<TableStore<Schema>, [], [], Slice>;
