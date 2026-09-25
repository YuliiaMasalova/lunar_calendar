import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../components/states/Skeleton';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';

/** Reusable state primitives (SPEC §6.5 / §11). */
const meta = {
  title: 'States/Shared',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SkeletonBlocks: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-8">
      <Skeleton className="h-24 w-1/2" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16 w-3/4" />
      <Skeleton className="aspect-square rounded-lg" />
    </div>
  ),
};

export const ErrorWithRetry: Story = {
  render: () => <ErrorState onRetry={() => {}} />,
};

export const ErrorCustomMessage: Story = {
  render: () => <ErrorState message="Не удалось загрузить аспекты" onRetry={() => {}} />,
};

export const Empty: Story = {
  render: () => <EmptyState message="Значимых аспектов нет" />,
};
