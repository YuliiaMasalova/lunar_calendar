import type { Meta, StoryObj } from '@storybook/react-vite';
import { AspectBadge } from '../components/AspectBadge';
import type { AspectType } from '../types/content';

const meta = {
  title: 'Daily/AspectBadge',
  component: AspectBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['harmony', 'tension', 'insight', 'transit'] satisfies AspectType[],
    },
  },
} satisfies Meta<typeof AspectBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Harmony: Story = { args: { type: 'harmony' } };
export const Tension: Story = { args: { type: 'tension' } };
export const Insight: Story = { args: { type: 'insight' } };
export const Transit: Story = { args: { type: 'transit' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      {(['harmony', 'tension', 'insight', 'transit'] as AspectType[]).map((t) => (
        <AspectBadge key={t} type={t} />
      ))}
    </div>
  ),
};
