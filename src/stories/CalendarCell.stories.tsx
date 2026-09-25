import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { CalendarCell } from '../components/CalendarCell';
import type { AstroData } from '../types/astro';
import type { DayStatus } from '../types/status';
import { cellAstro, astroDouble, astroTriple } from './_fixtures';

const noop = () => {};
const DATE = new Date('2027-10-12T00:00:00');
const STATUSES: DayStatus[] = ['favorable', 'neutral', 'critical'];

/** Wrapper giving the aspect-square cell a real grid width. */
function Cell(props: {
  astro?: AstroData;
  inMonth?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
}) {
  return (
    <div className="w-96">
      <CalendarCell
        date={DATE}
        astro={props.astro}
        inMonth={props.inMonth ?? true}
        isToday={props.isToday ?? false}
        isSelected={props.isSelected ?? false}
        tabIndex={0}
        onSelect={noop}
        onKeyDown={noop}
      />
    </div>
  );
}

const meta = {
  title: 'Calendar/CalendarCell',
  component: CalendarCell,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof CalendarCell>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Single states per status (SPEC §6.6) ---
export const Favorable: Story = {
  render: () => <Cell astro={cellAstro('favorable')} />,
};
export const Neutral: Story = {
  render: () => <Cell astro={cellAstro('neutral')} />,
};
export const Critical: Story = {
  render: () => <Cell astro={cellAstro('critical')} />,
};

export const Selected: Story = {
  render: () => <Cell astro={cellAstro('favorable')} isSelected />,
};
export const Today: Story = {
  render: () => <Cell astro={cellAstro('favorable')} isToday />,
};
export const TodaySelected: Story = {
  name: 'Today + Selected',
  render: () => <Cell astro={cellAstro('favorable')} isToday isSelected />,
};

/** Hover captured via interaction so Chromatic snapshots the hover fill/border. */
export const Hover: Story = {
  render: () => <Cell astro={cellAstro('critical')} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('gridcell'));
  },
};

export const Disabled: Story = {
  name: 'Disabled (out of month)',
  render: () => <Cell astro={cellAstro('favorable')} inMonth={false} />,
};

export const DoubleLunarDay: Story = {
  render: () => <Cell astro={astroDouble} />,
};
export const TripleLunarDay: Story = {
  render: () => <Cell astro={astroTriple} />,
};

/** Zodiac sign transit within the day — two clean icons, no arrow (SPEC §5.3.5). */
export const ZodiacTransit: Story = {
  render: () => (
    <Cell
      astro={cellAstro('favorable', {
        zodiac_sign: 'pisces',
        zodiac_transition_sign: 'aries',
      })}
    />
  ),
};

/** Full 3 statuses × states matrix (SPEC §6.6). */
export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="text-text-secondary">
      <div className="grid grid-cols-[88px_96px_96px_96px_96px] items-center gap-8">
        <div />
        {['Default', 'Selected', 'Today', 'Disabled'].map((h) => (
          <div key={h} className="text-center text-label-sm text-text-tertiary">
            {h}
          </div>
        ))}
        {STATUSES.map((s) => (
          <Fragment key={s}>
            <div className="text-label-sm capitalize text-text-secondary">{s}</div>
            <Cell astro={cellAstro(s)} />
            <Cell astro={cellAstro(s)} isSelected />
            <Cell astro={cellAstro(s)} isToday />
            <Cell astro={cellAstro(s)} inMonth={false} />
          </Fragment>
        ))}
      </div>
      <p className="mt-16 text-caption-sm text-text-tertiary">
        Hover state is reproduced by hovering a cell (see the Hover story).
      </p>
    </div>
  ),
};
