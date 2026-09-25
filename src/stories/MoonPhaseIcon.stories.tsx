import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoonPhaseIcon } from '../components/MoonPhaseIcon';
import type { MoonPhase } from '../types/astro';

const meta = {
  title: 'Icons/MoonPhaseIcon',
  component: MoonPhaseIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { size: 48 },
} satisfies Meta<typeof MoonPhaseIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const PHASES: { phase: MoonPhase; illumination: number }[] = [
  { phase: 'new_moon', illumination: 1 },
  { phase: 'waxing_crescent', illumination: 25 },
  { phase: 'first_quarter', illumination: 50 },
  { phase: 'waxing_gibbous', illumination: 75 },
  { phase: 'full_moon', illumination: 100 },
  { phase: 'waning_gibbous', illumination: 75 },
  { phase: 'last_quarter', illumination: 50 },
  { phase: 'waning_crescent', illumination: 25 },
];

export const FullMoon: Story = {
  args: { phase: 'full_moon', illumination: 100 },
};

export const AllPhases: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-4 gap-24 text-text-secondary">
      {PHASES.map(({ phase, illumination }) => (
        <div key={phase} className="flex flex-col items-center gap-8">
          <MoonPhaseIcon phase={phase} illumination={illumination} size={48} />
          <span className="text-caption-sm">{phase}</span>
          <span className="text-caption-sm text-text-tertiary">{illumination}%</span>
        </div>
      ))}
    </div>
  ),
};
