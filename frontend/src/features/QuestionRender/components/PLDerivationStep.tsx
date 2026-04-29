import clsx from "clsx";

export interface PLDerivationStepProps {
    children?: React.ReactNode;
    className?: string;
}

export function PLDerivationStep({
    children,
    className,
}: PLDerivationStepProps) {
    return (
        <div
            className={clsx(
                "p-4 rounded-[var(--radius-md)] shadow-sm leading-relaxed text-[15px] border-l-4 border-[var(--color-accent)] bg-[var(--color-surface-muted)] text-[var(--color-text)]",
                className
            )}
        >
            {children}
        </div>
    );
}
