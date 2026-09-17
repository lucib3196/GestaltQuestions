import { Check } from "lucide-react";
import type { CollectionCustomization } from "../../../../services";
import {
  COLLECTION_COLOR_PRESETS,
  COLLECTION_ICON_OPTIONS,
  getCollectionColor,
} from "./customization";

type CollectionAppearanceEditorProps = {
  customization: CollectionCustomization;
  onChange: (customization: CollectionCustomization) => void;
};

export function CollectionAppearanceEditor({
  customization,
  onChange,
}: CollectionAppearanceEditorProps) {
  const color = getCollectionColor(customization.color);

  return (
    <div className="border-t border-slate-700/80 pt-7">
      <h2 className="text-xl font-semibold text-slate-50">Appearance</h2>

      <div className="mt-6">
        <span className="text-sm font-semibold text-slate-300">Icon</span>
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {COLLECTION_ICON_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = customization.icon === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onChange({ ...customization, icon: option.key })}
                title={option.label}
                aria-label={`Use ${option.label} icon`}
                className={[
                  "inline-flex h-14 items-center justify-center rounded-md border text-slate-400 transition",
                  isSelected
                    ? "border-pink-500 bg-pink-500/10 text-pink-400 ring-2 ring-pink-500/30"
                    : "border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:text-slate-100",
                ].join(" ")}
              >
                <OptionIcon className="size-6" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        <span className="text-sm font-semibold text-slate-300">
          Accent color
        </span>
        <div className="mt-3 flex flex-wrap gap-5">
          {COLLECTION_COLOR_PRESETS.map((preset) => {
            const isSelected = color === preset;

            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...customization, color: preset })}
                aria-label={`Use color ${preset}`}
                className={[
                  "flex size-9 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50",
                  isSelected
                    ? "border-pink-300 ring-4 ring-pink-500/40"
                    : "border-transparent hover:ring-4 hover:ring-slate-700",
                ].join(" ")}
                style={{ backgroundColor: preset }}
              >
                {isSelected ? (
                  <Check className="size-5 text-white" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
