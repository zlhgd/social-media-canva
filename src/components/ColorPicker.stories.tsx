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

export const WithLabel: Story = {
  args: {
    color: '#3498db',
    label: 'Couleur de fond',
  },
};

export const Black: Story = {
  args: {
    color: '#000000',
    label: 'Noir',
  },
};

export const White: Story = {
  args: {
    color: '#ffffff',
    label: 'Blanc',
  },
};
