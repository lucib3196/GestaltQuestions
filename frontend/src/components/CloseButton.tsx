import { IoMdClose } from "react-icons/io";

type CloseButtonProps = {
  onClick: () => void;
};

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-text-muted shadow-sm transition-colors duration-200 hover:border-warning-border hover:bg-warning-muted hover:text-warning focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-surface"
      onClick={onClick}
      aria-label="Close"
    >
      <IoMdClose className="size-5" aria-hidden="true" />
    </button>
  );
}
