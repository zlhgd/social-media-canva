import { TextLayer, PlatformConfig } from '@/types';

const LINE_HEIGHT_MULTIPLIER = 1.2;

export function calculateExportDimensions(
  image: HTMLImageElement,
  platforms: PlatformConfig[]
): Array<{ platformId: string; width: number; height: number }> {
  return platforms.map(platform => {
    const aspectRatio = platform.width / platform.height;
    
    const widthBasedHeight = Math.round(image.width / aspectRatio);
    const heightBasedWidth = Math.round(image.height * aspectRatio);
    
    let exportWidth, exportHeight;
    
    const widthBasedArea = image.width * widthBasedHeight;
    const heightBasedArea = heightBasedWidth * image.height;
    
    if (widthBasedHeight <= image.height && heightBasedWidth <= image.width) {
      if (widthBasedArea >= heightBasedArea) {
        exportWidth = image.width;
        exportHeight = widthBasedHeight;
      } else {
        exportWidth = heightBasedWidth;
        exportHeight = image.height;
      }
    } else if (widthBasedHeight <= image.height) {
      exportWidth = image.width;
      exportHeight = widthBasedHeight;
    } else {
      exportWidth = heightBasedWidth;
      exportHeight = image.height;
    }
    
    return {
      platformId: platform.id,
      width: exportWidth,
      height: exportHeight,
    };
  });
}

/**
 * Draw a rounded rectangle on a canvas context
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Calculate text Y position based on vertical alignment
 */
function calculateTextY(
  layer: TextLayer,
  canvasHeight: number,
  textBlockHeight: number,
  padding: number,
  scale: number
): number {
  const distance = layer.distanceFromEdge * scale;
  const totalHeight = textBlockHeight + padding * 2;
  
  switch (layer.verticalAlign) {
    case 'top':
      return distance + totalHeight / 2;
    case 'bottom':
      return canvasHeight - distance - totalHeight / 2;
    case 'middle':
    default:
      return canvasHeight / 2;
  }
}

/**
 * Draw a text layer with background and shadow on a canvas (supports multiline)
 */
export function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 1
): void {
  const fontSize = layer.fontSize * scale;
  const padding = layer.padding * scale;
  const borderRadius = layer.borderRadius * scale;
  const lineHeight = fontSize * layer.lineHeight;
  
  let fontStyle = '';
  if (layer.isItalic) fontStyle += 'italic ';
  if (layer.isBold) fontStyle += 'bold ';
  
  ctx.font = `${fontStyle}${fontSize}px "${layer.fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Split text into lines
  const lines = layer.text.split('\n');
  const lineCount = lines.length;
  
  // Calculate line widths
  const lineWidths = lines.map(line => ctx.measureText(line).width);
  
  const textBlockHeight = lineCount * lineHeight;
  
  const x = canvasWidth / 2;
  const centerY = calculateTextY(layer, canvasHeight, textBlockHeight, padding, scale);

  // Save context state
  ctx.save();

  // Draw each line with its own background (inline mode)
  lines.forEach((line, index) => {
    const lineY = centerY - (textBlockHeight / 2) + (index * lineHeight) + (lineHeight / 2);
    const lineWidth = lineWidths[index];
    
    // Draw background for this line only
    if (layer.showBackground && layer.backgroundColor && layer.backgroundColor !== 'transparent') {
      ctx.fillStyle = layer.backgroundColor;
      const bgX = x - lineWidth / 2 - padding;
      const bgY = lineY - lineHeight / 2;
      const bgWidth = lineWidth + padding * 2;
      const bgHeight = lineHeight;
      drawRoundedRect(ctx, bgX, bgY, bgWidth, bgHeight, borderRadius);
    }
  });

  // Apply shadow to text only
  if (layer.shadow?.enabled) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur * scale;
    ctx.shadowOffsetX = layer.shadow.offsetX * scale;
    ctx.shadowOffsetY = layer.shadow.offsetY * scale;
  }

  // Draw each line of text
  ctx.fillStyle = layer.color;
  lines.forEach((line, index) => {
    const lineY = centerY - (textBlockHeight / 2) + (index * lineHeight) + (lineHeight / 2);
    ctx.fillText(line, x, lineY);
  });

  // Restore context state
  ctx.restore();
}

/**
 * Get average color from an image
 */
export function getAverageColor(image: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#808080';

  const size = 50;
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(image, 0, 0, size, size);
  
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  let r = 0, g = 0, b = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Check if image covers the platform canvas
 */
export function doesImageCoverCanvas(
  image: HTMLImageElement,
  platform: PlatformConfig,
  imageX: number,
  imageY: number,
  zoom: number
): boolean {
  const scale = zoom / 100;
  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;
  const imgX = (platform.width / 2) + imageX - (imgWidth / 2);
  const imgY = (platform.height / 2) + imageY - (imgHeight / 2);
  
  return (
    imgX <= 0 &&
    imgY <= 0 &&
    imgX + imgWidth >= platform.width &&
    imgY + imgHeight >= platform.height
  );
}
