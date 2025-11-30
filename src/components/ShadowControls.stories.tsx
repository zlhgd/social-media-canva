import type { Meta, StoryObj } from '@storybook/react';
import ShadowControls from './ShadowControls';

const meta = {
  title: 'Components/ShadowControls',
  component: ShadowControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onEnabledChange: () => {},
    onColorChange: () => {},
    onBlurChange: () => {},
    onOffsetXChange: () => {},
    onOffsetYChange: () => {},
  },
} satisfies Meta<typeof ShadowControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {
  args: {
    enabled: false,
    color: '#000000',
    blur: 4,
    offsetX: 2,
    offsetY: 2,
  },
};

export const Enabled: Story = {
  args: {
    enabled: true,
    color: '#000000',
    blur: 4,
    offsetX: 2,
    offsetY: 2,
  },
};

export const LargeShadow: Story = {
  args: {
    enabled: true,
    color: '#ff0000',
    blur: 20,
    offsetX: 10,
    offsetY: 10,
  },
};

export const NegativeOffset: Story = {
  args: {
    enabled: true,
    color: '#0000ff',
    blur: 5,
    offsetX: -5,
    offsetY: -5,
  },
};
