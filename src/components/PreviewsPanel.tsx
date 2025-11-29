'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { PlatformConfig, TextLayer } from '@/types';
import { drawTextLayer } from '@/lib/canvas-utils';

interface PreviewsPanelProps {
  image: HTMLImageElement;
  platforms: PlatformConfig[];
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
}

function PlatformPreview({
  platform,
  image,
  textLayers,
  imageX,
  imageY,
  zoom,
}: {
  platform: PlatformConfig;
  image: HTMLImageElement;
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preview scale for display
    const maxPreviewSize = 300;
    const previewScale = Math.min(
      maxPreviewSize / platform.width,
      maxPreviewSize / platform.height
    );

    canvas.width = platform.width * previewScale;
    canvas.height = platform.height * previewScale;

    // Clear canvas
    ctx.fillStyle = '#2d2d2d';
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
      drawTextLayer(ctx, layer, canvas.width / 2, canvas.height / 2, previewScale);
    });
  }, [image, platform, textLayers, imageX, imageY, zoom]);

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

    // Draw background
    ctx.fillStyle = '#2d2d2d';
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
      drawTextLayer(ctx, layer, canvas.width / 2, canvas.height / 2, 1);
    });

    // Download
    const link = document.createElement('a');
    link.download = `${platform.id}-${platform.width}x${platform.height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ color: platform.color }}>
          {platform.icon} {platform.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {platform.width} × {platform.height}
        </Typography>
        <Box
          sx={{
            backgroundColor: '#1e293b',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            mb: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              maxHeight: 250,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Box>
        <Button
          variant="contained"
          color="success"
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
}: PreviewsPanelProps) {
  const generateCanvasForPlatform = (platform: PlatformConfig): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = platform.width;
    canvas.height = platform.height;

    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = zoom / 100;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + imageX - (imgWidth / 2);
    const imgY = (canvas.height / 2) + imageY - (imgHeight / 2);

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // Draw text layers with background
    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width / 2, canvas.height / 2, 1);
    });

    return canvas;
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string): Promise<void> => {
    return new Promise((resolve) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      // Small delay to ensure download starts before next one
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          👀 Aperçus par plateforme
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {platforms.map((platform) => (
            <Grid size={{ xs: 12, md: 4 }} key={platform.id}>
              <PlatformPreview
                platform={platform}
                image={image}
                textLayers={textLayers}
                imageX={imageX}
                imageY={imageY}
                zoom={zoom}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadAll}
            sx={{ px: 4, py: 1.5 }}
          >
            Télécharger tous les formats
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
