import { Button } from "../Button";
import { SelectedFiles } from "../SelectedFiles";

type ShowUploadedFilesVariant = "default" | "editorPanel";

export default function ShowUploadedFiles({
  files,
  onRemove,
  onSubmit,
  message,
}: {
  files: File[];
  onRemove: (index: number) => void;
  onSubmit?: () => void;
  variant?: ShowUploadedFilesVariant;
  message?: string;
}) {
  if (files.length === 0) return null;

  return (
    <div>
      <SelectedFiles files={files} onRemove={onRemove} message={message} />

      {onSubmit && (
        <div className="border-t border-border px-5 pb-4">
          <Button
            type="button"
            name="Upload Files"
            onClick={onSubmit}
            color="editorAction"
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
