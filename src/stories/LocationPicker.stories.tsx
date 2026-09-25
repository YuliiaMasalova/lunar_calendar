import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { LocationPicker } from '../components/LocationPicker';

const meta = {
  title: 'Navigation/LocationPicker',
  component: LocationPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LocationPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Collapsed indicator — dot + "KYIV 50.45° N" (SPEC §5.1). */
export const Default: Story = {};

/** Typeahead opened via interaction (SPEC §6.1). */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('button')[0]);
  },
};

/** Typeahead with a query typed in — filtered results. */
export const WithQuery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('button')[0]);
    await userEvent.type(canvas.getByRole('combobox'), 'lo');
  },
};
