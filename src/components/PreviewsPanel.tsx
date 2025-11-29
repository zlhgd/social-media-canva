'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { PlatformConfig, TextLayer } from '@/types';
import { drawTextLayer, doesImageCoverCanvas } from '@/lib/canvas-utils';

interface PreviewsPanelProps {
  image: HTMLImageElement;
  platforms: PlatformConfig[];
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
}

function PlatformPreview({
  platform,
  image,
  textLayers,
  imageX,
  imageY,
  zoom,
  averageColor,
}: {
  platform: PlatformConfig;
  image: HTMLImageElement;
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preview scale for display
    const maxPreviewSize = 250;
    const previewScale = Math.min(
      maxPreviewSize / platform.width,
      maxPreviewSize / platform.height
    );

    canvas.width = platform.width * previewScale;
    canvas.height = platform.height * previewScale;

    // Use average color as background if image doesn't cover
    const covers = doesImageCoverCanvas(image, platform, imageX, imageY, zoom);
    ctx.fillStyle = covers ? '#2d2d2d' : averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate image position and size
    const scale = zoom / 100;
    const imgWidth = image.width * scale * previewScale;
    const imgHeight = image.height * scale * previewScale;
    const imgX = (canvas.width / 2) + (imageX * previewScale) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * previewScale) - (imgHeight / 2);

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // Draw text layers with background
    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, previewScale);
    });
  }, [image, platform, textLayers, imageX, imageY, zoom, averageColor]);

  useEffect(() => {
    render();
  }, [render]);

  const handleDownload = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = platform.width;
    canvas.height = platform.height;

    // Use average color as background if image doesn't cover
    const covers = doesImageCoverCanvas(image, platform, imageX, imageY, zoom);
    ctx.fillStyle = covers ? '#2d2d2d' : averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate image position and size
    const scale = zoom / 100;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + imageX - (imgWidth / 2);
    const imgY = (canvas.height / 2) + imageY - (imgHeight / 2);

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // Draw text layers at full resolution with background
    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, 1);
    });

    // Download
    const link = document.createElement('a');
    link.download = `${platform.id}-${platform.width}x${platform.height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: platform.color, mb: 0.5 }}>
          {platform.icon} {platform.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          {platform.width} × {platform.height}
        </Typography>
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            p: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              maxHeight: 200,
            }}
          />
        </Box>
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          fullWidth
        >
          Télécharger
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PreviewsPanel({
  image,
  platforms,
  textLayers,
  imageX,
  imageY,
  zoom,
  averageColor,
}: PreviewsPanelProps) {
  const generateCanvasForPlatform = (platform: PlatformConfig): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = platform.width;
    canvas.height = platform.height;

    const covers = doesImageCoverCanvas(image, platform, imageX, imageY, zoom);
    ctx.fillStyle = covers ? '#2d2d2d' : averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = zoom / 100;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + imageX - (imgWidth / 2);
    const imgY = (canvas.height / 2) + imageY - (imgHeight / 2);

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // Draw text layers with background
    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, 1);
    });

    return canvas;
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string): Promise<void> => {
    return new Promise((resolve) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(resolve, 100);
    });
  };

  const handleDownloadAll = async () => {
    for (const platform of platforms) {
      try {
        const canvas = generateCanvasForPlatform(platform);
        await downloadCanvas(canvas, `${platform.id}-${platform.width}x${platform.height}.png`);
      } catch (error) {
        console.error(`Failed to download ${platform.name}:`, error);
      }
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          👀 Aperçus
        </Typography>

        <Stack spacing={2}>
          {platforms.map((platform) => (
            <PlatformPreview
              key={platform.id}
              platform={platform}
              image={image}
              textLayers={textLayers}
              imageX={imageX}
              imageY={imageY}
              zoom={zoom}
              averageColor={averageColor}
            />
          ))}
        </Stack>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadAll}
          >
            Tout télécharger
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
