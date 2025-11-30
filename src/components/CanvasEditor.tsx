'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Stack } from '@mui/material';
import { PlatformConfig } from '@/types';
import CanvasControls from './CanvasControls';
import { useNormalizedFrames } from './useNormalizedFrames';
import { useCanvasControls } from './useCanvasControls';
import { renderCanvas } from './canvas-rendering';
import { useCanvasInteractions } from './useCanvasInteractions';

interface CanvasEditorProps {
  image: HTMLImageElement;
  platforms: PlatformConfig[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
  onPositionChange: (_x: number, _y: number) => void;
  onZoomChange: (_zoom: number) => void;
  onReplaceImage?: () => void;
}

const CanvasEditor = ({
  image,
  platforms,
  imageX,
  imageY,
  zoom,
  averageColor,
  onPositionChange,
  onZoomChange,
  onReplaceImage,
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { exportDimensions, normalizedFrames, maxDisplayWidth, maxDisplayHeight, imageDisplayScale } = useNormalizedFrames(image, platforms);
  const { handleCoverMode, handleCenterH, handleCenterV } = useCanvasControls(image, exportDimensions, imageX, imageY, onPositionChange, onZoomChange);
  const {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCanvasInteractions({
    canvasRef,
    image,
    imageX,
    imageY,
    zoom,
    imageDisplayScale,
    onPositionChange,
    onZoomChange,
  });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    renderCanvas(canvas, image, normalizedFrames, imageX, imageY, zoom, averageColor, maxDisplayWidth, maxDisplayHeight);
  }, [image, normalizedFrames, imageX, imageY, zoom, averageColor, maxDisplayWidth, maxDisplayHeight]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack spacing={1}>
          <CanvasControls 
            onCoverMode={handleCoverMode}
            onCenterH={handleCenterH}
            onCenterV={handleCenterV}
            onReplaceImage={onReplaceImage}
          />

          <Box
            ref={containerRef}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'auto',
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
                display: 'block',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CanvasEditor;
