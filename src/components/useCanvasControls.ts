import { useCallback } from 'react';

export const useCanvasControls = (
  image: HTMLImageElement,
  exportDimensions: Array<{ platformId: string; width: number; height: number }>,
  imageX: number,
  imageY: number,
  onPositionChange: (_x: number, _y: number) => void,
  onZoomChange: (_zoom: number) => void
) => {
  const handleCoverMode = useCallback(() => {
    if (!image) return;
    const maxExportWidth = Math.max(...exportDimensions.map(d => d.width));
    const maxExportHeight = Math.max(...exportDimensions.map(d => d.height));
    const scaleX = maxExportWidth / image.width;
    const scaleY = maxExportHeight / image.height;
    const coverZoom = Math.max(scaleX, scaleY) * 100;
    onZoomChange(coverZoom);
    onPositionChange(0, 0);
  }, [image, exportDimensions, onZoomChange, onPositionChange]);

  const handleCenterH = useCallback(() => {
    onPositionChange(0, imageY);
  }, [imageY, onPositionChange]);

  const handleCenterV = useCallback(() => {
    onPositionChange(imageX, 0);
  }, [imageX, onPositionChange]);

  return {
    handleCoverMode,
    handleCenterH,
    handleCenterV,
  };
};
