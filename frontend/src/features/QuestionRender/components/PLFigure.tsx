import clsx from "clsx";
import { questionAPIURL } from "../../../config/apiConfig";
import { useQuestionCollectionContext } from "../../../context/QuestionCollectionContext";
import { twMerge } from "tailwind-merge"

export type ImageSize = "sm" | "md" | "lg";

export interface PLFigureProps {
    src?: string;
    filename?: string;
    className?: string;
    size?: ImageSize | string;
    variant?: "default" | "minimal" | string;
}

const variantStyles: Record<string, string> = {
    default: "border border-[var(--color-border)] shadow-sm rounded-[var(--radius-md)] bg-[var(--color-surface-strong)]",
    minimal: "border border-transparent bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)] rounded-[var(--radius-md)]",
};

const sizeStyles: Record<ImageSize, string> = {
    sm: "max-w-[150px] md:max-w-[200px]",
    md: "max-w-[300px] md:max-w-[400px]",
    lg: "max-w-[500px] md:max-w-[700px]",
};

export default function PLFigure({
    src,
    filename,
    className = "",
    size = "md",
    variant = "default",
}: PLFigureProps) {
    const { questionMeta: qdata } = useQuestionCollectionContext();

    const resolvedSource = filename && qdata?.question_path ? filename : (src ?? "");
    const isExternalUrl =
        resolvedSource.startsWith("http://") || resolvedSource.startsWith("https://");
    const shouldResolveQuestionFile = filename && qdata?.question_path;
    const imagePath = shouldResolveQuestionFile
        ? `${questionAPIURL}/${qdata.question_path}/clientFiles/${filename}`
        : isExternalUrl
            ? resolvedSource
            : qdata?.question_path
                ? `${questionAPIURL}/${qdata.question_path}/clientFiles/${resolvedSource}`
                : resolvedSource;

    return (
        <div
            className={twMerge(
                clsx(
                    "flex justify-center items-center overflow-hidden my-4",
                    variantStyles[variant],
                    className
                )
            )}
        >
            <img
                src={imagePath}
                alt={resolvedSource}
                className={clsx(
                    "w-full h-auto object-contain transition-transform duration-[var(--duration-base)] hover:scale-[1.02]",
                    sizeStyles[size as ImageSize]
                )}
            />
        </div>
    );
}
