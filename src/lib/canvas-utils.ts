import { TextLayer } from '@/types';

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
 * Draw a text layer with background on a canvas
 */
export function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  centerX: number,
  centerY: number,
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

  const x = centerX + (layer.x * scale);
  const y = centerY + (layer.y * scale);

  // Measure text for background
  const textMetrics = ctx.measureText(layer.text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  // Calculate background bounds
  const bgX = x - textWidth / 2 - padding;
  const bgY = y - textHeight / 2 - padding;
  const bgWidth = textWidth + padding * 2;
  const bgHeight = textHeight + padding * 2;

  // Draw background with rounded corners
  if (layer.backgroundColor && layer.backgroundColor !== 'transparent') {
    ctx.fillStyle = layer.backgroundColor;
    drawRoundedRect(ctx, bgX, bgY, bgWidth, bgHeight, borderRadius);
  }

  // Draw text
  ctx.fillStyle = layer.color;
  ctx.fillText(layer.text, x, y);
}
