import { MathJax } from "better-react-mathjax";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { useEffect } from "react";

import { Button } from "../../../../../components/Button";
import {
  uiPanelBaseStyles,
  type UIPanelSize,
  uiPanelSizeStyles,
  type UIPanelVariant,
  uiPanelVariantStyles,
  uiTextStyles,
} from "../../../styles";
import type { PLHintProps } from "../content/PLHint";
export interface PLSolutionPanelProps {
  title?: string;
  subtitle?: string;
  /** Steps or solution content */
  children?: React.ReactNode;
  /** Additional styling */
  className?: string;
  /** Size of the panel */
  size?: UIPanelSize | string;
  /** Visual variant */
  variant?: UIPanelVariant | string;
  /** Whether to show all steps automatically */
  autoShowAll?: boolean;
}

type SolutionStep = {
  key: string;
  level: number;
  node: React.ReactNode;
};

function getSolutionSteps(children: React.ReactNode): SolutionStep[] {
  return React.Children.toArray(children)
    .filter((child) => {
      if (React.isValidElement<Partial<PLHintProps>>(child)) {
        return true;
      }

      return typeof child === "string" && child.trim().length > 0;
    })
    .map((child, index) => {
      const fallbackLevel = index;

      if (!React.isValidElement<Partial<PLHintProps>>(child)) {
        return {
          key: `step-${index}`,
          level: fallbackLevel,
          node: child,
        };
      }

      return {
        key: child.key?.toString() ?? `step-${index}`,
        level: fallbackLevel,
        node: React.cloneElement(child, {
          level: fallbackLevel,
        }),
      };
    });
}
function getStepLevels(steps: SolutionStep[]): number[] {
  return Array.from(new Set(steps.map((step) => step.level))).sort(
    (left, right) => left - right,
  );
}

const PLSolutionPanel: React.FC<PLSolutionPanelProps> = ({
  children,
  className = "",
  title = "Solution",
  subtitle,
  size = "md",
  variant = "default",
  autoShowAll = false,
}) => {
  const steps = useMemo(() => getSolutionSteps(children), [children]);
  const stepLevels = useMemo(() => getStepLevels(steps), [steps]);
  const [visibleLevel, setVisibleLevel] = useState<number>(
    () => stepLevels[0] ?? 1,
  );

  useEffect(() => {
    setVisibleLevel(stepLevels[0] ?? 1);
  }, [stepLevels]);

  const maxLevel = stepLevels.at(-1) ?? visibleLevel;
  const canShowNext = visibleLevel < maxLevel;
  const handleShowNext = () => {
    setVisibleLevel((currentLevel) => {
      const nextLevel = stepLevels.find((level) => level > currentLevel);
      return nextLevel ?? currentLevel;
    });
  };
  const handleReset = () => {
    setVisibleLevel(stepLevels[0] ?? 1);
  };

  const visibleSteps = autoShowAll
    ? steps
    : steps.filter((step) => step.level <= visibleLevel);

  return (
    <MathJax>
      <div
        className={clsx(
          "flex h-full flex-col overflow-auto text-left",
          uiPanelBaseStyles,
          uiPanelVariantStyles[variant as UIPanelVariant],
          uiPanelSizeStyles[size as UIPanelSize],
          className,
        )}
      >
        <div className="flex w-full items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className={clsx("text-lg leading-tight", uiTextStyles.title)}>
              {title}
            </h2>
            {subtitle && (
              <p
                className={clsx(
                  "mt-1 text-sm leading-6",
                  uiTextStyles.subtitle,
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-3 py-4">
          {visibleSteps.map((step) => (
            <div key={step.key}>{step.node}</div>
          ))}
        </div>

        {!autoShowAll && steps.length > 0 && (
          <div className="mt-auto flex justify-end gap-2 border-t border-border pt-4">
            {canShowNext ? (
              <Button
                name="Show Next Step"
                color="showSolution"
                onClick={handleShowNext}
              />
            ) : (
              <Button name="Reset" color="secondary" onClick={handleReset} />
            )}
          </div>
        )}
      </div>
    </MathJax>
  );
};

export default PLSolutionPanel;
