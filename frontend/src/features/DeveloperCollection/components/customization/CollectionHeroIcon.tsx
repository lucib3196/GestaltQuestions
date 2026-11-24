import type { CollectionCustomization } from "../../../../services";
import { getCollectionColor, getCollectionIcon } from "./customization";

type CollectionHeroIconProps = {
  customization: CollectionCustomization | null | undefined;
  themeAware?: boolean;
};

export function CollectionHeroIcon({
  customization,
  themeAware = false,
}: CollectionHeroIconProps) {
  const accentColor = getCollectionColor(customization?.color);
  const CollectionIcon = getCollectionIcon(customization?.icon);
  const surface = themeAware ? "var(--color-surface-strong)" : "#020617";

  return (
    <div
      className="flex size-32 shrink-0 items-center justify-center rounded-lg border text-5xl font-semibold shadow-lg"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 34%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accentColor} 22%, ${surface})`,
        color: themeAware
          ? `color-mix(in srgb, ${accentColor} 60%, var(--color-text))`
          : accentColor,
      }}
    >
      <CollectionIcon className="size-16" aria-hidden="true" />
    </div>
  );
}
