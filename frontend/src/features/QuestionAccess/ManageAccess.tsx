import clsx from "clsx";
import { useMemo } from "react";

import {
  type AccessDetailVariant,
  AccessHeader,
} from "../../components/Access";
import {
  useListSharedByMe,
  useRetrieveAccess,
} from "../../services/Access/QuestionAccess";
import type { UserLookupVariant } from "../UserLookUp/UserLookUp";
import { AccessDetailList } from "./components/AccessDetailList";
import {
  QuestionInvitation,
  type QuestionInvitationVariant,
} from "./components/Invitation";

const manageAccessStyles = {
  panel: {
    section:
      "w-full max-w-3xl rounded-md border border-border bg-surface p-5 text-text",
    layout: "grid gap-4",
    invitation: "panel",
    accessDetail: "embedded",
    lookup: "embedded",
    order: "access-first",
  },
  streamlined: {
    section:
      "w-full max-w-4xl rounded-md border border-border bg-surface p-5 text-text",
    layout: "grid gap-4",
    invitation: "inline",
    accessDetail: "compact",
    lookup: "compact",
    order: "invite-first",
  },
  compact: {
    section:
      "w-full max-w-xl rounded-md border border-border bg-surface p-4 text-text",
    layout: "grid gap-3",
    invitation: "compact",
    accessDetail: "compact",
    lookup: "compact",
    order: "invite-first",
  },
} as const satisfies Record<
  string,
  {
    section: string;
    layout: string;
    invitation: QuestionInvitationVariant;
    accessDetail: AccessDetailVariant;
    lookup: UserLookupVariant;
    order: "access-first" | "invite-first";
  }
>;

export type ManageAccessVariant = keyof typeof manageAccessStyles;

type ManageAccessProps = {
  qid: string;
  variant?: ManageAccessVariant;
  className?: string;
};

export function ManageAccess({
  qid,
  variant = "panel",
  className,
}: ManageAccessProps) {
  const styles = manageAccessStyles[variant];
  const { access } = useRetrieveAccess(qid);
  const {
    access: sharedAccess,
    loading: sharedAccessLoading,
    error: sharedAccessError,
    refresh: refreshSharedAccess,
  } = useListSharedByMe(qid);
  const excludedDeveloperIds = useMemo(
    () => sharedAccess.map((accessDetail) => accessDetail.developer_id),
    [sharedAccess],
  );

  if (!access) {
    return (
      <section className={clsx(styles.section, className)}>
        Loading access...
      </section>
    );
  }

  const invitation = (
    <QuestionInvitation
      qid={qid}
      excludedDeveloperIds={excludedDeveloperIds}
      variant={styles.invitation}
      lookupVariant={styles.lookup}
      onShared={refreshSharedAccess}
    />
  );
  const accessDetail = (
    <AccessDetailList
      qid={qid}
      access={sharedAccess}
      loading={sharedAccessLoading}
      error={sharedAccessError}
      variant={styles.accessDetail}
      onAccessChanged={refreshSharedAccess}
    />
  );

  return (
    <section className={clsx(styles.section, className)}>
      <AccessHeader />

      <div className={styles.layout}>
        {styles.order === "invite-first" ? invitation : accessDetail}
        {styles.order === "invite-first" ? accessDetail : invitation}
      </div>
    </section>
  );
}
