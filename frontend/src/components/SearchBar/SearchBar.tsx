import clsx from "clsx";

type SearchBarProps = {
  value: string;
  setValue: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
};
export default function SearchBar({
  value,
  setValue,
  disabled = false,
  placeholder = "Search questions by title...",
}: SearchBarProps) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        "w-full rounded-md border px-3 py-2.5 text-sm text-text transition",
        "placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        disabled
          ? "cursor-not-allowed border-border bg-surface-muted opacity-60"
          : "border-border bg-surface-secondary hover:border-border-strong",
      )}
    />
  );
}
