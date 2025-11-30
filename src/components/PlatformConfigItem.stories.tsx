import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import PlatformConfigItem from './PlatformConfigItem';
import { PlatformConfig } from '@/types';

const mockPlatform: PlatformConfig = {
  id: 'instagram-square',
  name: 'Instagram Carré',
  width: 1080,
  height: 1080,
  color: '#E1306C',
  visible: true,
};

const meta = {
  title: 'Components/PlatformConfigItem',
  component: PlatformConfigItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext>
        <Story />
      </DndContext>
    ),
  ],
  args: {
    onUpdate: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof PlatformConfigItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
  args: {
    platform: mockPlatform,
  },
};

export const Hidden: Story = {
  args: {
    platform: {
      ...mockPlatform,
      visible: false,
    },
  },
};

export const Facebook: Story = {
  args: {
    platform: {
      id: 'facebook-post',
      name: 'Facebook Post',
      width: 1200,
      height: 630,
      color: '#1877F2',
      visible: true,
    },
  },
};

export const LinkedIn: Story = {
  args: {
    platform: {
      id: 'linkedin-post',
      name: 'LinkedIn Post',
      width: 1200,
      height: 627,
      color: '#0A66C2',
      visible: true,
    },
  },
};

export const CustomDimensions: Story = {
  args: {
    platform: {
      id: 'custom-1',
      name: 'Format personnalisé',
      width: 1920,
      height: 1080,
      color: '#9b59b6',
      visible: true,
    },
  },
};
