import type { StateCreator } from "zustand";

import type { TableStore } from "../types";
import type { AnyTableSchema } from "../../types";

export type TableSliceCreator<
  Schema extends AnyTableSchema = AnyTableSchema,
  Slice = unknown,
> = StateCreator<TableStore<Schema>, [], [], Slice>;
