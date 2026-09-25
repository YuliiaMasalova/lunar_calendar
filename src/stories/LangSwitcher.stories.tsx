import type { Meta, StoryObj } from '@storybook/react-vite';
import { LangSwitcher } from '../components/LangSwitcher';

const meta = {
  title: 'Navigation/LangSwitcher',
  component: LangSwitcher,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LangSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** EN | RU | UK — active language is strong (700). Click to switch (SPEC §9.11). */
export const Default: Story = {};
