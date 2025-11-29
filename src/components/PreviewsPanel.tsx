'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { PlatformConfig, TextLayer } from '@/types';
import { drawTextLayer, doesImageCoverCanvas } from '@/lib/canvas-utils';

// ID used for preview text layer (not yet added)
const PREVIEW_TEXT_ID = -1;
const PREVIEW_SCALE = 1/3;

interface PreviewsPanelProps {
  image: HTMLImageElement;
  platforms: PlatformConfig[];
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
  previewText?: Omit<TextLayer, 'id'> | null;
}

function PlatformPreview({
  platform,
  image,
  textLayers,
  imageX,
  imageY,
  zoom,
  averageColor,
  previewText,
}: {
  platform: PlatformConfig;
  image: HTMLImageElement;
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
  previewText?: Omit<TextLayer, 'id'> | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preview at 1/3 scale for display
    canvas.width = platform.width * PREVIEW_SCALE;
    canvas.height = platform.height * PREVIEW_SCALE;

    const covers = doesImageCoverCanvas(image, platform, imageX, imageY, zoom);
    ctx.fillStyle = covers ? '#2d2d2d' : averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = zoom / 100 * PREVIEW_SCALE;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + (imageX * PREVIEW_SCALE) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * PREVIEW_SCALE) - (imgHeight / 2);

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // Draw existing text layers
    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, PREVIEW_SCALE);
    });

    // Draw preview text (being edited) with slight transparency
    if (previewText) {
      ctx.globalAlpha = 0.8;
      drawTextLayer(ctx, { ...previewText, id: PREVIEW_TEXT_ID } as TextLayer, canvas.width, canvas.height, PREVIEW_SCALE);
      ctx.globalAlpha = 1;
    }
  }, [image, platform, textLayers, imageX, imageY, zoom, averageColor, previewText]);

  useEffect(() => {
    render();
  }, [render]);

  const handleDownload = () => {
    if (!image) return;

    // Export at full resolution
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, 1);
    });

    const link = document.createElement('a');
    link.download = `${platform.id}-${platform.width}x${platform.height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Box>
            <Typography variant="body2" sx={{ color: platform.color, fontWeight: 600 }}>
              {platform.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {platform.width}×{platform.height}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="success" 
            size="small" 
            startIcon={<DownloadIcon fontSize="small" />} 
            onClick={handleDownload}
          >
            Télécharger
          </Button>
        </Stack>
        <Box sx={{ backgroundColor: '#f0f0f0', borderRadius: 1, p: 0.5 }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
        </Box>
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
  previewText,
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

    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, 1);
    });

    return canvas;
  };

  const handleDownloadAll = async () => {
    for (const platform of platforms) {
      try {
        const canvas = generateCanvasForPlatform(platform);
        const link = document.createElement('a');
        link.download = `${platform.id}-${platform.width}x${platform.height}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to download ${platform.name}:`, error);
      }
    }
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexShrink: 0 }}>
          <Typography variant="body2" fontWeight={600}>Aperçus</Typography>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<DownloadIcon fontSize="small" />} 
            onClick={handleDownloadAll}
          >
            Tout télécharger
          </Button>
        </Stack>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Stack spacing={1}>
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
                previewText={previewText}
              />
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
