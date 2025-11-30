import { useCallback, useState, RefObject } from 'react';

// Types
export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

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
export const HANDLE_SIZE = 10; // Visual size of resize handles
const HANDLE_HIT_AREA = 15; // Hit detection area (slightly larger for easier interaction)

interface UseCanvasInteractionsProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement;
  imageX: number;
  imageY: number;
  zoom: number;
  imageDisplayScale: number;
  onPositionChange: (_x: number, _y: number) => void;
  onZoomChange: (_zoom: number) => void;
}

export const useCanvasInteractions = ({
  canvasRef,
  image,
  imageX,
  imageY,
  zoom,
  imageDisplayScale,
  onPositionChange,
  onZoomChange,
}: UseCanvasInteractionsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragState>({ x: 0, y: 0, imgX: 0, imgY: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState<ResizeState>({ zoom: 100, x: 0, y: 0, imgX: 0, imgY: 0, handleX: 0, handleY: 0 });

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
  }, [canvasRef]);

  const getHandleAtPosition = useCallback((canvasX: number, canvasY: number): ResizeHandle => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const scale = (zoom / 100) * imageDisplayScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;

    const imgPosX = (canvas.width / 2) + (imageX * imageDisplayScale) - (imgWidth / 2);
    const imgPosY = (canvas.height / 2) + (imageY * imageDisplayScale) - (imgHeight / 2);

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
  }, [canvasRef, image, imageX, imageY, zoom, imageDisplayScale]);

  const getHandlePosition = useCallback((handle: ResizeHandle) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const scale = (zoom / 100) * imageDisplayScale;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgPosX = (canvas.width / 2) + (imageX * imageDisplayScale) - (imgWidth / 2);
    const imgPosY = (canvas.height / 2) + (imageY * imageDisplayScale) - (imgHeight / 2);

    switch (handle) {
      case 'nw': return { x: imgPosX, y: imgPosY };
      case 'ne': return { x: imgPosX + imgWidth, y: imgPosY };
      case 'sw': return { x: imgPosX, y: imgPosY + imgHeight };
      case 'se': return { x: imgPosX + imgWidth, y: imgPosY + imgHeight };
      default: return { x: 0, y: 0 };
    }
  }, [canvasRef, image, imageX, imageY, zoom, imageDisplayScale]);

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

  const getFixedPoint = useCallback((oldImgWidth: number, oldImgHeight: number) => {
    if (activeHandle === 'nw') {
      return { x: resizeStart.handleX + oldImgWidth, y: resizeStart.handleY + oldImgHeight };
    } else if (activeHandle === 'ne') {
      return { x: resizeStart.handleX - oldImgWidth, y: resizeStart.handleY + oldImgHeight };
    } else if (activeHandle === 'sw') {
      return { x: resizeStart.handleX + oldImgWidth, y: resizeStart.handleY - oldImgHeight };
    }
    return { x: resizeStart.handleX - oldImgWidth, y: resizeStart.handleY - oldImgHeight };
  }, [activeHandle, resizeStart]);

  const getNewCenter = useCallback((fixedPoint: { x: number; y: number }, newWidth: number, newHeight: number) => {
    if (activeHandle === 'nw') {
      return { x: fixedPoint.x - newWidth/2, y: fixedPoint.y - newHeight/2 };
    } else if (activeHandle === 'ne') {
      return { x: fixedPoint.x + newWidth/2, y: fixedPoint.y - newHeight/2 };
    } else if (activeHandle === 'sw') {
      return { x: fixedPoint.x - newWidth/2, y: fixedPoint.y + newHeight/2 };
    }
    return { x: fixedPoint.x + newWidth/2, y: fixedPoint.y + newHeight/2 };
  }, [activeHandle]);

  const handleResize = useCallback((deltaX: number, deltaY: number, shiftKey: boolean, canvas: HTMLCanvasElement) => {
    const oldScale = (resizeStart.zoom / 100) * imageDisplayScale;
    const oldImgWidth = image.width * oldScale;
    const oldImgHeight = image.height * oldScale;
    
    let newImgWidth = oldImgWidth;
    let newImgHeight = oldImgHeight;
    
    if (activeHandle === 'se') {
      newImgWidth = oldImgWidth + deltaX;
      newImgHeight = oldImgHeight + deltaY;
    } else if (activeHandle === 'nw') {
      newImgWidth = oldImgWidth - deltaX;
      newImgHeight = oldImgHeight - deltaY;
    } else if (activeHandle === 'ne') {
      newImgWidth = oldImgWidth + deltaX;
      newImgHeight = oldImgHeight - deltaY;
    } else if (activeHandle === 'sw') {
      newImgWidth = oldImgWidth - deltaX;
      newImgHeight = oldImgHeight + deltaY;
    }
    
    const newScale = Math.max(newImgWidth / image.width, newImgHeight / image.height);
    let newZoom = (newScale / imageDisplayScale) * 100;
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

    if (shiftKey) {
      onZoomChange(newZoom);
      return;
    }

    const actualNewScale = (newZoom / 100) * imageDisplayScale;
    const actualNewImgWidth = image.width * actualNewScale;
    const actualNewImgHeight = image.height * actualNewScale;
    
    const fixedPoint = getFixedPoint(oldImgWidth, oldImgHeight);
    const newCenter = getNewCenter(fixedPoint, actualNewImgWidth, actualNewImgHeight);
    const newImgX = (newCenter.x - canvas.width/2) / imageDisplayScale;
    const newImgY = (newCenter.y - canvas.height/2) / imageDisplayScale;

    onZoomChange(newZoom);
    onPositionChange(newImgX, newImgY);
  }, [activeHandle, resizeStart, image, imageDisplayScale, getFixedPoint, getNewCenter, onZoomChange, onPositionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    
    if (activeHandle && canvas) {
      const deltaX = canvasPos.x - resizeStart.x;
      const deltaY = canvasPos.y - resizeStart.y;
      handleResize(deltaX, deltaY, e.shiftKey, canvas);
    } else if (isDragging) {
      const deltaX = (canvasPos.x - dragStart.x) / imageDisplayScale;
      const deltaY = (canvasPos.y - dragStart.y) / imageDisplayScale;
      onPositionChange(dragStart.imgX + deltaX, dragStart.imgY + deltaY);
    } else {
      const handle = getHandleAtPosition(canvasPos.x, canvasPos.y);
      if (canvas) {
        if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
        else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
        else canvas.style.cursor = 'grab';
      }
    }
  }, [activeHandle, isDragging, dragStart, resizeStart, canvasRef, getCanvasCoords, getHandleAtPosition, handleResize, imageDisplayScale, onPositionChange]);

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

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
