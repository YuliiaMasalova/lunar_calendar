import type { Meta, StoryObj } from '@storybook/react-vite';
import { DayHero } from '../components/DayHero';
import { astro15, astroDouble, astroTriple, content15, content1 } from './_fixtures';

const EYEBROW = 'НЕБЕСНЫЙ ПРОГНОЗ НА СЕГОДНЯ';

const meta = {
  title: 'Daily/DayHero',
  component: DayHero,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof DayHero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single lunar day, full moon, Pisces → Aries transit (SPEC §5.2.1). */
export const SingleDay: Story = {
  args: { astro: astro15, motto: content15.motto, eyebrow: EYEBROW },
};

/** Double lunar day (SPEC §7.1). */
export const DoubleDay: Story = {
  args: { astro: astroDouble, motto: content1.motto, eyebrow: EYEBROW },
};

/** Triple lunar day — 29/1/2 (SPEC §7.1). */
export const TripleDay: Story = {
  args: { astro: astroTriple, motto: content1.motto, eyebrow: '15 ОКТЯБРЯ 2027' },
};
