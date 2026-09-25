import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryTabs } from '../components/CategoryTabs';
import type { CategoryKey } from '../types/content';

const meta = {
  title: 'Daily/CategoryTabs',
  component: CategoryTabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function Stateful({ initial }: { initial: CategoryKey }) {
  const [active, setActive] = useState<CategoryKey>(initial);
  return <CategoryTabs active={active} onChange={setActive} panelId="sb-panel" />;
}

/**
 * Default — one chip selected (coloured), the other four neutral/grey until
 * hovered (SPEC §5.2.2; Figma "Category Chip" 152:43 Default/Hover/Active states).
 * Hover any grey chip to see it recolour into its own category colour.
 */
export const Default: Story = {
  render: () => <Stateful initial="health_and_body" />,
};

/**
 * Active-state sheet — one row per category with that chip selected, mirroring the
 * "Active" row of the Figma "Category Chip" component (152:43). In Figma Active and Hover
 * are identical (category-coloured dot/text/border, flat #0d1320 fill). Figma defines only
 * Green/Pink/Blue/Purple; "dreams" (gold) is the one colour Figma does not specify.
 */
export const ActiveMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-16">
      {(
        ['health_and_body', 'beauty', 'business', 'dreams', 'talismans'] as CategoryKey[]
      ).map((k) => (
        <Stateful key={k} initial={k} />
      ))}
    </div>
  ),
};

export const BeautyActive: Story = {
  render: () => <Stateful initial="beauty" />,
};

export const BusinessActive: Story = {
  render: () => <Stateful initial="business" />,
};

export const DreamsActive: Story = {
  render: () => <Stateful initial="dreams" />,
};

export const TalismansActive: Story = {
  render: () => <Stateful initial="talismans" />,
};
