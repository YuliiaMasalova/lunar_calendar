import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { MonthSelector } from '../components/MonthSelector';

const meta = {
  title: 'Calendar/MonthSelector',
  component: MonthSelector,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof MonthSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

function Stateful({ year, month }: { year: number; month: number }) {
  const [ym, setYm] = useState({ year, month });
  return (
    <MonthSelector
      year={ym.year}
      month={ym.month}
      onChange={(y, m) => setYm({ year: y, month: m })}
    />
  );
}

/** chevrons + month-year button (SPEC §5.3.2). */
export const Default: Story = {
  render: () => <Stateful year={2027} month={10} />,
};

/** Dropdown opened via interaction so the month grid is captured. */
export const Open: Story = {
  render: () => <Stateful year={2027} month={10} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /select month|выбрать месяц|обрати місяць/i }));
  },
};
