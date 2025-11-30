import type { Meta, StoryObj } from '@storybook/react';
import ImageUploader from './ImageUploader';

const meta = {
  title: 'Components/ImageUploader',
  component: ImageUploader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onImageLoad: () => {},
  },
} satisfies Meta<typeof ImageUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
