import type { Meta, StoryObj } from '@storybook/react';
import { HeroBackground } from '../components/HeroBackground';

const meta: Meta<typeof HeroBackground> = {
  title: 'Hero/HeroBackground',
  component: HeroBackground,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'aura', values: [{ name: 'aura', value: '#0d1320' }] },
  },
  decorators: [
    (Story) => (
      <div className="relative flex h-[600px] items-center justify-center bg-bg-primary">
        <Story />
        <span className="relative z-10 text-display-lunar text-text-primary">15</span>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HeroBackground>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
