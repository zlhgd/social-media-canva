'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { PlatformConfig, TextLayer } from '@/types';
import { doesImageCoverCanvas, calculateExportDimensions, drawTextLayer } from '@/lib/canvas-utils';
import PlatformPreview from './PlatformPreview';

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

const PreviewsPanel = ({
  image,
  platforms,
  textLayers,
  imageX,
  imageY,
  zoom,
  averageColor,
  previewText,
  onOpenSettings,
}: PreviewsPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(468);

  const platformExportDimensions = useMemo(
    () => calculateExportDimensions(image, platforms),
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

    const dimensions = platformExportDimensions.find((d) => d.platformId === platform.id);
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
    const imgX = canvas.width / 2 + imageX - imgWidth / 2;
    const imgY = canvas.height / 2 + imageY - imgHeight / 2;

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    textLayers.forEach((layer) => {
      drawTextLayer(ctx, layer, canvas.width, canvas.height, 1);
    });

    return canvas;
  };

  const visiblePlatforms = useMemo(() => platforms.filter((p) => p.visible), [platforms]);

  const handleDownloadAll = async () => {
    for (const platform of visiblePlatforms) {
      try {
        const canvas = generateCanvasForPlatform(platform);
        const dimensions = platformExportDimensions.find((d) => d.platformId === platform.id);
        if (!dimensions) continue;

        const link = document.createElement('a');
        link.download = `${platform.id}-${dimensions.width}x${dimensions.height}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
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
            <Tooltip title="Configurer les plateformes">
              <IconButton size="small" onClick={onOpenSettings}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
            const dimensions = platformExportDimensions.find((d) => d.platformId === platform.id);
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
};

export default PreviewsPanel;
