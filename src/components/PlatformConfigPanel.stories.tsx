import type { Meta, StoryObj } from '@storybook/react';
import PlatformConfigPanel from './PlatformConfigPanel';
import { PlatformConfig } from '@/types';

const mockPlatforms: PlatformConfig[] = [
  {
    id: 'instagram-square',
    name: 'Instagram Carré',
    width: 1080,
    height: 1080,
    color: '#E1306C',
    visible: true,
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    color: '#E1306C',
    visible: true,
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    color: '#1877F2',
    visible: true,
  },
];

const meta = {
  title: 'Components/PlatformConfigPanel',
  component: PlatformConfigPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onPlatformChange: () => {},
  },
} satisfies Meta<typeof PlatformConfigPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    platforms: mockPlatforms,
  },
};

export const Empty: Story = {
  args: {
    platforms: [],
  },
};

export const SinglePlatform: Story = {
  args: {
    platforms: [mockPlatforms[0]],
  },
};

export const WithHiddenPlatforms: Story = {
  args: {
    platforms: [
      ...mockPlatforms,
      {
        id: 'linkedin-post',
        name: 'LinkedIn Post',
        width: 1200,
        height: 627,
        color: '#0A66C2',
        visible: false,
      },
    ],
  },
};
