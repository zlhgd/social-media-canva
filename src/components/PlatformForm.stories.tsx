import type { Meta, StoryObj } from '@storybook/react';
import PlatformForm from './PlatformForm';

const meta = {
  title: 'Components/PlatformForm',
  component: PlatformForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onAdd: () => {},
  },
} satisfies Meta<typeof PlatformForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
