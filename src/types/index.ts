export interface PlatformConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  icon: string;
}

export interface TextLayer {
  id: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  isBold: boolean;
  isItalic: boolean;
  x: number;
  y: number;
}

export interface ImageState {
  image: HTMLImageElement | null;
  imageX: number;
  imageY: number;
  zoom: number;
}

export const DEFAULT_PLATFORMS: PlatformConfig[] = [
  { id: 'instagram', name: 'Instagram', width: 1080, height: 1080, color: '#e1306c', icon: '📸' },
  { id: 'facebook', name: 'Facebook', width: 1200, height: 630, color: '#1877f2', icon: '📘' },
  { id: 'linkedin', name: 'LinkedIn', width: 1200, height: 627, color: '#0a66c2', icon: '💼' },
];

export const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Playfair Display',
  'Arial',
  'Georgia',
  'Times New Roman',
];
