import type {
  ResourceAccessSchema,
  AnyResourceSchema,
  Capabilities,
  AccessModel,
} from "./types";


export type ResourceAccessState<
  Schema extends ResourceAccessSchema = AnyResourceSchema,
> = {
  access: AccessModel<Schema> | null;
  capabilities: Capabilities<Schema>;
};

export type ResourceAccessActions<
  Schema extends ResourceAccessSchema = AnyResourceSchema,
> = {
  setAccess: (access: AccessModel<Schema>) => void;
  setCapabilities: (cap: Capabilities<Schema>) => void;
};

export type ResourceAccessStore<
  Schema extends ResourceAccessSchema = AnyResourceSchema,
> = ResourceAccessState<Schema> & ResourceAccessActions<Schema>;
