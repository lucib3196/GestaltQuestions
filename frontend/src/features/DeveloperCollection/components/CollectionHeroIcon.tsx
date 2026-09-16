import type { CollectionCustomization } from "../../../services";
import {
  getCollectionColor,
  getCollectionIcon,
} from "../../CollectionShared/collectionCustomization";

type CollectionHeroIconProps = {
  customization: CollectionCustomization | null | undefined;
};

export function CollectionHeroIcon({ customization }: CollectionHeroIconProps) {
  const accentColor = getCollectionColor(customization?.color);
  const CollectionIcon = getCollectionIcon(customization?.icon);

  return (
    <div
      className="flex size-32 shrink-0 items-center justify-center rounded-lg border text-5xl font-semibold shadow-lg"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 34%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accentColor} 22%, #020617)`,
        color: accentColor,
      }}
    >
      <CollectionIcon className="size-16" aria-hidden="true" />
    </div>
  );
}
