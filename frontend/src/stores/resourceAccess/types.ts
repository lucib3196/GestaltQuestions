import type { AccessLevel } from "../../services/Access";

export type BaseResourceAccessModel = {
  access_level: AccessLevel;
};

export type ResourceAccessSchema<
  ResourceAccessModelT extends BaseResourceAccessModel =
    BaseResourceAccessModel,
  ActionT extends string = string,
> = {
  access: ResourceAccessModelT;
  capabilities: Record<ActionT, boolean>;
};

export type AnyResourceSchema = ResourceAccessSchema;
export type AccessModel<Schema extends AnyResourceSchema> = Schema["access"];
export type Capabilities<Schema extends AnyResourceSchema> =
  Schema["capabilities"];
