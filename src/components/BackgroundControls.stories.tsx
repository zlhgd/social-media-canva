import type { Meta, StoryObj } from '@storybook/react';
import BackgroundControls from './BackgroundControls';

const meta = {
  title: 'Components/BackgroundControls',
  component: BackgroundControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onShowBackgroundChange: () => {},
    onBackgroundColorChange: () => {},
    onPaddingChange: () => {},
    onBorderRadiusChange: () => {},
  },
} satisfies Meta<typeof BackgroundControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
  args: {
    showBackground: false,
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 4,
  },
};

export const Visible: Story = {
  args: {
    showBackground: true,
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 4,
  },
};

export const ColoredBackground: Story = {
  args: {
    showBackground: true,
    backgroundColor: '#ff5733',
    padding: 20,
    borderRadius: 8,
  },
};

export const LargePadding: Story = {
  args: {
    showBackground: true,
    backgroundColor: '#3498db',
    padding: 30,
    borderRadius: 12,
  },
};

export const SharpCorners: Story = {
  args: {
    showBackground: true,
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 0,
  },
};
