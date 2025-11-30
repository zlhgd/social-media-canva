import type { Meta, StoryObj } from '@storybook/react';
import FontControls from './FontControls';

const meta = {
  title: 'Components/FontControls',
  component: FontControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onFontFamilyChange: () => {},
    onFontSizeChange: () => {},
    onLineHeightChange: () => {},
    onColorChange: () => {},
    onStyleChange: () => {},
  },
} satisfies Meta<typeof FontControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fontFamily: 'Futura',
    fontSize: 48,
    lineHeight: 1.2,
    color: '#ffffff',
    isBold: false,
    isItalic: false,
  },
};

export const BoldText: Story = {
  args: {
    fontFamily: 'Roboto',
    fontSize: 64,
    lineHeight: 1.3,
    color: '#000000',
    isBold: true,
    isItalic: false,
  },
};

export const ItalicText: Story = {
  args: {
    fontFamily: 'Open Sans',
    fontSize: 32,
    lineHeight: 1.5,
    color: '#3498db',
    isBold: false,
    isItalic: true,
  },
};

export const BoldItalic: Story = {
  args: {
    fontFamily: 'Montserrat',
    fontSize: 56,
    lineHeight: 1.1,
    color: '#e74c3c',
    isBold: true,
    isItalic: true,
  },
};

export const SmallText: Story = {
  args: {
    fontFamily: 'Lato',
    fontSize: 16,
    lineHeight: 1.6,
    color: '#555555',
    isBold: false,
    isItalic: false,
  },
};
