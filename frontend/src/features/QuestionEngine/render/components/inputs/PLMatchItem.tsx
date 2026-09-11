import type { ReactNode } from "react";

export type PLMatchItemProps = {
  left?: string;
  right?: string;
  seq?: string;
  dist?: string;
  comment?: string;
  children?: ReactNode;
};

export default function PLMatchItem({ children }: PLMatchItemProps) {
  return <>{children}</>;
}
