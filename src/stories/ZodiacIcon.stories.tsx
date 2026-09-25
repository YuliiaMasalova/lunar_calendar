import type { Meta, StoryObj } from '@storybook/react-vite';
import { ZodiacIcon } from '../components/ZodiacIcon';
import { ZODIAC_ORDER } from '../utils/zodiac';

const meta = {
  title: 'Icons/ZodiacIcon',
  component: ZodiacIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { size: 32 },
} satisfies Meta<typeof ZodiacIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scorpio: Story = { args: { sign: 'scorpio', title: 'Scorpio' } };

/** All 12 signs (SPEC §9.12). */
export const AllSigns: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-6 gap-24 text-accent">
      {ZODIAC_ORDER.map((sign) => (
        <div key={sign} className="flex flex-col items-center gap-8">
          <ZodiacIcon sign={sign} size={32} title={sign} />
          <span className="text-caption-sm text-text-tertiary">{sign}</span>
        </div>
      ))}
    </div>
  ),
};
