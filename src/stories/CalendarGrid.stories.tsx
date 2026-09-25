import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarGrid } from '../components/CalendarGrid';
import type { AstroData, ISODate, ZodiacSign } from '../types/astro';
import type { DayStatus } from '../types/status';
import { buildMonthMatrix, toISODate } from '../utils/date';
import { cellAstro } from './_fixtures';

const YEAR = 2027;
const MONTH = 10;

const STATUSES: DayStatus[] = ['favorable', 'neutral', 'critical'];
const SIGNS: ZodiacSign[] = ['libra', 'scorpio', 'sagittarius', 'capricorn'];

// Deterministic inline fixtures (no static-date modules); the calendar renders
// real data at runtime via lunarEngine.
function buildData(): Map<ISODate, AstroData> {
  const map = new Map<ISODate, AstroData>();
  for (const week of buildMonthMatrix(YEAR, MONTH)) {
    for (const date of week) {
      if (date.getMonth() !== MONTH - 1) continue;
      const d = date.getDate();
      map.set(
        toISODate(date),
        cellAstro(STATUSES[d % 3], {
          lunar_days: [d, d + 1],
          moonrise: `${String(6 + (d % 12)).padStart(2, '0')}:15`,
          zodiac_sign: SIGNS[d % 4],
        }),
      );
    }
  }
  return map;
}

const DATA = buildData();
const noop = () => {};

const meta = {
  title: 'Calendar/CalendarGrid',
  component: CalendarGrid,
  parameters: { layout: 'padded' },
  args: {
    year: YEAR,
    month: MONTH,
    onRetry: noop,
    onSelectDate: noop,
    selectedDate: new Date(YEAR, MONTH - 1, 15),
  },
} satisfies Meta<typeof CalendarGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Populated month grid with keyboard navigation (SPEC §5.3.4). */
export const Default: Story = {
  args: { data: DATA, isLoading: false, isError: false },
};

/** Loading skeletons (SPEC §6.5). */
export const Loading: Story = {
  args: { data: new Map(), isLoading: true, isError: false },
};

/** Error — grid stays navigable, error block below (SPEC §7.3). */
export const Error: Story = {
  args: { data: DATA, isLoading: false, isError: true },
};

/** Mobile: the 7-column grid is replaced by a vertical list of day rows (Figma 249:2481). */
export const Mobile: Story = {
  args: { data: DATA, isLoading: false, isError: false },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

/** Mobile loading skeleton rows. */
export const MobileLoading: Story = {
  args: { data: new Map(), isLoading: true, isError: false },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};
