export interface PlatformConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  visible: boolean;
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
  lineHeight: number;
  color: string;
  backgroundColor: string;
  showBackground: boolean;
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
  lineHeight: number;
  color: string;
  backgroundColor: string;
  showBackground: boolean;
  padding: number;
  borderRadius: number;
  isBold: boolean;
  isItalic: boolean;
  shadow: TextShadow;
}

export const DEFAULT_SHADOW: TextShadow = {
  enabled: false,
  color: '#000000',
  blur: 4,
  offsetX: 2,
  offsetY: 2,
};

// Official recommended sizes:
// Facebook feed: 1080×1080 (1:1) or 1080×1350 (4:5)
// Instagram feed: 1080px width, 628-1350px height
// LinkedIn post: 1200×627 recommended for optimal display
export const DEFAULT_PLATFORMS: PlatformConfig[] = [
  { id: 'facebook', name: 'Facebook', width: 1080, height: 1080, color: '#1877f2', visible: true },
  { id: 'instagram', name: 'Instagram', width: 1080, height: 1350, color: '#e1306c', visible: true },
  { id: 'linkedin', name: 'LinkedIn', width: 1200, height: 627, color: '#0a66c2', visible: true },
];

export const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Futura',
  'Playfair Display',
  'Arial',
  'Georgia',
  'Times New Roman',
];

export const STORAGE_KEY = 'social-media-canva-config';
