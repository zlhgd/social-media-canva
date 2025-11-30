import { PlatformConfig } from '@/types';

interface NormalizedFrame extends PlatformConfig {
  displayWidth: number;
  displayHeight: number;
  exportWidth: number;
  exportHeight: number;
  scaleFactor: number;
}

const HANDLE_SIZE = 10;

export const renderCanvas = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  normalizedFrames: NormalizedFrame[],
  imageX: number,
  imageY: number,
  zoom: number,
  averageColor: string,
  maxDisplayWidth: number,
  maxDisplayHeight: number
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const referenceFrame = normalizedFrames[0];
  const imageDisplayScale = 1 / referenceFrame.scaleFactor;
  
  const scale = (zoom / 100) * imageDisplayScale;
  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;
  
  const padding = Math.max(HANDLE_SIZE * 2, 50);
  const canvasWidth = Math.max(maxDisplayWidth, imgWidth + padding * 2);
  const canvasHeight = Math.max(maxDisplayHeight, imgHeight + padding * 2);

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = averageColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgX = (canvas.width / 2) + (imageX * imageDisplayScale) - (imgWidth / 2);
  const imgY = (canvas.height / 2) + (imageY * imageDisplayScale) - (imgHeight / 2);

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  normalizedFrames.forEach((frame) => {
    const x = (canvas.width - frame.displayWidth) / 2;
    const y = (canvas.height - frame.displayHeight) / 2;
    ctx.rect(x, y, frame.displayWidth, frame.displayHeight);
  });
  ctx.clip();
  ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  ctx.restore();

  normalizedFrames.forEach((frame) => {
    const x = (canvas.width - frame.displayWidth) / 2;
    const y = (canvas.height - frame.displayHeight) / 2;

    ctx.strokeStyle = frame.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, frame.displayWidth, frame.displayHeight);

    ctx.fillStyle = frame.color;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const label = frame.name;
    const labelPadding = 4;
    const labelMetrics = ctx.measureText(label);
    ctx.fillRect(x, y, labelMetrics.width + labelPadding * 2, 18);
    ctx.fillStyle = 'white';
    ctx.fillText(label, x + labelPadding, y + 3);
  });

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.5;

  const handles = [
    { x: imgX, y: imgY },
    { x: imgX + imgWidth, y: imgY },
    { x: imgX, y: imgY + imgHeight },
    { x: imgX + imgWidth, y: imgY + imgHeight },
  ];

  handles.forEach((handle) => {
    ctx.beginPath();
    ctx.rect(handle.x - HANDLE_SIZE / 2, handle.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    ctx.fill();
    ctx.stroke();
  });
};
