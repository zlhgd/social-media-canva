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
    backgroundColor: '#ff5733',
    padding: 20,
    borderRadius: 8,
  },
};
