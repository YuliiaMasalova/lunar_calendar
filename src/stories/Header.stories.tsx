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

/** Mobile header (Figma 249:2481): logo icon + location on row 1, language switcher right, full-width nav tabs stacked. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
};
