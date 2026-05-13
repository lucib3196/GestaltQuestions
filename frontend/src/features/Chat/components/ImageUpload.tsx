import { useId } from "react";
import { CiCirclePlus } from "react-icons/ci";

interface ImageUploadProps {
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageUploader({ onFileSelect }: ImageUploadProps) {
  const inputId = useId();

  return (
    <>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="sr-only"
      />

      <label
        htmlFor={inputId}
        aria-label="Upload image"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
      >
        <CiCirclePlus size={24} />
      </label>
    </>
  );
}
