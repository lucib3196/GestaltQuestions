import { SelectedFiles } from "../SelectedFiles";

type ShowUploadedFilesVariant = "default" | "editorPanel";

export default function ShowUploadedFiles({
  files,
  onRemove,
  message,
}: {
  files: File[];
  onRemove: (index: number) => void;
  onSubmit?: () => void;
  variant?: ShowUploadedFilesVariant;
  message?: string;
}) {
  return <SelectedFiles files={files} onRemove={onRemove} message={message} />;
}
