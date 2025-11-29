'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Box, Card, CardContent, Stack, Button, ButtonGroup, Tooltip } from '@mui/material';
import CropFreeIcon from '@mui/icons-material/CropFree';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import AlignVerticalCenterIcon from '@mui/icons-material/AlignVerticalCenter';
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

interface DragState {
  x: number;
  y: number;
  imgX: number;
  imgY: number;
}

interface ResizeState {
  zoom: number;
  x: number;
  y: number;
  imgX: number;
  imgY: number;
  handleX: number;
  handleY: number;
}

// Constants
const ZOOM_SENSITIVITY = 0.3;
const MIN_ZOOM = 10;
const MAX_ZOOM = 500;
const HANDLE_SIZE = 10; // Visual size of resize handles
const HANDLE_HIT_AREA = 15; // Hit detection area (slightly larger for easier interaction)
const MAX_DISPLAY_WIDTH = 600;
const MAX_DISPLAY_HEIGHT = 500;

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
  const [dragStart, setDragStart] = useState<DragState>({ x: 0, y: 0, imgX: 0, imgY: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState<ResizeState>({ zoom: 100, x: 0, y: 0, imgX: 0, imgY: 0, handleX: 0, handleY: 0 });

  // Calculate canvas size to fit all platforms with common center
  // Use the max dimensions to show all frames
  const maxWidth = Math.max(...platforms.map(p => p.width));
  const maxHeight = Math.max(...platforms.map(p => p.height));
  
  // Calculate the canvas display scale to fit in viewport
  const displayScale = useMemo(() => {
    const scaleX = MAX_DISPLAY_WIDTH / maxWidth;
    const scaleY = MAX_DISPLAY_HEIGHT / maxHeight;
    return Math.min(scaleX, scaleY, 1);
  }, [maxWidth, maxHeight]);

  // Reset image to cover mode (image covers all frames)
  const handleCoverMode = useCallback(() => {
    if (!image) return;
    // Calculate zoom to cover the largest frame
    const scaleX = maxWidth / image.width;
    const scaleY = maxHeight / image.height;
    const coverZoom = Math.max(scaleX, scaleY) * 100;
    onZoomChange(coverZoom);
    onPositionChange(0, 0);
  }, [image, maxWidth, maxHeight, onZoomChange, onPositionChange]);

  // Reset image to fit/contain mode (image fits within frames)
  const handleFitMode = useCallback(() => {
    if (!image) return;
    const minWidth = Math.min(...platforms.map(p => p.width));
    const minHeight = Math.min(...platforms.map(p => p.height));
    const scaleX = minWidth / image.width;
    const scaleY = minHeight / image.height;
    const fitZoom = Math.min(scaleX, scaleY) * 100;
    onZoomChange(fitZoom);
    onPositionChange(0, 0);
  }, [image, platforms, onZoomChange, onPositionChange]);

  // Center horizontally
  const handleCenterH = useCallback(() => {
    onPositionChange(0, imageY);
  }, [imageY, onPositionChange]);

  // Center vertically
  const handleCenterV = useCallback(() => {
    onPositionChange(imageX, 0);
  }, [imageX, onPositionChange]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas at display scale
    canvas.width = maxWidth * displayScale;
    canvas.height = maxHeight * displayScale;

    ctx.fillStyle = averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = (zoom / 100) * displayScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + (imageX * displayScale) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * displayScale) - (imgHeight / 2);

    // Draw semi-transparent image (outside frames)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Create clipping path from all platform frames
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

      ctx.strokeStyle = platform.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, frameWidth, frameHeight);

      // Label
      ctx.fillStyle = platform.color;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const label = platform.name;
      const labelPadding = 4;
      const labelMetrics = ctx.measureText(label);
      ctx.fillRect(x, y, labelMetrics.width + labelPadding * 2, 18);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + labelPadding, y + 3);
    });

    // Draw resize handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.5;

    const handles = [
      { x: imgX, y: imgY },
      { x: imgX + imgWidth, y: imgY },
      { x: imgX, y: imgY + imgHeight },
      { x: imgX + imgWidth, y: imgY + imgHeight },
    ];

    handles.forEach((handle) => {
      ctx.beginPath();
      ctx.rect(handle.x - HANDLE_SIZE / 2, handle.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.fill();
      ctx.stroke();
    });
  }, [image, platforms, imageX, imageY, zoom, averageColor, maxWidth, maxHeight, displayScale]);

  useEffect(() => {
    render();
  }, [render]);

  // Convert client coordinates to canvas coordinates (accounting for display scale)
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Return coordinates in the original (unscaled) coordinate system
    return {
      x: ((clientX - rect.left) * scaleX) / displayScale,
      y: ((clientY - rect.top) * scaleY) / displayScale,
    };
  }, [displayScale]);

  const getHandleAtPosition = useCallback((canvasX: number, canvasY: number): ResizeHandle => {
    const scale = zoom / 100;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;

    const imgPosX = (maxWidth / 2) + imageX - (imgWidth / 2);
    const imgPosY = (maxHeight / 2) + imageY - (imgHeight / 2);

    // HANDLE_HIT_AREA is larger than HANDLE_SIZE for easier interaction
    const handles: { pos: ResizeHandle; x: number; y: number }[] = [
      { pos: 'nw', x: imgPosX, y: imgPosY },
      { pos: 'ne', x: imgPosX + imgWidth, y: imgPosY },
      { pos: 'sw', x: imgPosX, y: imgPosY + imgHeight },
      { pos: 'se', x: imgPosX + imgWidth, y: imgPosY + imgHeight },
    ];

    for (const handle of handles) {
      if (Math.abs(canvasX - handle.x) < HANDLE_HIT_AREA && Math.abs(canvasY - handle.y) < HANDLE_HIT_AREA) {
        return handle.pos;
      }
    }
    return null;
  }, [image, imageX, imageY, zoom, maxWidth, maxHeight]);

  // Get the position of a handle in original coordinates
  const getHandlePosition = useCallback((handle: ResizeHandle) => {
    const scale = zoom / 100;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgPosX = (maxWidth / 2) + imageX - (imgWidth / 2);
    const imgPosY = (maxHeight / 2) + imageY - (imgHeight / 2);

    switch (handle) {
      case 'nw': return { x: imgPosX, y: imgPosY };
      case 'ne': return { x: imgPosX + imgWidth, y: imgPosY };
      case 'sw': return { x: imgPosX, y: imgPosY + imgHeight };
      case 'se': return { x: imgPosX + imgWidth, y: imgPosY + imgHeight };
      default: return { x: 0, y: 0 };
    }
  }, [image, imageX, imageY, zoom, maxWidth, maxHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);

    if (handle) {
      const handlePos = getHandlePosition(handle);
      setActiveHandle(handle);
      setResizeStart({ 
        zoom, 
        x: canvasPos.x, 
        y: canvasPos.y, 
        imgX: imageX, 
        imgY: imageY,
        handleX: handlePos.x,
        handleY: handlePos.y,
      });
    } else {
      setIsDragging(true);
      setDragStart({ x: canvasPos.x, y: canvasPos.y, imgX: imageX, imgY: imageY });
    }
  }, [imageX, imageY, zoom, getCanvasCoords, getHandleAtPosition, getHandlePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    
    if (activeHandle) {
      // Calculate the delta from the handle's initial position
      const deltaX = canvasPos.x - resizeStart.x;
      const deltaY = canvasPos.y - resizeStart.y;
      
      // Calculate zoom delta based on handle direction:
      // - SE corner: moving right+down increases size (positive diagonal)
      // - NW corner: moving left+up increases size (negative diagonal)
      // - NE corner: moving right increases, moving down decreases (X positive, Y negative)
      // - SW corner: moving left decreases, moving down increases (X negative, Y positive)
      let delta = 0;
      if (activeHandle === 'se') delta = (deltaX + deltaY) / 2;
      else if (activeHandle === 'nw') delta = -(deltaX + deltaY) / 2;
      else if (activeHandle === 'ne') delta = (deltaX - deltaY) / 2;
      else if (activeHandle === 'sw') delta = (-deltaX + deltaY) / 2;
      
      // Scale the delta by sensitivity factor
      let newZoom = resizeStart.zoom + delta * ZOOM_SENSITIVITY;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      if (e.shiftKey) {
        // Resize from center - just update zoom, keep position
        onZoomChange(newZoom);
      } else {
        // Anchor the opposite corner (keep it fixed while resizing)
        const oldScale = resizeStart.zoom / 100;
        const newScale = newZoom / 100;
        
        const oldImgWidth = image.width * oldScale;
        const oldImgHeight = image.height * oldScale;
        const newImgWidth = image.width * newScale;
        const newImgHeight = image.height * newScale;
        
        // Calculate the position of the fixed (opposite) corner in original coordinates
        // Each handle has a diagonally opposite corner that stays anchored
        let fixedX: number, fixedY: number;
        if (activeHandle === 'nw') {
          // Dragging NW -> SE corner stays fixed
          fixedX = resizeStart.handleX + oldImgWidth;
          fixedY = resizeStart.handleY + oldImgHeight;
        } else if (activeHandle === 'ne') {
          // Dragging NE -> SW corner stays fixed
          fixedX = resizeStart.handleX - oldImgWidth;
          fixedY = resizeStart.handleY + oldImgHeight;
        } else if (activeHandle === 'sw') {
          // Dragging SW -> NE corner stays fixed
          fixedX = resizeStart.handleX + oldImgWidth;
          fixedY = resizeStart.handleY - oldImgHeight;
        } else {
          // Dragging SE -> NW corner stays fixed
          fixedX = resizeStart.handleX - oldImgWidth;
          fixedY = resizeStart.handleY - oldImgHeight;
        }
        
        // Calculate the new image center position so that the fixed corner stays in place
        // The image center is calculated from the fixed corner + half the new image dimensions
        let newImgX: number, newImgY: number;
        if (activeHandle === 'nw') {
          // NW moves, SE stays -> image center is SE corner - half dimensions
          newImgX = (fixedX - newImgWidth/2) - maxWidth/2;
          newImgY = (fixedY - newImgHeight/2) - maxHeight/2;
        } else if (activeHandle === 'ne') {
          // NE moves, SW stays -> image center is SW corner + (width/2, -height/2)
          newImgX = (fixedX + newImgWidth/2) - maxWidth/2;
          newImgY = (fixedY - newImgHeight/2) - maxHeight/2;
        } else if (activeHandle === 'sw') {
          // SW moves, NE stays -> image center is NE corner + (-width/2, height/2)
          newImgX = (fixedX - newImgWidth/2) - maxWidth/2;
          newImgY = (fixedY + newImgHeight/2) - maxHeight/2;
        } else {
          // SE moves, NW stays -> image center is NW corner + half dimensions
          newImgX = (fixedX + newImgWidth/2) - maxWidth/2;
          newImgY = (fixedY + newImgHeight/2) - maxHeight/2;
        }

        onZoomChange(newZoom);
        onPositionChange(newImgX, newImgY);
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
  }, [activeHandle, isDragging, dragStart, resizeStart, image, maxWidth, maxHeight, getCanvasCoords, getHandleAtPosition, onZoomChange, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
    const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);

    if (handle) {
      const handlePos = getHandlePosition(handle);
      setActiveHandle(handle);
      setResizeStart({ 
        zoom, 
        x: canvasPos.x, 
        y: canvasPos.y, 
        imgX: imageX, 
        imgY: imageY,
        handleX: handlePos.x,
        handleY: handlePos.y,
      });
    } else {
      setIsDragging(true);
      setDragStart({ x: canvasPos.x, y: canvasPos.y, imgX: imageX, imgY: imageY });
    }
  }, [imageX, imageY, zoom, getCanvasCoords, getHandleAtPosition, getHandlePosition]);

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
      
      let newZoom = resizeStart.zoom + delta * ZOOM_SENSITIVITY;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      
      // For touch, resize from center (similar to shift behavior)
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
    <Card variant="outlined" sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack spacing={1}>
          {/* Control buttons */}
          <Stack direction="row" spacing={1} justifyContent="center">
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Couverture (remplir tous les cadres)">
                <Button onClick={handleCoverMode}>
                  <CropFreeIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Contenu (image visible entièrement)">
                <Button onClick={handleFitMode}>
                  <FitScreenIcon fontSize="small" />
                </Button>
              </Tooltip>
            </ButtonGroup>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Centrer horizontalement">
                <Button onClick={handleCenterH}>
                  <AlignHorizontalCenterIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Centrer verticalement">
                <Button onClick={handleCenterV}>
                  <AlignVerticalCenterIcon fontSize="small" />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Stack>

          <Box
            ref={containerRef}
            sx={{
              backgroundColor: '#f0f0f0',
              borderRadius: 1,
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
}
