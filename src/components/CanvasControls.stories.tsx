import type { Meta, StoryObj } from '@storybook/react';
import CanvasControls from './CanvasControls';

const meta = {
  title: 'Components/CanvasControls',
  component: CanvasControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onCoverMode: () => {},
    onCenterH: () => {},
    onCenterV: () => {},
  },
} satisfies Meta<typeof CanvasControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithReplaceButton: Story = {
  args: {
    onReplaceImage: () => {},
  },
};
