import type { UserRead } from "../../features/Auth/types";

export type UserId = string;

export type UserDetailRead = UserRead & {
  id: UserId;
};

export type DeveloperLookupParams = {
  query?: string | null;
  offset?: number | null;
  limit?: number | null;
};
