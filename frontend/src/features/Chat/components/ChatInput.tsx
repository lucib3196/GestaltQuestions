import clsx from "clsx";
import { useState } from "react";
import ImageUploader from "./ImageUpload";

type ChatInputVariant = "default" | "subtle";

const VariantClasses: Record<
  ChatInputVariant,
  {
    root: string;
    preview: string;
    toolbar: string;
    newButton: string;
    input: string;
    sendButton: string;
  }
> = {
  default: {
    root: "rounded-lg border border-border bg-surface p-2",
    preview: "mb-2 w-full rounded-lg border border-border bg-surface-muted p-2",
    toolbar: "mt-0 flex w-full items-center gap-2 border-t border-border pt-3",
    newButton:
      "rounded-md border border-border px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text",
    input:
      "flex-1 rounded-md border border-border bg-surface-strong px-3 py-2 text-sm text-text outline-none placeholder:text-text-soft focus:border-border-strong",
    sendButton:
      "rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
  },
  subtle: {
    root: "rounded-lg bg-surface-muted p-2",
    preview: "mb-2 w-full rounded-lg border border-border bg-surface p-2",
    toolbar: "mt-0 flex w-full items-center gap-2 pt-3",
    newButton:
      "rounded-md border border-border px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text",
    input:
      "flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-text-soft focus:border-border-strong",
    sendButton:
      "rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
  },
};

export interface ChatInputProps {
  handleSubmit: (val: string, images?: string[]) => Promise<void>;
  disabled: boolean;
  onNewThread?: () => void;
  multiModal?: boolean;
  variant?: ChatInputVariant;
}

export function ChatInput({
  handleSubmit,
  disabled,
  onNewThread,
  multiModal = true,
  variant = "default",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [_, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const styles = VariantClasses[variant];

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    handleSubmit(trimmed, image ? [image] : undefined);
    setImage(null);
    setMessage("");
  };

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    const url = URL.createObjectURL(file);
    setImage(url);
  }

  return (
    <div className={clsx("flex flex-col", styles.root)}>
      {image && (
        <div className={styles.preview}>
          <img src={image} alt="Preview" className="max-h-52 w-full rounded-md object-contain" />
        </div>
      )}
      <div className={styles.toolbar}>
        {onNewThread && (
          <button type="button" onClick={onNewThread} className={styles.newButton}>
            New
          </button>
        )}
        <input
          className={styles.input}
          placeholder="Type a message..."
          disabled={disabled}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !message.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
        {multiModal && <ImageUploader onFileSelect={onFileSelect} />}
      </div>
    </div>
  );
}
