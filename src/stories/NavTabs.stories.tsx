import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavTabs } from '../components/NavTabs';

const meta = {
  title: 'Navigation/NavTabs',
  component: NavTabs,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof NavTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// The global preview decorator already provides the Router; each story only
// selects the active route through `parameters.route` (no nested <Router>).

/** Today route active (aria-current="page") — SPEC §5.1/§9.10. */
export const TodayActive: Story = {
  parameters: { route: '/day/2027-10-15' },
};

/** Monthly Calendar route active. */
export const CalendarActive: Story = {
  parameters: { route: '/calendar/2027/10' },
};
