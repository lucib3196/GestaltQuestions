import React from "react";
import clsx from "clsx";
import { useQuestionResponses } from "../answerContext";
import { MathJax } from "better-react-mathjax";
import { uiInputStyles } from "../styles/PanelStyles";

export type PLNumberInputProps = {
    answerName: string;
    comparison: string;
    digits: number | string;
    label: string | number;
    className?: string;
    variant?: keyof typeof variantStyles;
};

const variantStyles: Record<string, string> = {
    default: "bg-[var(--color-surface)]",
    minimal: "bg-[var(--color-surface-muted)]",
};

const PLNumberInput: React.FC<PLNumberInputProps> = ({
    answerName,
    className = "",
    digits,
    label,
    variant = "default",
}) => {
    const step = 1 / Math.pow(10, Number(digits) || 0);
    const { responses, setResponse } = useQuestionResponses();
    const currentResponse = responses[answerName];
    const inputValue =
        typeof currentResponse === "string" || typeof currentResponse === "number"
            ? currentResponse
            : "";

    return (
        <MathJax>
            <div className={className}>
                <fieldset className={clsx(uiInputStyles.fieldset, variantStyles[variant], className)}>
                    <label
                        htmlFor={answerName}
                        className="text-sm font-bold text-text-muted px-2"
                    >
                        {label}
                    </label>
                    <input
                        id={answerName}
                        name={answerName}
                        type="number"
                        step={step}
                        placeholder={String(answerName)}
                        value={inputValue}
                        onChange={(e) => setResponse(answerName, e.target.value)}
                        className={uiInputStyles.base}
                    />
                </fieldset>
            </div>
        </MathJax>
    );
};

export default PLNumberInput;
