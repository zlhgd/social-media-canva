export interface PlatformConfig {
  id: string;
  name: string;
  shortName: string;
  width: number;
  height: number;
  color: string;
  icon: string;
}

export type VerticalAlignment = 'top' | 'middle' | 'bottom';

export interface TextShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
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
  verticalAlign: VerticalAlignment;
  distanceFromEdge: number;
  shadow: TextShadow;
}

export interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  isBold: boolean;
  isItalic: boolean;
  shadow: TextShadow;
}

export interface ImageState {
  image: HTMLImageElement | null;
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
}

export interface AppState {
  platforms: PlatformConfig[];
  textLayers: TextLayer[];
  textStyles: TextStyle[];
  imageX: number;
  imageY: number;
  zoom: number;
}

export const DEFAULT_SHADOW: TextShadow = {
  enabled: false,
  color: '#000000',
  blur: 4,
  offsetX: 2,
  offsetY: 2,
};

export const DEFAULT_PLATFORMS: PlatformConfig[] = [
  { id: 'instagram', name: 'Instagram', shortName: 'IG', width: 1080, height: 1080, color: '#e1306c', icon: '📸' },
  { id: 'facebook', name: 'Facebook', shortName: 'FB', width: 1200, height: 630, color: '#1877f2', icon: '📘' },
  { id: 'linkedin', name: 'LinkedIn', shortName: 'LI', width: 1200, height: 627, color: '#0a66c2', icon: '💼' },
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

export const STORAGE_KEY = 'social-media-canva-state';
