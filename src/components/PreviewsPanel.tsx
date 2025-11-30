'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { PlatformConfig, TextLayer } from '@/types';
import { drawTextLayer, doesImageCoverCanvas, calculateExportDimensions } from '@/lib/canvas-utils';

const PREVIEW_TEXT_ID = -1;

interface PreviewsPanelProps {
  image: HTMLImageElement;
  platforms: PlatformConfig[];
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
  previewText?: Omit<TextLayer, 'id'> | null;
  onOpenSettings: () => void;
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
  exportDimensions,
  containerWidth,
}: {
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
}) {
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

    const exportPlatform = { ...platform, width: exportDimensions.width, height: exportDimensions.height };
    const covers = doesImageCoverCanvas(image, exportPlatform, imageX, imageY, zoom);
    ctx.fillStyle = covers ? '#2d2d2d' : averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = zoom / 100 * previewScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + (imageX * previewScale) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * previewScale) - (imgHeight / 2);

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, previewScale);
    });

    if (previewText) {
      ctx.globalAlpha = 0.8;
      drawTextLayer(ctx, { ...previewText, id: PREVIEW_TEXT_ID } as TextLayer, canvas.width, canvas.height, previewScale);
      ctx.globalAlpha = 1;
    }
  }, [image, platform, textLayers, imageX, imageY, zoom, averageColor, previewText, previewDimensions, exportDimensions]);

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

    const exportPlatform = { ...platform, width: exportDimensions.width, height: exportDimensions.height };
    const covers = doesImageCoverCanvas(image, exportPlatform, imageX, imageY, zoom);
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
    link.download = `${platform.id}-${exportDimensions.width}x${exportDimensions.height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [image, platform, textLayers, imageX, imageY, zoom, averageColor, exportDimensions]);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Box>
            <Typography variant="body2">
              {platform.name}
            </Typography>
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
  onOpenSettings,
}: PreviewsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(468);

  const platformExportDimensions = useMemo(() => 
    calculateExportDimensions(image, platforms), 
    [platforms, image]
  );

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const generateCanvasForPlatform = (platform: PlatformConfig): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const dimensions = platformExportDimensions.find(d => d.platformId === platform.id);
    if (!dimensions) throw new Error('Export dimensions not found');

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const exportPlatform = { ...platform, width: dimensions.width, height: dimensions.height };
    const covers = doesImageCoverCanvas(image, exportPlatform, imageX, imageY, zoom);
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

  const visiblePlatforms = useMemo(() => 
    platforms.filter(p => p.visible), 
    [platforms]
  );

  const handleDownloadAll = async () => {
    for (const platform of visiblePlatforms) {
      try {
        const canvas = generateCanvasForPlatform(platform);
        const dimensions = platformExportDimensions.find(d => d.platformId === platform.id);
        if (!dimensions) continue;
        
        const link = document.createElement('a');
        link.download = `${platform.id}-${dimensions.width}x${dimensions.height}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to download ${platform.name}:`, error);
      }
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 1 }} ref={containerRef}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2">Aperçus</Typography>
            <IconButton size="small" onClick={onOpenSettings}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<DownloadIcon />} 
            onClick={handleDownloadAll}
          >
            Tout télécharger
          </Button>
        </Stack>

        <Stack spacing={1}>
          {visiblePlatforms.map((platform) => {
            const dimensions = platformExportDimensions.find(d => d.platformId === platform.id);
            if (!dimensions) return null;
            
            return (
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
                exportDimensions={dimensions}
                containerWidth={containerWidth}
              />
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
