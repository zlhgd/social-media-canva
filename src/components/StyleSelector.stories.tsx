import type { Meta, StoryObj } from '@storybook/react';
import StyleSelector from './StyleSelector';
import { TextStyle } from '@/types';

const mockStyles: TextStyle[] = [
  {
    id: '1',
    name: 'Titre principal',
    fontFamily: 'Inter',
    fontSize: 64,
    lineHeight: 1.2,
    color: '#ffffff',
    backgroundColor: '#000000',
    showBackground: true,
    padding: 20,
    borderRadius: 8,
    isBold: true,
    isItalic: false,
    shadow: {
      enabled: true,
      color: '#000000',
      blur: 10,
      offsetX: 2,
      offsetY: 2,
    },
  },
  {
    id: '2',
    name: 'Sous-titre',
    fontFamily: 'Roboto',
    fontSize: 32,
    lineHeight: 1.4,
    color: '#333333',
    backgroundColor: '#ffeb3b',
    showBackground: true,
    padding: 10,
    borderRadius: 4,
    isBold: false,
    isItalic: true,
    shadow: {
      enabled: false,
      color: '#000000',
      blur: 0,
      offsetX: 0,
      offsetY: 0,
    },
  },
];

const meta = {
  title: 'Components/StyleSelector',
  component: StyleSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onApplyStyle: () => {},
  },
} satisfies Meta<typeof StyleSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithStyles: Story = {
  args: {
    textStyles: mockStyles,
    selectedStyleId: '',
  },
};

export const WithSelection: Story = {
  args: {
    textStyles: mockStyles,
    selectedStyleId: '1',
  },
};

export const Empty: Story = {
  args: {
    textStyles: [],
    selectedStyleId: '',
  },
};
