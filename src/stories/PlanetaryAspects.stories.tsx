import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlanetaryAspects } from '../components/PlanetaryAspects';
import { Skeleton } from '../components/states/Skeleton';
import { ErrorState } from '../components/states/ErrorState';
import { content15, contentNoAspects } from './_fixtures';

const meta = {
  title: 'Daily/PlanetaryAspects',
  component: PlanetaryAspects,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof PlanetaryAspects>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Aspects with time range + badges (SPEC §5.2.4). */
export const Default: Story = {
  args: { aspects: content15.planetary_aspects },
};

/** No significant aspects — empty state (SPEC §7.7). */
export const Empty: Story = {
  args: { aspects: contentNoAspects.planetary_aspects },
};

/** Loading skeleton (SPEC §6.5). */
export const Loading: Story = {
  render: () => (
    <section className="rounded-xl border border-border-secondary bg-card-primary p-32 shadow-card">
      <Skeleton className="mb-16 h-16 w-1/2" />
      <div className="flex flex-col gap-12">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </section>
  ),
};

/** Error with retry (SPEC §7.3). */
export const Error: Story = {
  render: () => <ErrorState onRetry={() => {}} />,
};
