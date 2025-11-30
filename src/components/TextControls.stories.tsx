import type { Meta, StoryObj } from '@storybook/react';
import TextControls from './TextControls';
import { TextLayer, TextStyle } from '@/types';

const mockLayers: TextLayer[] = [
  {
    id: 1,
    text: 'Premier texte',
    fontFamily: 'Inter',
    fontSize: 48,
    lineHeight: 1.2,
    color: '#ffffff',
    backgroundColor: '#000000',
    showBackground: true,
    padding: 10,
    borderRadius: 4,
    isBold: false,
    isItalic: false,
    verticalAlign: 'top',
    distanceFromEdge: 20,
    shadow: {
      enabled: false,
      color: '#000000',
      blur: 4,
      offsetX: 2,
      offsetY: 2,
    },
  },
  {
    id: 2,
    text: 'Deuxième texte',
    fontFamily: 'Roboto',
    fontSize: 32,
    lineHeight: 1.4,
    color: '#000000',
    backgroundColor: '#ffeb3b',
    showBackground: true,
    padding: 15,
    borderRadius: 8,
    isBold: true,
    isItalic: false,
    verticalAlign: 'bottom',
    distanceFromEdge: 30,
    shadow: {
      enabled: true,
      color: '#000000',
      blur: 5,
      offsetX: 3,
      offsetY: 3,
    },
  },
];

const mockStyles: TextStyle[] = [
  {
    id: '1',
    name: 'Titre',
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
];

const meta = {
  title: 'Components/TextControls',
  component: TextControls,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onAddLayer: () => {},
    onUpdateLayer: () => {},
    onDeleteLayer: () => {},
    onSaveStyle: () => {},
    onDeleteStyle: () => {},
  },
} satisfies Meta<typeof TextControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    textLayers: [],
    textStyles: [],
  },
};

export const WithLayers: Story = {
  args: {
    textLayers: mockLayers,
    textStyles: [],
  },
};

export const WithStyles: Story = {
  args: {
    textLayers: mockLayers,
    textStyles: mockStyles,
  },
};

export const SingleLayer: Story = {
  args: {
    textLayers: [mockLayers[0]],
    textStyles: mockStyles,
  },
};
