import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusLegend } from '../components/StatusLegend';

const meta = {
  title: 'Calendar/StatusLegend',
  component: StatusLegend,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof StatusLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Dot + text label, never colour alone (SPEC §8). */
export const Default: Story = {};
