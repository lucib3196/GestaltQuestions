import type { FC } from "react";

import {
  PLAnswer,
  type PLAnswerProps,
  PLDerivation,
  type PLDerivationProps,
  PLDerivationStep,
  type PLDerivationStepProps,
  PLFigure,
  type PLFigureProps,
  PLHint,
  type PLHintProps,
  PLMatch,
  PLMatchItem,
  type PLMatchItemProps,
  type PLMatchProps,
  PLMultipleChoice,
  type PLMultipleChoiceProps,
  PLNumberInput,
  PLNumberInputFixed,
  type PLNumberInputFixedProps,
  type PLNumberInputProps,
  type PLNumberInputVariant,
  PLParsonsSequential,
  type PLParsonsSequentialProps,
  PLQuestionPanel,
  type PLQuestionPanelProps,
  PLSolutionPanel,
  type PLSolutionPanelProps,
  PLSymbolicInput,
  type PLSymbolicInputProps,
} from "../render/components";

// The currently available tags that are processed, this is the mapping
// These in html look like EX: <pl-question-panel>Hello world</pl-question-panel
export type ValidComponents =
  | "pl-question-panel"
  | "pl-number-input"
  | "pl-number-input-fixed"
  | "pl-symbolic-input"
  | "pl-figure"
  | "pl-solution-panel"
  | "pl-hint"
  | "pl-derivation-container"
  | "pl-derivation-step"
  | "pl-multiple-choice"
  | "pl-checkbox"
  | "pl-match"
  | "pl-parsons-sequential"
  | "pl-item"
  | "pl-answer";

export type TagRegistry = {
  "pl-question-panel": PLQuestionPanelProps;
  "pl-number-input": PLNumberInputProps;
  "pl-number-input-fixed": PLNumberInputFixedProps;
  "pl-symbolic-input": PLSymbolicInputProps;
  "pl-figure": PLFigureProps;
  "pl-solution-panel": PLSolutionPanelProps;
  "pl-hint": PLHintProps;
  "pl-derivation-container": PLDerivationProps;
  "pl-derivation-step": PLDerivationStepProps;
  "pl-multiple-choice": PLMultipleChoiceProps;
  "pl-checkbox": PLMultipleChoiceProps;
  "pl-match": PLMatchProps;
  "pl-parsons-sequential": PLParsonsSequentialProps;
  "pl-item": PLMatchItemProps;
  "pl-answer": PLAnswerProps;
};

export const ComponentMap: Record<
  ValidComponents | string,
  FC<any> | undefined
> = {
  "pl-question-panel": PLQuestionPanel,
  "pl-number-input": PLNumberInput,
  "pl-number-input-fixed": PLNumberInputFixed,
  "pl-symbolic-input": PLSymbolicInput,
  "pl-figure": PLFigure,
  "pl-solution-panel": PLSolutionPanel,
  "pl-hint": PLHint,
  "pl-derivation-container": PLDerivation,
  "pl-derivation-step": PLDerivationStep,
  "pl-multiple-choice": PLMultipleChoice,
  "pl-checkbox": PLMultipleChoice,
  "pl-match": PLMatch,
  "pl-parsons-sequential": PLParsonsSequential,
  "pl-item": PLMatchItem,
  "pl-answer": PLAnswer,
};

// These are the raw attributes for instance <pl-number-input answer-name='c' />
type RawAttributes = Record<string, string>;

function mapSvgContrast(
  value: string | undefined,
): PLFigureProps["svgContrast"] {
  return value === "none" ? "none" : value === "auto" ? "auto" : undefined;
}

function mapNumberInputVariant(
  value: string | undefined,
): PLNumberInputVariant | undefined {
  if (value === "default" || value === "minimal" || value === "emphasis") {
    return value;
  }

  return undefined;
}

// This essentially maps the raw attributes and changes them and process them
// Into more react viable components, the raw attributes are a mapping to the react
// props that the input element expects,
export const TagAttributeMapping: {
  // eslint-disable-next-line no-unused-vars
  [K in keyof TagRegistry]: (...args: [RawAttributes]) => TagRegistry[K];
} = {
  "pl-question-panel": (attrs) => ({
    className: attrs["classname"] || attrs["class"],
    size: attrs["size"],
    variant: attrs["variant"],
  }),
  "pl-solution-panel": (attrs) => ({
    className: attrs["classname"] || attrs["class"],
    size: attrs["size"],
    variant: attrs["variant"],
    autoShowAll: Boolean(attrs["show-all"]),
    title: attrs["title"],
    subtitle: attrs["subtitle"],
  }),
  "pl-number-input": (attrs) => ({
    answerName: attrs["answers-name"],
    comparison: attrs["comparison"] ?? "exact",
    digits: Number(attrs["digits"] ?? 3),
    label: attrs["label"] ?? "",
    className: attrs["classname"] || attrs["class"],
    variant: mapNumberInputVariant(attrs["variant"]),
  }),
  "pl-number-input-fixed": (attrs) => ({
    answerName: attrs["answers-name"],
    correctAnswerFixed: attrs["correct-answer-fixed"] ?? "",
    comparison: attrs["comparison"] ?? "exact",
    digits: Number(attrs["digits"] ?? 3),
    label: attrs["label"] ?? "",
    className: attrs["classname"] || attrs["class"],
    variant: mapNumberInputVariant(attrs["variant"]),
  }),
  "pl-symbolic-input": (attrs) => ({
    answerName: attrs["answers-name"],
    comparison: attrs["comparison"] ?? "exact",
    digits: Number(attrs["digits"] ?? 3),
    label: attrs["label"] ?? "",
    className: attrs["classname"] || attrs["class"],
    variant: mapNumberInputVariant(attrs["variant"]),
  }),
  "pl-figure": (attrs) => ({
    src: attrs["src"],
    filename: attrs["filename"] || attrs["file-name"],
    className: attrs["classname"] || attrs["class"],
    size: attrs["size"],
    variant: attrs["variant"],
    svgContrast: mapSvgContrast(attrs["svg-contrast"] || attrs["svgcontrast"]),
    useClientFilesDir: attrs["legacy"] ? true : false,
  }),
  "pl-hint": (attrs) => ({
    level: attrs["level"],
    variant: attrs["variant"],
    className: attrs["classname"] || attrs["class"],
  }),
  "pl-derivation-step": (attrs) => ({
    className: attrs["class"] || attrs["classname"],
  }),
  "pl-derivation-container": (attrs) => ({
    title: attrs["title"],
    subtitle: attrs["subtitle"],
    reference: attrs["reference"],
    className: attrs["class"] || attrs["classname"],
    size: attrs["size"],
    variant: attrs["variant"],
  }),
  "pl-answer": (attrs) => ({
    correct: attrs["correct"] === "true" ? "true" : "false",
    value: attrs["value"],
    answerKey: attrs["answer-key"] || attrs["key"],
    disabled: attrs["disabled"] === "true",
  }),
  "pl-multiple-choice": (attrs) => ({
    answersName: attrs["answers-name"],
    inline: attrs["inline"] === "true",
    randomize: attrs["randomize"] !== "false",
    style: attrs["style"],
    multiple: attrs["multiple"] === "true",
  }),
  "pl-checkbox": (attrs) => ({
    answersName: attrs["answers-name"],
    inline: attrs["inline"] === "true",
    randomize: attrs["randomize"] !== "false",
    style: attrs["style"],
    multiple: attrs["multiple"] === "true",
  }),
  "pl-match": (attrs) => ({
    answersName: attrs["answers-name"],
    type: attrs["type"] ?? "match",
    leftTitle: attrs["left-title"] ?? "Prompt",
    rightTitle: attrs["right-title"] ?? "Match",
    className: attrs["classname"] || attrs["class"],
  }),
  "pl-item": (attrs) => ({
    left: attrs["left"] ?? "",
    right: attrs["right"] ?? "",
    seq: attrs["seq"] ?? "",
    dist: attrs["dist"] ?? "f",
    comment: attrs["comment"] ?? "",
  }),
  "pl-parsons-sequential": (attrs) => ({
    answersName: attrs["answers-name"],
    type: attrs["type"] ?? "sequential",
    className: attrs["classname"] || attrs["class"],
  }),
};
