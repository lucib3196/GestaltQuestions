import type { StateCreator } from "zustand";

import type { TableStore } from "../types";

export type TableSliceCreator<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
  Slice = unknown,
> = StateCreator<TableStore<Row, VirtualKey, Query>, [], [], Slice>;
