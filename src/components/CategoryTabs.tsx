import { useTranslation } from 'react-i18next';
import type { CategoryKey } from '../types/content';

interface CategoryTabsProps {
  active: CategoryKey;
  onChange: (key: CategoryKey) => void;
  panelId: string;
}

const ORDER: CategoryKey[] = [
  'health_and_body',
  'beauty',
  'business',
  'dreams',
  'talismans',
];

// SPEC §9.9 — coloured dot per category, used by CategoryContent's heading (full class strings for Tailwind JIT).
// Colours follow Figma "Category Chip" (152:43): Green=health, Pink=beauty, Blue=business,
// Purple=talismans. Figma defines no variant for "dreams", so it takes the remaining palette
// colour (gold, status-neutral) — confirm with design if a dedicated colour is added.
export const CATEGORY_DOT: Record<CategoryKey, string> = {
  health_and_body: 'bg-status-favorable',
  beauty: 'bg-status-critical',
  business: 'bg-info-primary',
  dreams: 'bg-status-neutral',
  talismans: 'bg-accent',
};

// Figma "Category Chip" (152:43), states Default / Hover / Active:
//  - Default: neutral — dot #e7eef766, text #e7eef7cc, border #ffffff0d.
//  - Hover and Active are IDENTICAL in Figma: dot + text + border take the category colour
//    (border alpha 0x66 = 40%, purple 0x59 = 35%). No fill tint.
//  - The chip FILL is a flat #0d1320 (bg-bg-primary) in every state.
// Deviation (a11y, SPEC §8): Business text uses the lighter info-secondary because #2563eb on
// #0d1320 is only ~3.6:1 (< AA 4.5:1 for 12px text). Its dot and border keep the exact Figma blue.
// NOTE: every class below is a full, literal string — Tailwind's JIT scanner only picks up
// class names it can find verbatim in the source, so nothing here is built via `${}` concatenation.
interface ChipStyle {
  /** Dot colour when selected (solid category colour). */
  dotActive: string;
  /** Dot colour on hover of an unselected chip (group-hover). */
  dotHover: string;
  /** Text colour when selected. */
  textActive: string;
  /** Text colour on hover of an unselected chip. */
  textHover: string;
  /** Border colour on hover of an unselected chip. */
  borderHover: string;
  /** Border colour when selected — same alpha as hover (Figma Active == Hover). */
  borderActive: string;
}

const CHIP: Record<CategoryKey, ChipStyle> = {
  health_and_body: {
    dotActive: 'bg-status-favorable',
    dotHover: 'group-hover:bg-status-favorable',
    textActive: 'text-status-favorable',
    textHover: 'hover:text-status-favorable',
    borderHover: 'hover:border-status-favorable/40',
    borderActive: 'border-status-favorable/40',
  },
  beauty: {
    dotActive: 'bg-status-critical',
    dotHover: 'group-hover:bg-status-critical',
    textActive: 'text-status-critical',
    textHover: 'hover:text-status-critical',
    borderHover: 'hover:border-status-critical/40',
    borderActive: 'border-status-critical/40',
  },
  business: {
    dotActive: 'bg-info-primary',
    dotHover: 'group-hover:bg-info-primary',
    textActive: 'text-info-secondary',
    textHover: 'hover:text-info-secondary',
    borderHover: 'hover:border-info-primary/40',
    borderActive: 'border-info-primary/40',
  },
  dreams: {
    dotActive: 'bg-status-neutral',
    dotHover: 'group-hover:bg-status-neutral',
    textActive: 'text-status-neutral',
    textHover: 'hover:text-status-neutral',
    borderHover: 'hover:border-status-neutral/40',
    borderActive: 'border-status-neutral/40',
  },
  talismans: {
    dotActive: 'bg-accent',
    dotHover: 'group-hover:bg-accent',
    textActive: 'text-accent',
    textHover: 'hover:text-accent',
    borderHover: 'hover:border-accent/35',
    borderActive: 'border-accent/35',
  },
};

/** SPEC §5.2.2 — five category filter chips: neutral by default, coloured on hover/selected. */
export function CategoryTabs({ active, onChange, panelId }: CategoryTabsProps) {
  const { t } = useTranslation();

  return (
    <div
      role="tablist"
      aria-label={t('daily:category.label')}
      className="flex flex-col gap-8 md:flex-row md:flex-wrap"
    >
      {ORDER.map((key) => {
        const selected = key === active;
        const s = CHIP[key];
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            onClick={() => onChange(key)}
            className={
              selected
                ? `group flex w-full shrink-0 items-center justify-center gap-8 rounded-md border bg-bg-primary px-24 py-12 text-label-sm tracking-wide transition-colors md:w-auto md:justify-start ${s.borderActive} ${s.textActive}`
                : `group flex w-full shrink-0 items-center justify-center gap-8 rounded-md border border-border-secondary bg-bg-primary px-24 py-12 text-label-sm tracking-wide text-text-secondary transition-colors md:w-auto md:justify-start ${s.borderHover} ${s.textHover}`
            }
          >
            <span
              className={`inline-block h-8 w-8 rounded-full transition-colors ${
                selected ? s.dotActive : `bg-text-disabled ${s.dotHover}`
              }`}
              aria-hidden="true"
            />
            {t(`daily:category.chip.${key}`)}
          </button>
        );
      })}
    </div>
  );
}

