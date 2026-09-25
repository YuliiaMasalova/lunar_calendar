import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from '../App';

/**
 * Full pages (Header + page + Footer) at the Figma breakpoints. The global preview decorator
 * supplies the single Router; each story picks its route via `parameters.route` and its width
 * via `globals.viewport`. Data is the real computed astronomy for a fixed date, so the
 * snapshots are deterministic. `chromatic.viewports` makes Chromatic capture both widths.
 */
const meta = {
  title: 'Pages/Responsive',
  component: App,
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [390, 1280] },
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOBILE = { viewport: { value: 'mobile', isRotated: false } } as const;
const DESKTOP = { viewport: { value: 'desktop', isRotated: false } } as const;

/** Daily Forecast — desktop (Figma "Today – Daily Forecast" 1440). */
export const DailyForecastDesktop: Story = {
  parameters: { route: '/day/2027-10-15' },
  globals: DESKTOP,
};

/** Daily Forecast — mobile (Figma 278:4539): chips stack, hero on one line. */
export const DailyForecastMobile: Story = {
  parameters: { route: '/day/2027-10-15' },
  globals: MOBILE,
};

/** Daily Forecast on a triple lunar day — the widest hero label. */
export const DailyForecastTripleDayMobile: Story = {
  parameters: { route: '/day/2027-08-31' },
  globals: MOBILE,
};

/** Monthly Calendar — desktop: 7-column grid of 128px cells (Figma 164:161). */
export const MonthlyCalendarDesktop: Story = {
  parameters: { route: '/calendar/2027/10' },
  globals: DESKTOP,
};

/** Monthly Calendar — mobile: vertical list of day rows (Figma 249:2481). */
export const MonthlyCalendarMobile: Story = {
  parameters: { route: '/calendar/2027/10' },
  globals: MOBILE,
};
