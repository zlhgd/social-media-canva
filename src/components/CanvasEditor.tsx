'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Box, Card, CardContent, Typography, Slider, Button, Stack } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { PlatformConfig, TextLayer } from '@/types';

interface CanvasEditorProps {
  image: HTMLImageElement;
  platforms: PlatformConfig[];
  textLayers: TextLayer[];
  imageX: number;
  imageY: number;
  zoom: number;
  onPositionChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
}

export default function CanvasEditor({
  image,
  platforms,
  textLayers,
  imageX,
  imageY,
  zoom,
  onPositionChange,
  onZoomChange,
  onReset,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const displayScale = 0.5;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate canvas size based on the largest platform dimensions
    const maxWidth = Math.max(...platforms.map(p => p.width));
    const maxHeight = Math.max(...platforms.map(p => p.height));

    canvas.width = maxWidth * displayScale;
    canvas.height = maxHeight * displayScale;

    // Clear canvas
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const scale = zoom / 100;
    const imgWidth = image.width * scale * displayScale;
    const imgHeight = image.height * scale * displayScale;
    const imgX = (canvas.width / 2) + (imageX * displayScale) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * displayScale) - (imgHeight / 2);

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // Draw text layers
    textLayers.forEach(layer => {
      const fontSize = layer.fontSize * displayScale;
      let fontStyle = '';
      if (layer.isItalic) fontStyle += 'italic ';
      if (layer.isBold) fontStyle += 'bold ';
      
      ctx.font = `${fontStyle}${fontSize}px "${layer.fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const x = canvas.width / 2 + (layer.x * displayScale);
      const y = canvas.height / 2 + (layer.y * displayScale);

      if (layer.strokeWidth > 0) {
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = layer.strokeWidth * displayScale;
        ctx.lineJoin = 'round';
        ctx.strokeText(layer.text, x, y);
      }

      ctx.fillStyle = layer.color;
      ctx.fillText(layer.text, x, y);
    });

    // Draw platform frames
    const lineStyles = [
      { dash: [], width: 3 },
      { dash: [10, 5], width: 3 },
      { dash: [3, 3], width: 3 },
    ];

    platforms.forEach((platform, index) => {
      const frameWidth = platform.width * displayScale;
      const frameHeight = platform.height * displayScale;
      const x = (canvas.width - frameWidth) / 2;
      const y = (canvas.height - frameHeight) / 2;

      ctx.strokeStyle = platform.color;
      ctx.lineWidth = lineStyles[index % lineStyles.length].width;
      ctx.setLineDash(lineStyles[index % lineStyles.length].dash);
      ctx.strokeRect(x, y, frameWidth, frameHeight);

      // Draw label
      ctx.fillStyle = platform.color;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.setLineDash([]);
      const labelText = `${platform.name} (${platform.width}×${platform.height})`;
      const labelWidth = ctx.measureText(labelText).width + 10;
      ctx.fillRect(x, y - 22, labelWidth, 20);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(labelText, x + 5, y - 7);
    });

    ctx.setLineDash([]);
  }, [image, platforms, textLayers, imageX, imageY, zoom, displayScale]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imageX, y: e.clientY - imageY });
  }, [imageX, imageY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    onPositionChange(e.clientX - dragStart.x, e.clientY - dragStart.y);
  }, [isDragging, dragStart, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - imageX, y: touch.clientY - imageY });
  }, [imageX, imageY]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    onPositionChange(touch.clientX - dragStart.x, touch.clientY - dragStart.y);
  }, [isDragging, dragStart, onPositionChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🖼️ Éditeur - Déplacez et redimensionnez l&apos;image
        </Typography>

        <Box
          sx={{
            backgroundColor: '#1e293b',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              maxWidth: '100%',
              cursor: isDragging ? 'grabbing' : 'grab',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" sx={{ mt: 3 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, minWidth: 300 }}>
            <Typography>Zoom:</Typography>
            <Slider
              value={zoom}
              onChange={(_, value) => onZoomChange(value as number)}
              min={10}
              max={300}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
            <Typography sx={{ minWidth: 50, color: 'primary.main', fontWeight: 600 }}>
              {zoom}%
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
          >
            Réinitialiser
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
