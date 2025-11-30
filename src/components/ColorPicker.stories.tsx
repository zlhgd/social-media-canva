import type { Meta, StoryObj } from '@storybook/react';
import ColorPicker from './ColorPicker';

const meta = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onChange: () => {},
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: '#ff5733',
  },
};
