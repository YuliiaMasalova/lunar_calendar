import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryContent } from '../components/CategoryContent';
import { Skeleton } from '../components/states/Skeleton';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { content1, content15 } from './_fixtures';

const meta = {
  title: 'Daily/CategoryContent',
  component: CategoryContent,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single lunar day — one card, no switcher (SPEC §5.2.3). */
export const HealthAndBody: Story = {
  args: { blocks: [{ lunarDay: 15, content: content15 }], category: 'health_and_body' },
};

/** Plain-string category (business) — single text block. */
export const TextCategory: Story = {
  args: { blocks: [{ lunarDay: 15, content: content15 }], category: 'business' },
};

/** Double lunar day — ONE card with an in-card lunar-day switcher (SPEC §7.1). */
export const DoubleLunarDay: Story = {
  args: {
    blocks: [
      { lunarDay: 15, content: content15 },
      { lunarDay: 16, content: content1 },
    ],
    category: 'health_and_body',
  },
};

/** Loading — card body replaced by skeleton (SPEC §6.5). */
export const Loading: Story = {
  render: () => (
    <div className="rounded-xl border border-border-secondary bg-card-primary p-32 shadow-card">
      <Skeleton className="mb-24 h-20 w-1/3" />
      <div className="grid gap-20 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  ),
};

/** Empty — no content for the category (SPEC §7.7). */
export const Empty: Story = {
  render: () => <EmptyState message="Нет данных для этой категории" />,
};

/** Error — content failed to load, retry (SPEC §7.3). */
export const Error: Story = {
  render: () => <ErrorState onRetry={() => {}} />,
};
