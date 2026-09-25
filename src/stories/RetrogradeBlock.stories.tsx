import type { Meta, StoryObj } from '@storybook/react-vite';
import { RetrogradeBlock } from '../components/RetrogradeBlock';
import { getRetrogradesForYear } from '../services/knowledge/KnowledgeService';

// Computed from the real ephemeris + knowledge base (no hardcoded dates).
const retrogrades2027 = getRetrogradesForYear(2027);

const meta = {
  title: 'Calendar/RetrogradeBlock',
  component: RetrogradeBlock,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof RetrogradeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Year-bound retrograde reference (SPEC §5.3.7). */
export const Default: Story = {
  args: { items: retrogrades2027 },
};

/** No retrograde periods — empty state (SPEC §7.7). */
export const Empty: Story = {
  args: { items: [] },
};
