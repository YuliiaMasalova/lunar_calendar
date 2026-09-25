import type { Meta, StoryObj } from '@storybook/react-vite';
import { EclipseBlock } from '../components/EclipseBlock';
import { getEclipsesForYear } from '../services/knowledge/KnowledgeService';

// Computed from the real ephemeris + knowledge base (no hardcoded dates).
const eclipses2027 = getEclipsesForYear(2027);

const meta = {
  title: 'Calendar/EclipseBlock',
  component: EclipseBlock,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof EclipseBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Year-bound eclipse reference (SPEC §5.3.8). */
export const Default: Story = {
  args: { items: eclipses2027, year: 2027 },
};

/** No eclipses — empty state (SPEC §7.7). */
export const Empty: Story = {
  args: { items: [], year: 2027 },
};
