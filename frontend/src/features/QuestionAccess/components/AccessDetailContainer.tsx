import type { AccessDetailVariant } from "../../../components/Access";
import { useListSharedByMe } from "../../../services/Access/QuestionAccess";
import { AccessDetailList } from "./AccessDetailList";

type AccessDetailContainerProps = {
  qid: string | null;
  loading?: boolean;
  variant?: AccessDetailVariant;
};

export function AccessDetailContainer({
  qid,
  loading = false,
  variant = "panel",
}: AccessDetailContainerProps) {
  if (!qid) return null;

  return (
    <AccessDetailContainerContent
      qid={qid}
      loading={loading}
      variant={variant}
    />
  );
}

function AccessDetailContainerContent({
  qid,
  loading = false,
  variant = "panel",
}: AccessDetailContainerProps & { qid: string }) {
  const {
    access: detailRead,
    loading: detailsLoading,
    error: detailsError,
    refresh,
  } = useListSharedByMe(qid);

  return (
    <AccessDetailList
      qid={qid}
      access={detailRead}
      loading={loading || detailsLoading}
      error={detailsError}
      variant={variant}
      onAccessChanged={refresh}
    />
  );
}
