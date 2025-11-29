'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Box, Card, CardContent } from '@mui/material';
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
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, imgX: 0, imgY: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState({ zoom: 100, x: 0, y: 0, imgX: 0, imgY: 0 });

  // Full size canvas (no scaling)
  const maxWidth = Math.max(...platforms.map(p => p.width));
  const maxHeight = Math.max(...platforms.map(p => p.height));

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Full size canvas
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    ctx.fillStyle = averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = zoom / 100;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + imageX - (imgWidth / 2);
    const imgY = (canvas.height / 2) + imageY - (imgHeight / 2);

    // Draw semi-transparent outside frames
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Draw full opacity inside frames
    ctx.save();
    ctx.beginPath();
    platforms.forEach((platform) => {
      const frameWidth = platform.width;
      const frameHeight = platform.height;
      const x = (canvas.width - frameWidth) / 2;
      const y = (canvas.height - frameHeight) / 2;
      ctx.rect(x, y, frameWidth, frameHeight);
    });
    ctx.clip();
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Draw platform frames with labels
    platforms.forEach((platform) => {
      const frameWidth = platform.width;
      const frameHeight = platform.height;
      const x = (canvas.width - frameWidth) / 2;
      const y = (canvas.height - frameHeight) / 2;

      ctx.strokeStyle = platform.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, frameWidth, frameHeight);

      // Label
      ctx.fillStyle = platform.color;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const label = platform.name;
      const labelPadding = 4;
      const labelMetrics = ctx.measureText(label);
      ctx.fillRect(x, y, labelMetrics.width + labelPadding * 2, 20);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + labelPadding, y + 3);
    });

    // Draw resize handles
    const handleSize = 12;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;

    const handles = [
      { x: imgX, y: imgY },
      { x: imgX + imgWidth, y: imgY },
      { x: imgX, y: imgY + imgHeight },
      { x: imgX + imgWidth, y: imgY + imgHeight },
    ];

    handles.forEach((handle) => {
      ctx.beginPath();
      ctx.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.fill();
      ctx.stroke();
    });
  }, [image, platforms, imageX, imageY, zoom, averageColor, maxWidth, maxHeight]);

  useEffect(() => {
    render();
  }, [render]);

  // Convert client coordinates to canvas coordinates
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
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
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const imgPosX = (canvas.width / 2) + imageX - (imgWidth / 2);
    const imgPosY = (canvas.height / 2) + imageY - (imgHeight / 2);

    const handleSize = 20;
    const handles: { pos: ResizeHandle; x: number; y: number }[] = [
      { pos: 'nw', x: imgPosX, y: imgPosY },
      { pos: 'ne', x: imgPosX + imgWidth, y: imgPosY },
      { pos: 'sw', x: imgPosX, y: imgPosY + imgHeight },
      { pos: 'se', x: imgPosX + imgWidth, y: imgPosY + imgHeight },
    ];

    for (const handle of handles) {
      if (Math.abs(canvasX - handle.x) < handleSize && Math.abs(canvasY - handle.y) < handleSize) {
        return handle.pos;
      }
    }
    return null;
  }, [image, imageX, imageY, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);

    if (handle) {
      setActiveHandle(handle);
      setResizeStart({ zoom, x: canvasPos.x, y: canvasPos.y, imgX: imageX, imgY: imageY });
    } else {
      setIsDragging(true);
      setDragStart({ x: canvasPos.x, y: canvasPos.y, imgX: imageX, imgY: imageY });
    }
  }, [imageX, imageY, zoom, getCanvasCoords, getHandleAtPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    
    if (activeHandle) {
      // Calculate diagonal distance for zoom
      const deltaX = canvasPos.x - resizeStart.x;
      const deltaY = canvasPos.y - resizeStart.y;
      
      // Use the diagonal direction based on which handle is being dragged
      let delta = 0;
      if (activeHandle === 'se') delta = (deltaX + deltaY) / 2;
      else if (activeHandle === 'nw') delta = -(deltaX + deltaY) / 2;
      else if (activeHandle === 'ne') delta = (deltaX - deltaY) / 2;
      else if (activeHandle === 'sw') delta = (-deltaX + deltaY) / 2;
      
      let newZoom = resizeStart.zoom + delta * 0.15;
      newZoom = Math.max(10, Math.min(500, newZoom));

      if (e.shiftKey) {
        // Resize from center - just update zoom
        onZoomChange(newZoom);
      } else {
        // Keep opposite corner fixed
        const newScale = newZoom / 100;
        const oldScale = resizeStart.zoom / 100;
        const scaleDiff = newScale - oldScale;
        
        let offsetX = 0, offsetY = 0;
        
        // Calculate offset to keep opposite corner in place
        if (activeHandle === 'nw') {
          offsetX = image.width * scaleDiff / 2;
          offsetY = image.height * scaleDiff / 2;
        } else if (activeHandle === 'ne') {
          offsetX = -image.width * scaleDiff / 2;
          offsetY = image.height * scaleDiff / 2;
        } else if (activeHandle === 'sw') {
          offsetX = image.width * scaleDiff / 2;
          offsetY = -image.height * scaleDiff / 2;
        } else if (activeHandle === 'se') {
          offsetX = -image.width * scaleDiff / 2;
          offsetY = -image.height * scaleDiff / 2;
        }

        onZoomChange(newZoom);
        onPositionChange(resizeStart.imgX + offsetX, resizeStart.imgY + offsetY);
      }
    } else if (isDragging) {
      // Direct position update based on canvas coordinate change
      const deltaX = canvasPos.x - dragStart.x;
      const deltaY = canvasPos.y - dragStart.y;
      onPositionChange(dragStart.imgX + deltaX, dragStart.imgY + deltaY);
    } else {
      // Update cursor based on hover
      const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);
      const canvas = canvasRef.current;
      if (canvas) {
        if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
        else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
        else canvas.style.cursor = 'grab';
      }
    }
  }, [activeHandle, isDragging, dragStart, resizeStart, image, getCanvasCoords, getHandleAtPosition, onZoomChange, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
    const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);

    if (handle) {
      setActiveHandle(handle);
      setResizeStart({ zoom, x: canvasPos.x, y: canvasPos.y, imgX: imageX, imgY: imageY });
    } else {
      setIsDragging(true);
      setDragStart({ x: canvasPos.x, y: canvasPos.y, imgX: imageX, imgY: imageY });
    }
  }, [imageX, imageY, zoom, getCanvasCoords, getHandleAtPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
    
    if (activeHandle) {
      const deltaX = canvasPos.x - resizeStart.x;
      const deltaY = canvasPos.y - resizeStart.y;
      
      let delta = 0;
      if (activeHandle === 'se') delta = (deltaX + deltaY) / 2;
      else if (activeHandle === 'nw') delta = -(deltaX + deltaY) / 2;
      else if (activeHandle === 'ne') delta = (deltaX - deltaY) / 2;
      else if (activeHandle === 'sw') delta = (-deltaX + deltaY) / 2;
      
      let newZoom = resizeStart.zoom + delta * 0.15;
      newZoom = Math.max(10, Math.min(500, newZoom));
      onZoomChange(newZoom);
    } else if (isDragging) {
      const deltaX = canvasPos.x - dragStart.x;
      const deltaY = canvasPos.y - dragStart.y;
      onPositionChange(dragStart.imgX + deltaX, dragStart.imgY + deltaY);
    }
  }, [activeHandle, isDragging, dragStart, resizeStart, getCanvasCoords, onZoomChange, onPositionChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  return (
    <Card sx={{ borderRadius: 0.5 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box
          ref={containerRef}
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: 0.5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            maxHeight: '70vh',
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
      </CardContent>
    </Card>
  );
}
