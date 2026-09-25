import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarListItem } from '../components/CalendarListItem';
import { cellAstro, astroDouble, astroTriple } from './_fixtures';

const noop = () => {};
const DATE = new Date('2027-10-12T00:00:00');

/**
 * Mobile Monthly Calendar row (Figma 249:2481, day-cell 360×76): weekday + big date on the
 * left, lunar day + zodiac icons and time marker on the right. Used below the `md` breakpoint;
 * desktop uses the square grid cell (CalendarCell). All stories open at the mobile viewport.
 */
const meta = {
  title: 'Calendar/CalendarListItem (mobile)',
  component: CalendarListItem,
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  args: {
    date: DATE,
    weekday: 'ВТ',
    isToday: false,
    isSelected: false,
    onSelect: noop,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CalendarListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Favorable: Story = { args: { astro: cellAstro('favorable') } };
export const Neutral: Story = { args: { astro: cellAstro('neutral') } };
export const Critical: Story = { args: { astro: cellAstro('critical') } };

export const Selected: Story = { args: { astro: cellAstro('favorable'), isSelected: true } };
export const Today: Story = { args: { astro: cellAstro('favorable'), isToday: true } };

/** Double lunar day (SPEC §7.1). */
export const DoubleLunarDay: Story = { args: { astro: astroDouble } };
/** Triple lunar day — the longest label, must not wrap (SPEC §7.1). */
export const TripleLunarDay: Story = { args: { astro: astroTriple } };

/** Zodiac transit — two clean icons, no arrow. */
export const ZodiacTransit: Story = {
  args: {
    astro: cellAstro('neutral', { zodiac_sign: 'pisces', zodiac_transition_sign: 'aries' }),
  },
};

/** No data yet (loading/error fallback) — renders the dash placeholder. */
export const NoData: Story = { args: { astro: undefined } };
