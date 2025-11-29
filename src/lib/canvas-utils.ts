import { TextLayer, PlatformConfig } from '@/types';

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
  fontSize: number,
  padding: number,
  scale: number
): number {
  const distance = layer.distanceFromEdge * scale;
  const textBoxHeight = fontSize + padding * 2;
  
  switch (layer.verticalAlign) {
    case 'top':
      return distance + textBoxHeight / 2;
    case 'bottom':
      return canvasHeight - distance - textBoxHeight / 2;
    case 'middle':
    default:
      return canvasHeight / 2;
  }
}

/**
 * Draw a text layer with background and shadow on a canvas
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
  
  let fontStyle = '';
  if (layer.isItalic) fontStyle += 'italic ';
  if (layer.isBold) fontStyle += 'bold ';
  
  ctx.font = `${fontStyle}${fontSize}px "${layer.fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const x = canvasWidth / 2;
  const y = calculateTextY(layer, canvasHeight, fontSize, padding, scale);

  // Measure text for background
  const textMetrics = ctx.measureText(layer.text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  // Calculate background bounds
  const bgX = x - textWidth / 2 - padding;
  const bgY = y - textHeight / 2 - padding;
  const bgWidth = textWidth + padding * 2;
  const bgHeight = textHeight + padding * 2;

  // Save context state for shadow
  ctx.save();

  // Apply shadow if enabled
  if (layer.shadow?.enabled) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur * scale;
    ctx.shadowOffsetX = layer.shadow.offsetX * scale;
    ctx.shadowOffsetY = layer.shadow.offsetY * scale;
  }

  // Draw background with rounded corners
  if (layer.backgroundColor && layer.backgroundColor !== 'transparent') {
    ctx.fillStyle = layer.backgroundColor;
    drawRoundedRect(ctx, bgX, bgY, bgWidth, bgHeight, borderRadius);
  }

  // Reset shadow for text (unless we want shadow on text too)
  if (layer.shadow?.enabled && !layer.backgroundColor) {
    // Keep shadow for text if no background
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Draw text
  ctx.fillStyle = layer.color;
  ctx.fillText(layer.text, x, y);

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
