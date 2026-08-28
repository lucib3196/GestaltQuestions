import type { ValidComponents } from "../QuestionEngine";

export type PlaygroundAttributeValue = string | number | boolean;

export type PlaygroundControl =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "textarea";

export type PlaygroundAttribute = {
  htmlAttribute: string;
  prop: string;
  label: string;
  control: PlaygroundControl;
  required?: boolean;
  defaultValue?: PlaygroundAttributeValue;
  allowedValues?: PlaygroundAttributeValue[];
  description: string;
  advanced?: boolean;
};

export type PlaygroundPreset = {
  name: string;
  description: string;
  attributes: Record<string, PlaygroundAttributeValue>;
  children?: string;
};

export type PlaygroundComponentDoc = {
  tag: ValidComponents;
  componentName: string;
  category: string;
  version: string;
  summary: string;
  childrenDescription: string;
  defaultChildren?: string;
  attributes: PlaygroundAttribute[];
  presets: PlaygroundPreset[];
  accessibility: string[];
  notes?: string[];
  previewWrapper?: (markup: string) => string;
};

export type PlaygroundAttributeValues = Record<
  string,
  PlaygroundAttributeValue
>;

const PANEL_SIZES = ["xs", "sm", "md", "lg", "xl"];
const PANEL_VARIANTS = ["default", "minimal", "soft", "elevated"];
const NUMBER_INPUT_VARIANTS = ["default", "minimal", "emphasis"];
const FIGURE_VARIANTS = ["default", "minimal"];
const FIGURE_SIZES = ["sm", "md", "lg"];
const MULTIPLE_CHOICE_STYLES = ["default", "minimal"];
const HINT_VARIANTS = ["default", "highlighted"];
const SVG_CONTRAST_MODES = ["auto", "none"];
const COMPARISON_MODES = ["exact", "sigfig", "sigfigs"];

const classAttribute: PlaygroundAttribute = {
  htmlAttribute: "class",
  prop: "className",
  label: "class",
  control: "text",
  description: "Optional utility classes applied to the component wrapper.",
  advanced: true,
};

const panelSizeAttribute: PlaygroundAttribute = {
  htmlAttribute: "size",
  prop: "size",
  label: "size",
  control: "select",
  defaultValue: "md",
  allowedValues: PANEL_SIZES,
  description: "Selects the shared panel spacing and minimum dimensions.",
};

const panelVariantAttribute: PlaygroundAttribute = {
  htmlAttribute: "variant",
  prop: "variant",
  label: "variant",
  control: "select",
  defaultValue: "default",
  allowedValues: PANEL_VARIANTS,
  description: "Selects the shared panel surface treatment.",
};

const answerNameAttribute = (
  prop = "answerName",
  defaultValue = "answer",
): PlaygroundAttribute => ({
  htmlAttribute: "answers-name",
  prop,
  label: "answers-name",
  control: "text",
  required: true,
  defaultValue,
  description: "Runtime answer key used to bind input state and feedback.",
});

const comparisonAttribute: PlaygroundAttribute = {
  htmlAttribute: "comparison",
  prop: "comparison",
  label: "comparison",
  control: "select",
  defaultValue: "exact",
  allowedValues: COMPARISON_MODES,
  description: "Answer comparison metadata emitted with the component markup.",
};

const digitsAttribute: PlaygroundAttribute = {
  htmlAttribute: "digits",
  prop: "digits",
  label: "digits",
  control: "number",
  defaultValue: 3,
  description: "Decimal precision used to derive numeric input step size.",
};

const labelAttribute = (defaultValue: string): PlaygroundAttribute => ({
  htmlAttribute: "label",
  prop: "label",
  label: "label",
  control: "text",
  defaultValue,
  description: "MathJax-capable label displayed next to the input.",
});

export const PLAYGROUND_COMPONENTS: PlaygroundComponentDoc[] = [
  {
    tag: "pl-question-panel",
    componentName: "PLQuestionPanel",
    category: "Panels",
    version: "1.0.0",
    summary:
      "Primary question content wrapper with shared sizing and panel variants.",
    childrenDescription: "Any renderable question content.",
    defaultChildren:
      "<p>Solve for $x$ where $2x + 4 = 14$.</p>\n<p>Enter the isolated value below.</p>",
    attributes: [panelSizeAttribute, panelVariantAttribute, classAttribute],
    presets: [
      {
        name: "Default",
        description: "Balanced panel spacing for most question stems.",
        attributes: { size: "md", variant: "default" },
      },
      {
        name: "Minimal",
        description: "Quiet surface for embedding inside denser layouts.",
        attributes: { size: "md", variant: "minimal" },
      },
      {
        name: "Elevated",
        description: "Stronger panel treatment for standalone previews.",
        attributes: { size: "lg", variant: "elevated" },
      },
    ],
    accessibility: [
      "Keep the first child as readable prompt text before interactive inputs.",
      "Use a concise heading in nearby question metadata rather than inside every panel.",
      "Avoid placing unrelated controls inside the prompt panel.",
    ],
  },
  {
    tag: "pl-number-input",
    componentName: "PLNumberInput",
    category: "Numeric Inputs",
    version: "1.0.0",
    summary:
      "Numeric answer input that stores learner input in the question instance state.",
    childrenDescription: "None.",
    attributes: [
      answerNameAttribute("answerName", "x"),
      comparisonAttribute,
      digitsAttribute,
      labelAttribute("$x$"),
      {
        htmlAttribute: "variant",
        prop: "variant",
        label: "variant",
        control: "select",
        defaultValue: "default",
        allowedValues: NUMBER_INPUT_VARIANTS,
        description: "Visual style used by the numeric input field.",
      },
      classAttribute,
    ],
    presets: [
      {
        name: "Default",
        description: "Standard numeric response field.",
        attributes: {
          answerName: "x",
          comparison: "exact",
          digits: 2,
          label: "$x$",
          variant: "default",
        },
      },
      {
        name: "Minimal",
        description: "Lower emphasis field for secondary answers.",
        attributes: {
          answerName: "distance",
          comparison: "sigfig",
          digits: 3,
          label: "Distance (m)",
          variant: "minimal",
        },
      },
      {
        name: "Emphasis",
        description: "Highlighted field for the primary final answer.",
        attributes: {
          answerName: "force",
          comparison: "sigfig",
          digits: 3,
          label: "$F$ (N)",
          variant: "emphasis",
        },
      },
    ],
    accessibility: [
      "Provide a specific label because it becomes the input's visible prompt.",
      "Use distinct answers-name values when several numeric inputs appear together.",
      "Avoid relying on placeholder text as the only instruction.",
    ],
  },
  {
    tag: "pl-number-input-fixed",
    componentName: "PLNumberInputFixed",
    category: "Numeric Inputs",
    version: "1.0.0",
    summary:
      "Numeric input bound to instance state while also registering a fixed correct answer.",
    childrenDescription: "None.",
    attributes: [
      answerNameAttribute("answerName", "Ay"),
      {
        htmlAttribute: "correct-answer-fixed",
        prop: "correctAnswerFixed",
        label: "correct-answer-fixed",
        control: "text",
        required: true,
        defaultValue: "3.5",
        description: "Correct value registered in the instance answer key.",
      },
      comparisonAttribute,
      digitsAttribute,
      labelAttribute("$A_y$ (kN)"),
      {
        htmlAttribute: "variant",
        prop: "variant",
        label: "variant",
        control: "select",
        defaultValue: "default",
        allowedValues: NUMBER_INPUT_VARIANTS,
        description: "Visual style used by the numeric input field.",
      },
      classAttribute,
    ],
    presets: [
      {
        name: "Default",
        description: "Fixed answer with standard styling.",
        attributes: {
          answerName: "Ay",
          correctAnswerFixed: "3.5",
          comparison: "sigfig",
          digits: 3,
          label: "$A_y$ (kN)",
          variant: "default",
        },
      },
      {
        name: "With Unit",
        description: "Uses the label to show engineering units.",
        attributes: {
          answerName: "moment",
          correctAnswerFixed: "12.75",
          comparison: "sigfig",
          digits: 3,
          label: "$M_A$ (kN*m)",
          variant: "minimal",
        },
      },
      {
        name: "Highlighted",
        description: "Emphasized fixed answer field.",
        attributes: {
          answerName: "reaction",
          correctAnswerFixed: "18.2",
          comparison: "sigfig",
          digits: 3,
          label: "$R_B$ (kN)",
          variant: "emphasis",
        },
      },
    ],
    accessibility: [
      "Keep the answer key stable so feedback lines up with the correct response.",
      "Use MathJax labels for symbolic quantities, but include units in plain text.",
      "Prefer short labels so the two-column input layout remains scannable.",
    ],
  },
  {
    tag: "pl-multiple-choice",
    componentName: "PLMultipleChoice",
    category: "Choice Inputs",
    version: "1.0.0",
    summary:
      "Radio or checkbox answer group that stores selected values in runtime state.",
    childrenDescription: "One or more pl-answer children.",
    defaultChildren:
      '<pl-answer correct="false">2</pl-answer>\n<pl-answer correct="true">5</pl-answer>\n<pl-answer correct="false">9</pl-answer>',
    attributes: [
      answerNameAttribute("answersName", "q1"),
      {
        htmlAttribute: "inline",
        prop: "inline",
        label: "inline",
        control: "boolean",
        defaultValue: false,
        description: "Lays options out in a responsive inline grid.",
      },
      {
        htmlAttribute: "multiple",
        prop: "multiple",
        label: "multiple",
        control: "boolean",
        defaultValue: false,
        description: "Uses checkboxes and stores multiple selected values.",
      },
      {
        htmlAttribute: "randomize",
        prop: "randomize",
        label: "randomize",
        control: "boolean",
        defaultValue: true,
        description: "Shuffles option order unless set to false.",
      },
      {
        htmlAttribute: "style",
        prop: "style",
        label: "style",
        control: "select",
        defaultValue: "default",
        allowedValues: MULTIPLE_CHOICE_STYLES,
        description: "Container style preset for the answer group.",
      },
    ],
    presets: [
      {
        name: "Default",
        description: "Single-answer vertical radio group.",
        attributes: {
          answersName: "q1",
          inline: false,
          multiple: false,
          randomize: false,
          style: "default",
        },
      },
      {
        name: "Inline",
        description: "Compact option grid for short answers.",
        attributes: {
          answersName: "q1",
          inline: true,
          multiple: false,
          randomize: false,
          style: "default",
        },
      },
      {
        name: "Multiple",
        description: "Checkbox group for multiple correct options.",
        attributes: {
          answersName: "concepts",
          inline: false,
          multiple: true,
          randomize: false,
          style: "minimal",
        },
        children:
          '<pl-answer correct="true">Conservation of energy</pl-answer>\n<pl-answer correct="false">Newton fourth law</pl-answer>\n<pl-answer correct="true">Momentum balance</pl-answer>',
      },
    ],
    accessibility: [
      "Each option should be short enough to scan without wrapping heavily.",
      "Use randomize=false when option order carries meaning.",
      "Use multiple=true only when more than one answer can be selected.",
    ],
  },
  {
    tag: "pl-checkbox",
    componentName: "PLMultipleChoice",
    category: "Choice Inputs",
    version: "1.0.0",
    summary:
      "Alias for PLMultipleChoice, typically used when multiple selections are expected.",
    childrenDescription: "One or more pl-answer children.",
    defaultChildren:
      '<pl-answer correct="true">Free-body diagram</pl-answer>\n<pl-answer correct="true">Equilibrium equations</pl-answer>\n<pl-answer correct="false">Constant acceleration formula</pl-answer>',
    attributes: [
      answerNameAttribute("answersName", "checks"),
      {
        htmlAttribute: "inline",
        prop: "inline",
        label: "inline",
        control: "boolean",
        defaultValue: false,
        description: "Lays options out in a responsive inline grid.",
      },
      {
        htmlAttribute: "multiple",
        prop: "multiple",
        label: "multiple",
        control: "boolean",
        defaultValue: true,
        description: "Uses checkboxes and stores multiple selected values.",
      },
      {
        htmlAttribute: "randomize",
        prop: "randomize",
        label: "randomize",
        control: "boolean",
        defaultValue: true,
        description: "Shuffles option order unless set to false.",
      },
      {
        htmlAttribute: "style",
        prop: "style",
        label: "style",
        control: "select",
        defaultValue: "default",
        allowedValues: MULTIPLE_CHOICE_STYLES,
        description: "Container style preset for the answer group.",
      },
    ],
    presets: [
      {
        name: "Checklist",
        description: "Multiple-answer checkbox group.",
        attributes: {
          answersName: "checks",
          inline: false,
          multiple: true,
          randomize: false,
          style: "default",
        },
      },
      {
        name: "Inline",
        description: "Dense checkbox grid for short labels.",
        attributes: {
          answersName: "checks",
          inline: true,
          multiple: true,
          randomize: false,
          style: "minimal",
        },
      },
    ],
    accessibility: [
      "Use the alias when checkbox semantics are clearer to authors.",
      "Keep the fieldset answer key readable because it is displayed as the legend.",
      "Avoid randomized order for checklist-style reasoning steps.",
    ],
  },
  {
    tag: "pl-answer",
    componentName: "PLAnswer",
    category: "Choice Inputs",
    version: "1.0.0",
    summary:
      "Child option node for choice components with value and correctness metadata.",
    childrenDescription: "Answer display text or markup.",
    defaultChildren: "Correct option",
    attributes: [
      {
        htmlAttribute: "correct",
        prop: "correct",
        label: "correct",
        control: "boolean",
        defaultValue: false,
        description: "Marks this option as a correct answer.",
      },
      {
        htmlAttribute: "value",
        prop: "value",
        label: "value",
        control: "text",
        description: "Optional submitted value. Falls back to child text.",
      },
      {
        htmlAttribute: "answer-key",
        prop: "answerKey",
        label: "answer-key",
        control: "text",
        description: "Optional stable key used while rendering answer lists.",
        advanced: true,
      },
      {
        htmlAttribute: "disabled",
        prop: "disabled",
        label: "disabled",
        control: "boolean",
        defaultValue: false,
        description: "Disables this option before the parent group submits.",
        advanced: true,
      },
    ],
    presets: [
      {
        name: "Correct",
        description: "Correct answer option inside a choice group.",
        attributes: { correct: true, value: "correct" },
      },
      {
        name: "Distractor",
        description: "Incorrect answer option inside a choice group.",
        attributes: { correct: false, value: "distractor" },
        children: "Distractor option",
      },
    ],
    accessibility: [
      "Use meaningful option text even when a separate value is supplied.",
      "Avoid duplicate values within one choice group.",
      "Do not render pl-answer alone in production content; it expects a choice parent.",
    ],
    previewWrapper: (markup) =>
      `<pl-multiple-choice answers-name="answerPreview" randomize="false">\n  ${markup}\n  <pl-answer correct="false" value="other">Another option</pl-answer>\n</pl-multiple-choice>`,
  },
  {
    tag: "pl-solution-panel",
    componentName: "PLSolutionPanel",
    category: "Solution",
    version: "1.0.0",
    summary:
      "Step-by-step solution container with progressive reveal controls.",
    childrenDescription: "One or more pl-hint children or non-empty text steps.",
    defaultChildren:
      '<pl-hint level="1">Subtract 4 from both sides: $2x = 10$.</pl-hint>\n<pl-hint level="2" variant="highlighted">Divide by 2 to get $x = 5$.</pl-hint>',
    attributes: [
      {
        htmlAttribute: "title",
        prop: "title",
        label: "title",
        control: "text",
        defaultValue: "Solution",
        description: "Panel heading.",
      },
      {
        htmlAttribute: "subtitle",
        prop: "subtitle",
        label: "subtitle",
        control: "text",
        description: "Optional supporting heading text.",
      },
      {
        htmlAttribute: "show-all",
        prop: "autoShowAll",
        label: "show-all",
        control: "boolean",
        defaultValue: false,
        description: "Shows all solution steps immediately.",
      },
      panelSizeAttribute,
      panelVariantAttribute,
      classAttribute,
    ],
    presets: [
      {
        name: "Progressive",
        description: "One step appears at a time.",
        attributes: {
          title: "Solution",
          subtitle: "",
          autoShowAll: false,
          size: "md",
          variant: "default",
        },
      },
      {
        name: "Show All",
        description: "All steps are visible immediately.",
        attributes: {
          title: "Worked Solution",
          subtitle: "Review the complete reasoning path.",
          autoShowAll: true,
          size: "md",
          variant: "soft",
        },
      },
      {
        name: "Elevated",
        description: "Strong panel treatment for split-view solution panes.",
        attributes: {
          title: "Solution",
          subtitle: "",
          autoShowAll: false,
          size: "lg",
          variant: "elevated",
        },
      },
    ],
    accessibility: [
      "Keep step text self-contained so progressive reveal remains understandable.",
      "Use highlighted hints sparingly for final answers or key transitions.",
      "Do not hide required information only in the solution panel.",
    ],
  },
  {
    tag: "pl-hint",
    componentName: "PLHint",
    category: "Solution",
    version: "1.0.0",
    summary: "Hint block with a level badge and styled content container.",
    childrenDescription: "Hint text, inline math, or lightweight markup.",
    defaultChildren: "Try isolating the variable first.",
    attributes: [
      {
        htmlAttribute: "level",
        prop: "level",
        label: "level",
        control: "number",
        required: true,
        defaultValue: 1,
        description: "Number displayed in the hint badge.",
      },
      {
        htmlAttribute: "variant",
        prop: "variant",
        label: "variant",
        control: "select",
        defaultValue: "default",
        allowedValues: HINT_VARIANTS,
        description: "Visual treatment for the hint block.",
      },
      classAttribute,
    ],
    presets: [
      {
        name: "Default",
        description: "Standard hint step.",
        attributes: { level: 1, variant: "default" },
      },
      {
        name: "Highlighted",
        description: "Emphasized hint for important reasoning.",
        attributes: { level: 2, variant: "highlighted" },
        children: "This is the key substitution step.",
      },
    ],
    accessibility: [
      "Use sequential levels when hints are not nested in a solution panel.",
      "Keep the highlighted variant reserved for the most important hint.",
      "Write hint content as actionable guidance, not only a label.",
    ],
  },
  {
    tag: "pl-derivation-container",
    componentName: "PLDerivation",
    category: "Solution",
    version: "1.0.0",
    summary:
      "Container for derivation steps with optional title, subtitle, and reference.",
    childrenDescription: "One or more pl-derivation-step children.",
    defaultChildren:
      "<pl-derivation-step>Start from $F = ma$.</pl-derivation-step>\n<pl-derivation-step>Substitute the known acceleration.</pl-derivation-step>",
    attributes: [
      {
        htmlAttribute: "title",
        prop: "title",
        label: "title",
        control: "text",
        defaultValue: "Derivation",
        description: "Derivation heading.",
      },
      {
        htmlAttribute: "subtitle",
        prop: "subtitle",
        label: "subtitle",
        control: "text",
        description: "Optional supporting heading text.",
      },
      {
        htmlAttribute: "reference",
        prop: "reference",
        label: "reference",
        control: "text",
        description: "Reference label for source material.",
      },
      panelSizeAttribute,
      panelVariantAttribute,
      classAttribute,
    ],
    presets: [
      {
        name: "Default",
        description: "Progressive derivation with title.",
        attributes: {
          title: "Derivation",
          subtitle: "",
          reference: "",
          size: "md",
          variant: "default",
        },
      },
      {
        name: "Referenced",
        description: "Adds a compact source reference line.",
        attributes: {
          title: "Moment Derivation",
          subtitle: "Resolve forces before summing moments.",
          reference: "Statics Eq. 4.1",
          size: "lg",
          variant: "soft",
        },
      },
    ],
    accessibility: [
      "Use a title when the derivation is separate from the surrounding prompt.",
      "Keep each derivation step short enough to reveal cleanly.",
      "Use references as supplemental labels, not as required instructions.",
    ],
  },
  {
    tag: "pl-derivation-step",
    componentName: "PLDerivationStep",
    category: "Solution",
    version: "1.0.0",
    summary: "Single styled derivation block rendered inside a derivation container.",
    childrenDescription: "Step text, equations, or lightweight markup.",
    defaultChildren: "Substitute known values and simplify.",
    attributes: [classAttribute],
    presets: [
      {
        name: "Default",
        description: "A single derivation step inside its parent container.",
        attributes: {},
      },
    ],
    accessibility: [
      "Do not use this component alone in production content.",
      "Keep equations accompanied by enough text for context.",
      "Use one conceptual move per step when possible.",
    ],
    previewWrapper: (markup) =>
      `<pl-derivation-container title="Single Step Context" size="md" variant="default">\n  ${markup}\n</pl-derivation-container>`,
  },
  {
    tag: "pl-figure",
    componentName: "PLFigure",
    category: "Media",
    version: "1.0.0",
    summary:
      "Displays an image resolved from question runtime storage with size and style variants.",
    childrenDescription: "None.",
    attributes: [
      {
        htmlAttribute: "filename",
        prop: "filename",
        label: "filename",
        control: "text",
        defaultValue: "diagram.png",
        description: "Question file name resolved from the runtime storage path.",
      },
      {
        htmlAttribute: "src",
        prop: "src",
        label: "src",
        control: "text",
        description: "Alternative source string passed to the figure resolver.",
        advanced: true,
      },
      {
        htmlAttribute: "size",
        prop: "size",
        label: "size",
        control: "select",
        defaultValue: "md",
        allowedValues: FIGURE_SIZES,
        description: "Maximum image display size.",
      },
      {
        htmlAttribute: "variant",
        prop: "variant",
        label: "variant",
        control: "select",
        defaultValue: "default",
        allowedValues: FIGURE_VARIANTS,
        description: "Figure container style.",
      },
      {
        htmlAttribute: "svg-contrast",
        prop: "svgContrast",
        label: "svg-contrast",
        control: "select",
        defaultValue: "auto",
        allowedValues: SVG_CONTRAST_MODES,
        description: "Controls dark-mode SVG contrast adjustment.",
      },
      classAttribute,
    ],
    presets: [
      {
        name: "Default",
        description: "Standard figure frame.",
        attributes: {
          filename: "diagram.png",
          src: "",
          size: "md",
          variant: "default",
          svgContrast: "auto",
        },
      },
      {
        name: "Minimal",
        description: "Quiet figure frame for embedded diagrams.",
        attributes: {
          filename: "diagram.svg",
          src: "",
          size: "lg",
          variant: "minimal",
          svgContrast: "auto",
        },
      },
      {
        name: "No SVG Contrast",
        description: "Leaves SVG colors unchanged in dark mode.",
        attributes: {
          filename: "diagram.svg",
          src: "",
          size: "md",
          variant: "default",
          svgContrast: "none",
        },
      },
    ],
    accessibility: [
      "Use descriptive filenames because they become the image alt text.",
      "Verify figures in a real question runtime with uploaded files.",
      "Use svg-contrast=none when the source SVG already supports dark mode.",
    ],
    notes: [
      "The current figure component resolves images through runtime storage, so isolated playground previews may not show an image without a backing file path.",
    ],
  },
];

export function findPlaygroundComponent(tag: ValidComponents) {
  return (
    PLAYGROUND_COMPONENTS.find((component) => component.tag === tag) ??
    PLAYGROUND_COMPONENTS[0]
  );
}

export function getDefaultPlaygroundValues(
  component: PlaygroundComponentDoc,
  preset = component.presets[0],
): PlaygroundAttributeValues {
  const values = component.attributes.reduce<PlaygroundAttributeValues>(
    (nextValues, attribute) => {
      if (attribute.defaultValue !== undefined) {
        nextValues[attribute.prop] = attribute.defaultValue;
      }

      return nextValues;
    },
    {},
  );

  return {
    ...values,
    ...(preset?.attributes ?? {}),
  };
}
