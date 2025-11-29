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
const REFERENCE_SIZE = 400; // Reference size for ratio-based frame display

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

  // Calculate normalized frame dimensions based on aspect ratio
  // Frames with the same aspect ratio will have the same display size
  const normalizedFrames = useMemo(() => {
    return platforms.map(p => {
      const aspectRatio = p.width / p.height;
      // Normalize so that the larger dimension equals REFERENCE_SIZE
      let displayWidth, displayHeight;
      if (aspectRatio >= 1) {
        // Landscape or square
        displayWidth = REFERENCE_SIZE;
        displayHeight = REFERENCE_SIZE / aspectRatio;
      } else {
        // Portrait
        displayHeight = REFERENCE_SIZE;
        displayWidth = REFERENCE_SIZE * aspectRatio;
      }
      return {
        ...p,
        displayWidth,
        displayHeight,
        // Scale factor to convert from display coordinates to original coordinates
        scaleFactor: p.width / displayWidth,
      };
    });
  }, [platforms]);

  // Calculate canvas size to fit all normalized frames
  const maxDisplayWidth = Math.max(...normalizedFrames.map(f => f.displayWidth));
  const maxDisplayHeight = Math.max(...normalizedFrames.map(f => f.displayHeight));

  // Get the max original dimensions for calculations
  const maxWidth = Math.max(...platforms.map(p => p.width));
  const maxHeight = Math.max(...platforms.map(p => p.height));

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

    // Canvas uses normalized display dimensions
    canvas.width = maxDisplayWidth;
    canvas.height = maxDisplayHeight;

    ctx.fillStyle = averageColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // For image rendering, we need to use a common scale across all platforms
    // Use the largest platform's scale factor as reference
    const referenceFrame = normalizedFrames[0];
    const imageDisplayScale = 1 / referenceFrame.scaleFactor;
    
    const scale = (zoom / 100) * imageDisplayScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (canvas.width / 2) + (imageX * imageDisplayScale) - (imgWidth / 2);
    const imgY = (canvas.height / 2) + (imageY * imageDisplayScale) - (imgHeight / 2);

    // Draw semi-transparent image (outside frames)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Create clipping path from all normalized platform frames
    ctx.save();
    ctx.beginPath();
    normalizedFrames.forEach((frame) => {
      const x = (canvas.width - frame.displayWidth) / 2;
      const y = (canvas.height - frame.displayHeight) / 2;
      ctx.rect(x, y, frame.displayWidth, frame.displayHeight);
    });
    ctx.clip();
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    ctx.restore();

    // Draw platform frames with labels
    normalizedFrames.forEach((frame) => {
      const x = (canvas.width - frame.displayWidth) / 2;
      const y = (canvas.height - frame.displayHeight) / 2;

      ctx.strokeStyle = frame.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, frame.displayWidth, frame.displayHeight);

      // Label
      ctx.fillStyle = frame.color;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const label = frame.name;
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
  }, [image, normalizedFrames, imageX, imageY, zoom, averageColor, maxDisplayWidth, maxDisplayHeight]);

  useEffect(() => {
    render();
  }, [render]);

  // Convert client coordinates to canvas coordinates
  // Returns coordinates in the display coordinate system
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

  // Get the reference frame's image display scale
  const imageDisplayScale = useMemo(() => {
    if (normalizedFrames.length === 0) return 1;
    return 1 / normalizedFrames[0].scaleFactor;
  }, [normalizedFrames]);

  const getHandleAtPosition = useCallback((canvasX: number, canvasY: number): ResizeHandle => {
    const scale = (zoom / 100) * imageDisplayScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;

    const imgPosX = (maxDisplayWidth / 2) + (imageX * imageDisplayScale) - (imgWidth / 2);
    const imgPosY = (maxDisplayHeight / 2) + (imageY * imageDisplayScale) - (imgHeight / 2);

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
  }, [image, imageX, imageY, zoom, maxDisplayWidth, maxDisplayHeight, imageDisplayScale]);

  // Get the position of a handle in display coordinates
  const getHandlePosition = useCallback((handle: ResizeHandle) => {
    const scale = (zoom / 100) * imageDisplayScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgPosX = (maxDisplayWidth / 2) + (imageX * imageDisplayScale) - (imgWidth / 2);
    const imgPosY = (maxDisplayHeight / 2) + (imageY * imageDisplayScale) - (imgHeight / 2);

    switch (handle) {
      case 'nw': return { x: imgPosX, y: imgPosY };
      case 'ne': return { x: imgPosX + imgWidth, y: imgPosY };
      case 'sw': return { x: imgPosX, y: imgPosY + imgHeight };
      case 'se': return { x: imgPosX + imgWidth, y: imgPosY + imgHeight };
      default: return { x: 0, y: 0 };
    }
  }, [image, imageX, imageY, zoom, maxDisplayWidth, maxDisplayHeight, imageDisplayScale]);

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
      // Calculate the delta from the handle's initial position (in display coords)
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
      
      // Scale the delta by sensitivity factor (adjust for display scale)
      let newZoom = resizeStart.zoom + (delta / imageDisplayScale) * ZOOM_SENSITIVITY;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

      if (e.shiftKey) {
        // Resize from center - just update zoom, keep position
        onZoomChange(newZoom);
      } else {
        // Anchor the opposite corner (keep it fixed while resizing)
        // Work in display coordinates, then convert back
        const oldScale = (resizeStart.zoom / 100) * imageDisplayScale;
        const newScale = (newZoom / 100) * imageDisplayScale;
        
        const oldImgWidth = image.width * oldScale;
        const oldImgHeight = image.height * oldScale;
        const newImgWidth = image.width * newScale;
        const newImgHeight = image.height * newScale;
        
        // Calculate the position of the fixed (opposite) corner in display coordinates
        let fixedX: number, fixedY: number;
        if (activeHandle === 'nw') {
          fixedX = resizeStart.handleX + oldImgWidth;
          fixedY = resizeStart.handleY + oldImgHeight;
        } else if (activeHandle === 'ne') {
          fixedX = resizeStart.handleX - oldImgWidth;
          fixedY = resizeStart.handleY + oldImgHeight;
        } else if (activeHandle === 'sw') {
          fixedX = resizeStart.handleX + oldImgWidth;
          fixedY = resizeStart.handleY - oldImgHeight;
        } else {
          fixedX = resizeStart.handleX - oldImgWidth;
          fixedY = resizeStart.handleY - oldImgHeight;
        }
        
        // Calculate new image center in display coords
        let newCenterX: number, newCenterY: number;
        if (activeHandle === 'nw') {
          newCenterX = fixedX - newImgWidth/2;
          newCenterY = fixedY - newImgHeight/2;
        } else if (activeHandle === 'ne') {
          newCenterX = fixedX + newImgWidth/2;
          newCenterY = fixedY - newImgHeight/2;
        } else if (activeHandle === 'sw') {
          newCenterX = fixedX - newImgWidth/2;
          newCenterY = fixedY + newImgHeight/2;
        } else {
          newCenterX = fixedX + newImgWidth/2;
          newCenterY = fixedY + newImgHeight/2;
        }

        // Convert to original coordinates
        const newImgX = (newCenterX - maxDisplayWidth/2) / imageDisplayScale;
        const newImgY = (newCenterY - maxDisplayHeight/2) / imageDisplayScale;

        onZoomChange(newZoom);
        onPositionChange(newImgX, newImgY);
      }
    } else if (isDragging) {
      // Direct position update based on canvas coordinate change
      // Convert display deltas to original coordinates
      const deltaX = (canvasPos.x - dragStart.x) / imageDisplayScale;
      const deltaY = (canvasPos.y - dragStart.y) / imageDisplayScale;
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
  }, [activeHandle, isDragging, dragStart, resizeStart, image, maxDisplayWidth, maxDisplayHeight, imageDisplayScale, getCanvasCoords, getHandleAtPosition, onZoomChange, onPositionChange]);

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
      
      let newZoom = resizeStart.zoom + (delta / imageDisplayScale) * ZOOM_SENSITIVITY;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      
      // For touch, resize from center (similar to shift behavior)
      onZoomChange(newZoom);
    } else if (isDragging) {
      const deltaX = (canvasPos.x - dragStart.x) / imageDisplayScale;
      const deltaY = (canvasPos.y - dragStart.y) / imageDisplayScale;
      onPositionChange(dragStart.imgX + deltaX, dragStart.imgY + deltaY);
    }
  }, [activeHandle, isDragging, dragStart, resizeStart, imageDisplayScale, getCanvasCoords, onZoomChange, onPositionChange]);

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
              bgcolor: 'grey.200',
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
