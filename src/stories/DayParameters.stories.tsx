import type { Meta, StoryObj } from '@storybook/react-vite';
import { DayParameters } from '../components/DayParameters';
import { Skeleton } from '../components/states/Skeleton';
import { ErrorState } from '../components/states/ErrorState';
import { astro15, astroDouble } from './_fixtures';

const meta = {
  title: 'Daily/DayParameters',
  component: DayParameters,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof DayParameters>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — includes Void of Course shown in red (SPEC §5.2.5/§7.2). */
export const WithVoidOfCourse: Story = {
  args: { astro: astro15 },
};

/** No Void of Course row. */
export const NoVoidOfCourse: Story = {
  args: { astro: astroDouble },
};

/** Loading skeleton (SPEC §6.5). */
export const Loading: Story = {
  render: () => (
    <section className="rounded-xl border border-border-secondary bg-card-primary p-32 shadow-card">
      <Skeleton className="mb-16 h-16 w-1/2" />
      <div className="flex flex-col gap-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </section>
  ),
};

/** Error with retry (SPEC §7.3). */
export const Error: Story = {
  render: () => <ErrorState onRetry={() => {}} />,
};
