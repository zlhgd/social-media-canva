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
  onTextLayerPositionChange?: (layerId: number, x: number, y: number) => void;
}

// Helper function to draw rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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
  onTextLayerPositionChange,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedTextLayerId, setDraggedTextLayerId] = useState<number | null>(null);

  const displayScale = 0.5;

  // Store text layer bounding boxes for hit testing
  const textLayerBoundsRef = useRef<Map<number, { x: number; y: number; width: number; height: number }>>(new Map());

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

    // Clear and rebuild text layer bounds
    textLayerBoundsRef.current.clear();

    // Draw text layers with background
    textLayers.forEach(layer => {
      const fontSize = layer.fontSize * displayScale;
      const padding = layer.padding * displayScale;
      const borderRadius = layer.borderRadius * displayScale;
      
      let fontStyle = '';
      if (layer.isItalic) fontStyle += 'italic ';
      if (layer.isBold) fontStyle += 'bold ';
      
      ctx.font = `${fontStyle}${fontSize}px "${layer.fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const x = canvas.width / 2 + (layer.x * displayScale);
      const y = canvas.height / 2 + (layer.y * displayScale);

      // Measure text for background
      const textMetrics = ctx.measureText(layer.text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // Calculate background bounds
      const bgX = x - textWidth / 2 - padding;
      const bgY = y - textHeight / 2 - padding;
      const bgWidth = textWidth + padding * 2;
      const bgHeight = textHeight + padding * 2;

      // Store bounds for hit testing (in canvas coordinates)
      textLayerBoundsRef.current.set(layer.id, {
        x: bgX,
        y: bgY,
        width: bgWidth,
        height: bgHeight,
      });

      // Draw background with rounded corners
      if (layer.backgroundColor && layer.backgroundColor !== 'transparent') {
        ctx.fillStyle = layer.backgroundColor;
        drawRoundedRect(ctx, bgX, bgY, bgWidth, bgHeight, borderRadius);
      }

      // Draw text
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

  // Helper function to get canvas-relative mouse position
  const getCanvasPosition = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Check if a point is inside any text layer
  const getTextLayerAtPosition = useCallback((canvasX: number, canvasY: number): number | null => {
    // Check in reverse order (top-most layer first)
    const layerIds = Array.from(textLayerBoundsRef.current.keys()).reverse();
    for (const layerId of layerIds) {
      const bounds = textLayerBoundsRef.current.get(layerId);
      if (bounds) {
        if (
          canvasX >= bounds.x &&
          canvasX <= bounds.x + bounds.width &&
          canvasY >= bounds.y &&
          canvasY <= bounds.y + bounds.height
        ) {
          return layerId;
        }
      }
    }
    return null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvasPos = getCanvasPosition(e.clientX, e.clientY);
    const textLayerId = getTextLayerAtPosition(canvasPos.x, canvasPos.y);
    
    if (textLayerId !== null && onTextLayerPositionChange) {
      // Dragging a text layer
      const layer = textLayers.find(l => l.id === textLayerId);
      if (layer) {
        setDraggedTextLayerId(textLayerId);
        setIsDragging(true);
        setDragStart({ x: e.clientX - layer.x, y: e.clientY - layer.y });
      }
    } else {
      // Dragging the image
      setDraggedTextLayerId(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX - imageX, y: e.clientY - imageY });
    }
  }, [imageX, imageY, textLayers, getCanvasPosition, getTextLayerAtPosition, onTextLayerPositionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    if (draggedTextLayerId !== null && onTextLayerPositionChange) {
      // Moving a text layer
      onTextLayerPositionChange(
        draggedTextLayerId,
        e.clientX - dragStart.x,
        e.clientY - dragStart.y
      );
    } else {
      // Moving the image
      onPositionChange(e.clientX - dragStart.x, e.clientY - dragStart.y);
    }
  }, [isDragging, dragStart, draggedTextLayerId, onPositionChange, onTextLayerPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedTextLayerId(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const canvasPos = getCanvasPosition(touch.clientX, touch.clientY);
    const textLayerId = getTextLayerAtPosition(canvasPos.x, canvasPos.y);
    
    if (textLayerId !== null && onTextLayerPositionChange) {
      // Dragging a text layer
      const layer = textLayers.find(l => l.id === textLayerId);
      if (layer) {
        setDraggedTextLayerId(textLayerId);
        setIsDragging(true);
        setDragStart({ x: touch.clientX - layer.x, y: touch.clientY - layer.y });
      }
    } else {
      // Dragging the image
      setDraggedTextLayerId(null);
      setIsDragging(true);
      setDragStart({ x: touch.clientX - imageX, y: touch.clientY - imageY });
    }
  }, [imageX, imageY, textLayers, getCanvasPosition, getTextLayerAtPosition, onTextLayerPositionChange]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    if (draggedTextLayerId !== null && onTextLayerPositionChange) {
      // Moving a text layer
      onTextLayerPositionChange(
        draggedTextLayerId,
        touch.clientX - dragStart.x,
        touch.clientY - dragStart.y
      );
    } else {
      // Moving the image
      onPositionChange(touch.clientX - dragStart.x, touch.clientY - dragStart.y);
    }
  }, [isDragging, dragStart, draggedTextLayerId, onPositionChange, onTextLayerPositionChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedTextLayerId(null);
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🖼️ Éditeur - Déplacez l{"'"}image ou le texte
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
