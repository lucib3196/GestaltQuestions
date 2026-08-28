import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import { useQuestionInstance } from "../../../instance";
import { useQuestionFigure } from "../../../runtime/useQuestionRunTime";
export type ImageSize = "sm" | "md" | "lg";
export type SvgContrastMode = "auto" | "none";

export interface PLFigureProps {
  src?: string;
  filename?: string;
  className?: string;
  size?: ImageSize | string;
  variant?: "default" | "minimal" | string;
  useClientFilesDir?: boolean;
  svgContrast?: SvgContrastMode;
}

const variantStyles: Record<string, string> = {
  default:
    "border border-[var(--color-border)] shadow-sm rounded-[var(--radius-md)] bg-[var(--color-surface-strong)]",
  minimal:
    "border border-transparent bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)] rounded-[var(--radius-md)]",
};

const getStoragePath = (
  storagePath: string | null | undefined,
): string | undefined => {
  const normalizedPath = storagePath?.trim();

  return normalizedPath || undefined;
};

const sizeStyles: Record<ImageSize, string> = {
  sm: "max-w-[150px] md:max-w-[200px]",
  md: "max-w-[300px] md:max-w-[400px]",
  lg: "max-w-[500px] md:max-w-[700px]",
};

function isSvgSource(value: string): boolean {
  const clean = value.split(/[?#]/)[0]?.toLowerCase() ?? "";
  return clean.endsWith(".svg") || clean.endsWith(".svgz");
}

function isSvgDataUrl(value: string): boolean {
  return value.toLowerCase().startsWith("data:image/svg+xml");
}

function shouldApplySvgContrast(
  resolvedName: string,
  image: string,
  mode: SvgContrastMode,
): boolean {
  return mode === "auto" || isSvgSource(resolvedName) || isSvgDataUrl(image);
}

export default function PLFigure({
  src,
  filename,
  className = "",
  size = "md",
  variant = "default",
  svgContrast = "auto",
}: PLFigureProps) {
  const resolvedName = src || filename || "default.png";
  const path = useQuestionInstance((s) =>
    getStoragePath(s.runtime?.qmeta?.storage_path),
  );

  const { image } = useQuestionFigure(resolvedName, path);

  return (
    <div
      className={twMerge(
        clsx(
          "flex justify-center items-center overflow-hidden my-4",
          variantStyles[variant],
          className,
        ),
      )}
    >
      <img
        src={image}
        alt={resolvedName}
        className={clsx(
          "h-auto w-full object-contain transition-[filter,transform] duration-(--duration-base) hover:scale-[1.02]",
          sizeStyles[size as ImageSize],
          shouldApplySvgContrast(resolvedName, image, svgContrast) &&
            "dark:filter-[invert(1)_hue-rotate(180deg)]",
        )}
      />
    </div>
  );
}
