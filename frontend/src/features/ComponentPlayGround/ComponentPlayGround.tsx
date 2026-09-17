import { useMemo } from "react";
import { FiBookOpen, FiBox, FiRefreshCw } from "react-icons/fi";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Button } from "../../components/Button";
import type { ValidComponents } from "../QuestionEngine";
import {
  findPlaygroundComponent,
  PLAYGROUND_COMPONENTS,
} from "./componentPlaygroundRegistry";
import { useComponentPlaygroundStore } from "./componentPlaygroundStore";
import ComponentDocsPanel from "./components/ComponentDocsPanel";
import ComponentList from "./components/ComponentList";
import PlaygroundPreview from "./components/PlaygroundPreview";

function HeaderMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-border px-4 first:border-l-0 first:pl-0">
      <div className="text-[11px] font-semibold uppercase text-text-soft">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xs text-text-muted">
        {value}
      </div>
    </div>
  );
}

export default function QuestionComponentPlayground() {
  const selectedTag = useComponentPlaygroundStore((state) => state.selectedTag);
  const selectedPresetName = useComponentPlaygroundStore(
    (state) => state.selectedPresetName,
  );
  const editorValue = useComponentPlaygroundStore((state) => state.editorValue);
  const selectComponent = useComponentPlaygroundStore(
    (state) => state.selectComponent,
  );
  const applyPreset = useComponentPlaygroundStore((state) => state.applyPreset);

  const selectedComponent = useMemo(
    () => findPlaygroundComponent(selectedTag),
    [selectedTag],
  );

  return (
    <section className="flex min-h-[calc(100vh-6rem)] flex-col gap-3 text-text">
      <header className="rounded-md border border-border bg-surface p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-accent/15 text-accent">
                <FiBookOpen className="size-4" />
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-tight text-text">
                  Question Component Playground
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Explore component APIs, variants, and instance-backed preview
                  states.
                </p>
              </div>
            </div>
          </div>

          <div className="grid min-w-80 grid-cols-2 gap-y-3 sm:grid-cols-4">
            <HeaderMetadata label="ID" value={selectedComponent.tag} />
            <HeaderMetadata
              label="Category"
              value={selectedComponent.category}
            />
            <HeaderMetadata label="Version" value={selectedComponent.version} />
            <HeaderMetadata label="Preset" value={selectedPresetName} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label
            htmlFor="component-select"
            className="text-sm font-medium text-text-muted"
          >
            Component
          </label>
          <select
            id="component-select"
            value={selectedTag}
            onChange={(event) =>
              selectComponent(event.target.value as ValidComponents)
            }
            className="min-w-64 rounded-md border border-border bg-surface-strong px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {PLAYGROUND_COMPONENTS.map((component) => (
              <option key={component.tag} value={component.tag}>
                {component.componentName}
              </option>
            ))}
          </select>

          <Button
            type="button"
            name="Reset Example"
            color="paneMuted"
            size="sm"
            icon={FiRefreshCw}
            onClick={() =>
              applyPreset(selectedComponent.presets[0]?.name ?? "Custom")
            }
          />

          <div className="ml-auto hidden items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 py-2 text-xs text-text-muted lg:flex">
            <FiBox className="size-3.5 text-accent" />
            {selectedComponent.componentName}
          </div>
        </div>
      </header>

      <div className="min-h-[640px] flex-1 overflow-hidden rounded-md border border-border bg-bg">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={18} minSize={14} className="min-w-60">
            <ComponentList />
          </Panel>

          <PanelResizeHandle className="w-1 bg-border transition-colors hover:bg-border-strong" />

          <Panel defaultSize={42} minSize={30} className="min-w-90">
            <ComponentDocsPanel component={selectedComponent} />
          </Panel>

          <PanelResizeHandle className="w-1 bg-border transition-colors hover:bg-border-strong" />

          <Panel defaultSize={40} minSize={28} className="min-w-90">
            <PlaygroundPreview
              component={selectedComponent}
              markup={editorValue}
            />
          </Panel>
        </PanelGroup>
      </div>
    </section>
  );
}
