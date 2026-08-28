import type {
  PlaygroundAttribute,
  PlaygroundAttributeValue,
  PlaygroundAttributeValues,
  PlaygroundComponentDoc,
} from "./componentPlaygroundRegistry";

function getCanonicalHtmlAttribute(attribute: PlaygroundAttribute): string {
  return attribute.htmlAttribute.split("|")[0] ?? attribute.htmlAttribute;
}

function escapeAttributeValue(value: PlaygroundAttributeValue): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function shouldRenderAttribute(
  attribute: PlaygroundAttribute,
  value: PlaygroundAttributeValue | undefined,
): value is PlaygroundAttributeValue {
  if (value === undefined) return Boolean(attribute.required);

  if (attribute.control === "boolean") {
    if (attribute.required) return true;
    if (typeof attribute.defaultValue === "boolean") {
      return value !== attribute.defaultValue;
    }

    return value === true;
  }

  return String(value).trim().length > 0;
}

function serializeAttribute(
  attribute: PlaygroundAttribute,
  value: PlaygroundAttributeValue,
): string {
  const name = getCanonicalHtmlAttribute(attribute);

  if (attribute.control === "boolean") {
    return `${name}="${value ? "true" : "false"}"`;
  }

  return `${name}="${escapeAttributeValue(value)}"`;
}

function indentChildren(children: string): string {
  return children
    .trim()
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

export function buildSingleComponentMarkup(
  component: PlaygroundComponentDoc,
  values: PlaygroundAttributeValues,
  children: string,
): string {
  const serializedAttributes = component.attributes
    .flatMap((attribute) => {
      const value = values[attribute.prop];

      if (!shouldRenderAttribute(attribute, value)) return [];

      return [serializeAttribute(attribute, value)];
    })
    .join(" ");

  const attrs = serializedAttributes ? ` ${serializedAttributes}` : "";
  const body = children.trim();

  if (!body) {
    return `<${component.tag}${attrs}></${component.tag}>`;
  }

  return `<${component.tag}${attrs}>\n${indentChildren(body)}\n</${component.tag}>`;
}

export function buildPlaygroundMarkup(
  component: PlaygroundComponentDoc,
  values: PlaygroundAttributeValues,
  children: string,
): string {
  const markup = buildSingleComponentMarkup(component, values, children);

  return component.previewWrapper ? component.previewWrapper(markup) : markup;
}
