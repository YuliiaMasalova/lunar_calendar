import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from '../components/Header';

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shared header — logo, location, nav tabs, language switcher (SPEC §5.1). */
export const Default: Story = {};
