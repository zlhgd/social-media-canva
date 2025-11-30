import type { Meta, StoryObj } from '@storybook/react';
import TextLayerBlock from './TextLayerBlock';
import { TextLayer, TextStyle } from '@/types';

const mockLayer: TextLayer = {
  id: 1,
  text: 'Exemple de texte',
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
  verticalAlign: 'middle',
  distanceFromEdge: 20,
  shadow: {
    enabled: false,
    color: '#000000',
    blur: 4,
    offsetX: 2,
    offsetY: 2,
  },
};

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
];

const meta = {
  title: 'Components/TextLayerBlock',
  component: TextLayerBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onUpdateLayer: () => {},
    onDeleteLayer: () => {},
    onSaveStyle: () => {},
  },
} satisfies Meta<typeof TextLayerBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    layer: mockLayer,
    textStyles: [],
  },
};

export const WithStyles: Story = {
  args: {
    layer: mockLayer,
    textStyles: mockStyles,
  },
};

export const BoldText: Story = {
  args: {
    layer: {
      ...mockLayer,
      text: 'Texte en gras',
      isBold: true,
    },
    textStyles: [],
  },
};

export const WithShadow: Story = {
  args: {
    layer: {
      ...mockLayer,
      text: 'Texte avec ombre',
      shadow: {
        enabled: true,
        color: '#ff0000',
        blur: 10,
        offsetX: 5,
        offsetY: 5,
      },
    },
    textStyles: [],
  },
};

export const LongText: Story = {
  args: {
    layer: {
      ...mockLayer,
      text: 'Ceci est un texte beaucoup plus long qui devrait s\'étendre sur plusieurs lignes pour démontrer comment le composant gère le texte multi-lignes.',
    },
    textStyles: mockStyles,
  },
};
