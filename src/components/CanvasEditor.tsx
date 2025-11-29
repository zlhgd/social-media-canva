'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Box, Card, CardContent, Slider, Button, Stack, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { PlatformConfig } from '@/types';

interface CanvasEditorProps {
  image: HTMLImageElement;
  platforms: PlatformConfig[];
  imageX: number;
  imageY: number;
  zoom: number;
  averageColor: string;
  onPositionChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

export default function CanvasEditor({
  image,
  platforms,
  imageX,
  imageY,
  zoom,
  averageColor,
  onPositionChange,
  onZoomChange,
  onReset,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState({ zoom: 100, x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastPositionRef = useRef({ x: imageX, y: imageY });

  const displayScale = 0.5;

  // Calculate canvas dimensions
  const maxWidth = Math.max(...platforms.map(p => p.width));
  const maxHeight = Math.max(...platforms.map(p => p.height));

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = maxWidth * displayScale;
    canvas.height = maxHeight * displayScale;

    // Clear with average color as background
    ctx.fillStyle = averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const scale = zoom / 100;
    const imgWidth = image.width * scale * displayScale;
    const imgHeight = image.height * scale * displayScale;
    const imgX = (canvas.width / 2) + (imageX * displayScale) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * displayScale) - (imgHeight / 2);

    // Draw semi-transparent overlay outside all frames first
    ctx.save();
    
    // Create a clipping region for the union of all platform frames
    ctx.beginPath();
    platforms.forEach((platform) => {
      const frameWidth = platform.width * displayScale;
      const frameHeight = platform.height * displayScale;
      const x = (canvas.width - frameWidth) / 2;
      const y = (canvas.height - frameHeight) / 2;
      ctx.rect(x, y, frameWidth, frameHeight);
    });
    ctx.clip();
    
    // Draw image inside clip
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Draw image outside with lower opacity
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Redraw full opacity inside frames
    ctx.save();
    ctx.beginPath();
    platforms.forEach((platform) => {
      const frameWidth = platform.width * displayScale;
      const frameHeight = platform.height * displayScale;
      const x = (canvas.width - frameWidth) / 2;
      const y = (canvas.height - frameHeight) / 2;
      ctx.rect(x, y, frameWidth, frameHeight);
    });
    ctx.clip();
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Draw platform frames with labels
    platforms.forEach((platform) => {
      const frameWidth = platform.width * displayScale;
      const frameHeight = platform.height * displayScale;
      const x = (canvas.width - frameWidth) / 2;
      const y = (canvas.height - frameHeight) / 2;

      // Draw frame border
      ctx.strokeStyle = platform.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, frameWidth, frameHeight);

      // Draw label at corner
      ctx.fillStyle = platform.color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const label = platform.shortName;
      const labelPadding = 4;
      const labelMetrics = ctx.measureText(label);
      const labelWidth = labelMetrics.width + labelPadding * 2;
      const labelHeight = 16;
      
      ctx.fillRect(x, y, labelWidth, labelHeight);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + labelPadding, y + 2);
    });

    // Draw resize handles on image corners
    const handleSize = 10;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;

    const handles = [
      { x: imgX, y: imgY }, // NW
      { x: imgX + imgWidth, y: imgY }, // NE
      { x: imgX, y: imgY + imgHeight }, // SW
      { x: imgX + imgWidth, y: imgY + imgHeight }, // SE
    ];

    handles.forEach((handle) => {
      ctx.beginPath();
      ctx.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.fill();
      ctx.stroke();
    });
  }, [image, platforms, imageX, imageY, zoom, averageColor, maxWidth, maxHeight, displayScale]);

  useEffect(() => {
    render();
  }, [render]);

  // Smooth position update using RAF
  const updatePositionSmooth = useCallback((newX: number, newY: number) => {
    lastPositionRef.current = { x: newX, y: newY };
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(() => {
        onPositionChange(lastPositionRef.current.x, lastPositionRef.current.y);
        animationFrameRef.current = null;
      });
    }
  }, [onPositionChange]);

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

  const getHandleAtPosition = useCallback((canvasX: number, canvasY: number): ResizeHandle => {
    const scale = zoom / 100;
    const imgWidth = image.width * scale * displayScale;
    const imgHeight = image.height * scale * displayScale;
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const imgX = (canvas.width / 2) + (imageX * displayScale) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * displayScale) - (imgHeight / 2);

    const handleSize = 15; // Larger hit area
    const handles: { pos: ResizeHandle; x: number; y: number }[] = [
      { pos: 'nw', x: imgX, y: imgY },
      { pos: 'ne', x: imgX + imgWidth, y: imgY },
      { pos: 'sw', x: imgX, y: imgY + imgHeight },
      { pos: 'se', x: imgX + imgWidth, y: imgY + imgHeight },
    ];

    for (const handle of handles) {
      if (
        Math.abs(canvasX - handle.x) < handleSize &&
        Math.abs(canvasY - handle.y) < handleSize
      ) {
        return handle.pos;
      }
    }
    return null;
  }, [image, imageX, imageY, zoom, displayScale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvasPos = getCanvasPosition(e.clientX, e.clientY);
    const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);

    if (handle) {
      setActiveHandle(handle);
      setResizeStart({ zoom, x: e.clientX, y: e.clientY });
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imageX, y: e.clientY - imageY });
    }
  }, [imageX, imageY, zoom, getCanvasPosition, getHandleAtPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (activeHandle) {
      // Resize with homothetic scaling
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const delta = (deltaX + deltaY) / 2;
      
      let newZoom = resizeStart.zoom + delta * 0.5;
      newZoom = Math.max(10, Math.min(300, newZoom));

      // If shift is held, resize from center
      if (e.shiftKey) {
        onZoomChange(newZoom);
      } else {
        // Adjust position to keep the opposite corner fixed
        const scale = newZoom / 100;
        const oldScale = resizeStart.zoom / 100;
        const scaleDiff = scale - oldScale;
        
        let offsetX = 0, offsetY = 0;
        if (activeHandle.includes('w')) offsetX = image.width * scaleDiff / 2;
        else offsetX = -image.width * scaleDiff / 2;
        
        if (activeHandle.includes('n')) offsetY = image.height * scaleDiff / 2;
        else offsetY = -image.height * scaleDiff / 2;

        onZoomChange(newZoom);
        updatePositionSmooth(imageX + offsetX, imageY + offsetY);
      }
    } else if (isDragging) {
      updatePositionSmooth(e.clientX - dragStart.x, e.clientY - dragStart.y);
    } else {
      // Update cursor based on handle hover
      const canvasPos = getCanvasPosition(e.clientX, e.clientY);
      const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);
      const canvas = canvasRef.current;
      if (canvas) {
        if (handle === 'nw' || handle === 'se') {
          canvas.style.cursor = 'nwse-resize';
        } else if (handle === 'ne' || handle === 'sw') {
          canvas.style.cursor = 'nesw-resize';
        } else {
          canvas.style.cursor = 'grab';
        }
      }
    }
  }, [activeHandle, isDragging, dragStart, resizeStart, image, imageX, imageY, getCanvasPosition, getHandleAtPosition, onZoomChange, updatePositionSmooth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      onPositionChange(lastPositionRef.current.x, lastPositionRef.current.y);
    }
  }, [onPositionChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const canvasPos = getCanvasPosition(touch.clientX, touch.clientY);
    const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);

    if (handle) {
      setActiveHandle(handle);
      setResizeStart({ zoom, x: touch.clientX, y: touch.clientY });
    } else {
      setIsDragging(true);
      setDragStart({ x: touch.clientX - imageX, y: touch.clientY - imageY });
    }
  }, [imageX, imageY, zoom, getCanvasPosition, getHandleAtPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (activeHandle) {
      const deltaX = touch.clientX - resizeStart.x;
      const deltaY = touch.clientY - resizeStart.y;
      const delta = (deltaX + deltaY) / 2;
      
      let newZoom = resizeStart.zoom + delta * 0.5;
      newZoom = Math.max(10, Math.min(300, newZoom));
      onZoomChange(newZoom);
    } else if (isDragging) {
      updatePositionSmooth(touch.clientX - dragStart.x, touch.clientY - dragStart.y);
    }
  }, [activeHandle, isDragging, dragStart, resizeStart, onZoomChange, updatePositionSmooth]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      onPositionChange(lastPositionRef.current.x, lastPositionRef.current.y);
    }
  }, [onPositionChange]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Box
          ref={containerRef}
          sx={{
            backgroundColor: '#f0f0f0',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            minHeight: 300,
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
            }}
          />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 40 }}>Zoom:</Typography>
          <Slider
            value={zoom}
            onChange={(_, value) => onZoomChange(value as number)}
            min={10}
            max={300}
            size="small"
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
            sx={{ flex: 1 }}
          />
          <Typography variant="body2" sx={{ minWidth: 45, color: 'primary.main', fontWeight: 600 }}>
            {zoom}%
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
          >
            Reset
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
