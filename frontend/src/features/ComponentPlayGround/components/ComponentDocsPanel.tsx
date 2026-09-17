import clsx from "clsx";
import type { ChangeEvent } from "react";
import { FiCheck, FiCode, FiRefreshCw, FiSliders, FiZap } from "react-icons/fi";

import { Button } from "../../../components/Button";
import { CodeEditor } from "../../../components/CodeEditor";
import type {
  PlaygroundAttribute,
  PlaygroundAttributeValue,
  PlaygroundComponentDoc,
} from "../componentPlaygroundRegistry";
import {
  PLAYGROUND_TABS,
  type PlaygroundTab,
  useComponentPlaygroundStore,
} from "../componentPlaygroundStore";

type ComponentDocsPanelProps = {
  component: PlaygroundComponentDoc;
};

function formatValue(value: PlaygroundAttributeValue | undefined): string {
  if (value === undefined || value === "") return "-";
  return String(value);
}

function parseControlValue(
  attribute: PlaygroundAttribute,
  event: ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >,
): PlaygroundAttributeValue {
  if (attribute.control === "boolean" && "checked" in event.target) {
    return event.target.checked;
  }

  if (attribute.control === "number") {
    const value = event.target.value;
    return value === "" ? "" : Number(value);
  }

  return event.target.value;
}

function AttributeControl({
  attribute,
  value,
  onChange,
}: {
  attribute: PlaygroundAttribute;
  value: PlaygroundAttributeValue | undefined;
  onChange: (value: PlaygroundAttributeValue) => void;
}) {
  const id = `playground-${attribute.prop}`;

  if (attribute.control === "boolean") {
    return (
      <label
        htmlFor={id}
        className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-strong px-3 py-3"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text">
            {attribute.label}
          </span>
          <span className="mt-1 block text-xs leading-5 text-text-muted">
            {attribute.description}
          </span>
        </span>
        <input
          id={id}
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(parseControlValue(attribute, event))}
          className="size-4 shrink-0 accent-accent"
        />
      </label>
    );
  }

  return (
    <label className="block rounded-md border border-border bg-surface-strong p-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text">
          {attribute.label}
        </span>
        {attribute.required && (
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-300">
            required
          </span>
        )}
      </span>

      {attribute.control === "select" ? (
        <select
          value={String(value ?? "")}
          onChange={(event) => onChange(parseControlValue(attribute, event))}
          className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {(attribute.allowedValues ?? []).map((allowedValue) => (
            <option key={String(allowedValue)} value={String(allowedValue)}>
              {String(allowedValue)}
            </option>
          ))}
        </select>
      ) : attribute.control === "textarea" ? (
        <textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(parseControlValue(attribute, event))}
          rows={4}
          className="mt-2 w-full resize-y rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      ) : (
        <input
          value={String(value ?? "")}
          type={attribute.control === "number" ? "number" : "text"}
          onChange={(event) => onChange(parseControlValue(attribute, event))}
          className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      )}

      <span className="mt-2 block text-xs leading-5 text-text-muted">
        {attribute.description}
      </span>
    </label>
  );
}

function ConfigureTab({ component }: ComponentDocsPanelProps) {
  const attributeValues = useComponentPlaygroundStore(
    (state) => state.attributeValues,
  );
  const childrenValue = useComponentPlaygroundStore(
    (state) => state.childrenValue,
  );
  const setAttributeValue = useComponentPlaygroundStore(
    (state) => state.setAttributeValue,
  );
  const setChildrenValue = useComponentPlaygroundStore(
    (state) => state.setChildrenValue,
  );
  const configurableAttributes = component.attributes.filter(
    (attribute) => !attribute.advanced,
  );
  const hasChildren = component.childrenDescription !== "None.";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface-secondary p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-text">
          <FiSliders className="size-4 text-accent" />
          Configure
        </div>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          {component.summary}
        </p>
      </div>

      <div className="space-y-3">
        {configurableAttributes.map((attribute) => (
          <AttributeControl
            key={`${component.tag}-${attribute.prop}`}
            attribute={attribute}
            value={attributeValues[attribute.prop]}
            onChange={(value) => setAttributeValue(attribute.prop, value)}
          />
        ))}
      </div>

      {hasChildren && (
        <label className="block rounded-md border border-border bg-surface-strong p-3">
          <span className="text-sm font-semibold text-text">children</span>
          <textarea
            value={childrenValue}
            onChange={(event) => setChildrenValue(event.target.value)}
            rows={8}
            className="mt-2 w-full resize-y rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <span className="mt-2 block text-xs leading-5 text-text-muted">
            {component.childrenDescription}
          </span>
        </label>
      )}
    </div>
  );
}

function VariantsTab({ component }: ComponentDocsPanelProps) {
  const selectedPresetName = useComponentPlaygroundStore(
    (state) => state.selectedPresetName,
  );
  const attributeValues = useComponentPlaygroundStore(
    (state) => state.attributeValues,
  );
  const applyPreset = useComponentPlaygroundStore((state) => state.applyPreset);
  const setAttributeValue = useComponentPlaygroundStore(
    (state) => state.setAttributeValue,
  );
  const variantAttributes = component.attributes.filter(
    (attribute) => attribute.allowedValues?.length,
  );

  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm font-semibold text-text">Preset States</h3>
        <div className="mt-3 grid gap-2">
          {component.presets.map((preset) => {
            const isSelected = selectedPresetName === preset.name;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.name)}
                className={clsx(
                  "rounded-md border px-3 py-2 text-left transition-colors",
                  isSelected
                    ? "border-accent bg-accent/15"
                    : "border-border bg-surface-strong hover:border-border-strong hover:bg-surface-muted",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-text">
                    {preset.name}
                  </span>
                  {isSelected && <FiCheck className="size-4 text-accent" />}
                </span>
                <span className="mt-1 block text-xs leading-5 text-text-muted">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-text">Available Variants</h3>
        <div className="mt-3 space-y-3">
          {variantAttributes.map((attribute) => (
            <div
              key={`${component.tag}-${attribute.prop}-variants`}
              className="rounded-md border border-border bg-surface-strong p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text">
                    {attribute.label}
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    default: {formatValue(attribute.defaultValue)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {attribute.allowedValues?.map((allowedValue) => {
                  const isSelected =
                    String(attributeValues[attribute.prop]) ===
                    String(allowedValue);

                  return (
                    <button
                      key={String(allowedValue)}
                      type="button"
                      onClick={() =>
                        setAttributeValue(attribute.prop, allowedValue)
                      }
                      className={clsx(
                        "rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors",
                        isSelected
                          ? "border-accent bg-accent/15 text-text"
                          : "border-border bg-bg text-text-muted hover:border-border-strong hover:text-text",
                      )}
                    >
                      {String(allowedValue)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!variantAttributes.length && (
            <div className="rounded-md border border-border bg-surface-strong p-3 text-sm text-text-muted">
              This component does not expose styling variants yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CodeTab() {
  const editorValue = useComponentPlaygroundStore((state) => state.editorValue);
  const setEditorValue = useComponentPlaygroundStore(
    (state) => state.setEditorValue,
  );
  const resetGeneratedMarkup = useComponentPlaygroundStore(
    (state) => state.resetGeneratedMarkup,
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-text">
          <FiCode className="size-4 text-accent" />
          Markup
        </div>
        <Button
          type="button"
          name="Regenerate"
          color="paneMuted"
          size="sm"
          icon={FiRefreshCw}
          onClick={resetGeneratedMarkup}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          value={editorValue}
          setValue={setEditorValue}
          language="html"
        />
      </div>
    </div>
  );
}

function PropsTab({ component }: ComponentDocsPanelProps) {
  return (
    <div className="space-y-3">
      {component.attributes.map((attribute) => (
        <div
          key={`${component.tag}-${attribute.prop}-prop`}
          className="rounded-md border border-border bg-surface-strong p-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-mono text-sm text-text">
                {attribute.htmlAttribute}
              </div>
              <div className="mt-1 text-xs text-text-soft">
                prop: {attribute.prop}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-text-soft">
                {attribute.control}
              </span>
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  attribute.required
                    ? "bg-red-500/15 text-red-300"
                    : "bg-surface-muted text-text-soft",
                )}
              >
                {attribute.required ? "required" : "optional"}
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs leading-5 text-text-muted">
            {attribute.description}
          </p>

          <div className="mt-3 grid gap-2 text-xs text-text-soft sm:grid-cols-2">
            <div>default: {formatValue(attribute.defaultValue)}</div>
            <div>
              allowed:{" "}
              {attribute.allowedValues?.length
                ? attribute.allowedValues.map(String).join(", ")
                : "-"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccessibilityTab({ component }: ComponentDocsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface-secondary p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-text">
          <FiZap className="size-4 text-accent" />
          Authoring Notes
        </div>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          {component.childrenDescription}
        </p>
      </div>

      <div className="space-y-2">
        {component.accessibility.map((item) => (
          <div
            key={item}
            className="rounded-md border border-border bg-surface-strong p-3 text-sm leading-6 text-text-muted"
          >
            {item}
          </div>
        ))}
      </div>

      {component.notes?.map((note) => (
        <div
          key={note}
          className="rounded-md border border-warning-border bg-warning-muted p-3 text-sm leading-6 text-text"
        >
          {note}
        </div>
      ))}
    </div>
  );
}

function renderTab(tab: PlaygroundTab, component: PlaygroundComponentDoc) {
  if (tab === "configure") return <ConfigureTab component={component} />;
  if (tab === "variants") return <VariantsTab component={component} />;
  if (tab === "code") return <CodeTab />;
  if (tab === "props") return <PropsTab component={component} />;
  return <AccessibilityTab component={component} />;
}

export default function ComponentDocsPanel({
  component,
}: ComponentDocsPanelProps) {
  const activeTab = useComponentPlaygroundStore((state) => state.activeTab);
  const setActiveTab = useComponentPlaygroundStore(
    (state) => state.setActiveTab,
  );

  return (
    <section className="flex h-full min-h-0 flex-col bg-surface">
      <div className="border-b border-border px-4 pt-3">
        <div className="flex flex-wrap gap-1">
          {PLAYGROUND_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                activeTab === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {renderTab(activeTab, component)}
      </div>
    </section>
  );
}
