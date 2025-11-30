'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { PlatformConfig, TextLayer } from '@/types';
import { drawTextLayer, doesImageCoverCanvas } from '@/lib/canvas-utils';

const PREVIEW_TEXT_ID = -1;

interface PlatformPreviewProps {
  platform: PlatformConfig;
  image: HTMLImageElement;
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
  previewText?: Omit<TextLayer, 'id'> | null;
  exportDimensions: { width: number; height: number };
  containerWidth: number;
}

const PlatformPreview = ({
  platform,
  image,
  textLayers,
  imageX,
  imageY,
  zoom,
  averageColor,
  previewText,
  exportDimensions,
  containerWidth,
}: PlatformPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const previewDimensions = useMemo(() => {
    const aspectRatio = exportDimensions.width / exportDimensions.height;
    let displayWidth, displayHeight;
    if (aspectRatio >= 1) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / aspectRatio;
    } else {
      displayHeight = containerWidth;
      displayWidth = containerWidth * aspectRatio;
    }
    const previewScale = displayWidth / exportDimensions.width;
    return { displayWidth, displayHeight, previewScale };
  }, [exportDimensions, containerWidth]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { displayWidth, displayHeight, previewScale } = previewDimensions;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const exportPlatform = {
      ...platform,
      width: exportDimensions.width,
      height: exportDimensions.height,
    };
    const covers = doesImageCoverCanvas(image, exportPlatform, imageX, imageY, zoom);
    ctx.fillStyle = covers ? '#2d2d2d' : averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = (zoom / 100) * previewScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = canvas.width / 2 + imageX * previewScale - imgWidth / 2;
    const imgY = canvas.height / 2 + imageY * previewScale - imgHeight / 2;

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    textLayers.forEach((layer) => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, previewScale);
    });

    if (previewText) {
      ctx.globalAlpha = 0.8;
      drawTextLayer(
        ctx,
        { ...previewText, id: PREVIEW_TEXT_ID } as TextLayer,
        canvas.width,
        canvas.height,
        previewScale
      );
      ctx.globalAlpha = 1;
    }
  }, [
    image,
    platform,
    textLayers,
    imageX,
    imageY,
    zoom,
    averageColor,
    previewText,
    previewDimensions,
    exportDimensions,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  const handleDownload = useCallback(() => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = exportDimensions.width;
    canvas.height = exportDimensions.height;

    const exportPlatform = {
      ...platform,
      width: exportDimensions.width,
      height: exportDimensions.height,
    };
    const covers = doesImageCoverCanvas(image, exportPlatform, imageX, imageY, zoom);
    ctx.fillStyle = covers ? '#2d2d2d' : averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = zoom / 100;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = canvas.width / 2 + imageX - imgWidth / 2;
    const imgY = canvas.height / 2 + imageY - imgHeight / 2;

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    textLayers.forEach((layer) => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, 1);
    });

    const link = document.createElement('a');
    link.download = `${platform.id}-${exportDimensions.width}x${exportDimensions.height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [image, platform, textLayers, imageX, imageY, zoom, averageColor, exportDimensions]);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Box>
            <Typography variant="body2">{platform.name}</Typography>
            <Typography variant="caption">
              {platform.width}×{platform.height}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Télécharger
          </Button>
        </Stack>
        <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'center' }}>
          <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlatformPreview;
