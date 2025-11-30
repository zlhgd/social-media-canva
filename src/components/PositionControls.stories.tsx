import type { Meta, StoryObj } from '@storybook/react';
import PositionControls from './PositionControls';

const meta = {
  title: 'Components/PositionControls',
  component: PositionControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onVerticalAlignChange: () => {},
    onDistanceFromEdgeChange: () => {},
  },
} satisfies Meta<typeof PositionControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    verticalAlign: 'top',
    distanceFromEdge: 20,
  },
};

export const Middle: Story = {
  args: {
    verticalAlign: 'middle',
    distanceFromEdge: 0,
  },
};

export const Bottom: Story = {
  args: {
    verticalAlign: 'bottom',
    distanceFromEdge: 30,
  },
};

export const TopFarFromEdge: Story = {
  args: {
    verticalAlign: 'top',
    distanceFromEdge: 100,
  },
};

export const BottomCloseToEdge: Story = {
  args: {
    verticalAlign: 'bottom',
    distanceFromEdge: 10,
  },
};
