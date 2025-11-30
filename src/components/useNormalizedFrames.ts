import { useMemo } from 'react';
import { PlatformConfig } from '@/types';
import { calculateExportDimensions } from '@/lib/canvas-utils';

const REFERENCE_SIZE = 400;

export interface NormalizedFrame extends PlatformConfig {
  displayWidth: number;
  displayHeight: number;
  exportWidth: number;
  exportHeight: number;
  scaleFactor: number;
}

export const useNormalizedFrames = (image: HTMLImageElement, platforms: PlatformConfig[]) => {
  const exportDimensions = useMemo(() => 
    calculateExportDimensions(image, platforms), 
    [image, platforms]
  );

  const normalizedFrames = useMemo(() => {
    const maxExportDimension = Math.max(
      ...exportDimensions.map(d => Math.max(d.width, d.height))
    );
    
    const scale = REFERENCE_SIZE / maxExportDimension;
    
    return platforms.map(p => {
      const exportDim = exportDimensions.find(d => d.platformId === p.id);
      if (!exportDim) return null;
      
      const displayWidth = exportDim.width * scale;
      const displayHeight = exportDim.height * scale;
      
      return {
        ...p,
        displayWidth,
        displayHeight,
        exportWidth: exportDim.width,
        exportHeight: exportDim.height,
        scaleFactor: exportDim.width / displayWidth,
      };
    }).filter(Boolean) as NormalizedFrame[];
  }, [platforms, exportDimensions]);

  const maxDisplayWidth = useMemo(() => Math.max(...normalizedFrames.map(f => f.displayWidth)), [normalizedFrames]);
  const maxDisplayHeight = useMemo(() => Math.max(...normalizedFrames.map(f => f.displayHeight)), [normalizedFrames]);
  const imageDisplayScale = useMemo(() => normalizedFrames.length > 0 ? 1 / normalizedFrames[0].scaleFactor : 1, [normalizedFrames]);

  return {
    exportDimensions,
    normalizedFrames,
    maxDisplayWidth,
    maxDisplayHeight,
    imageDisplayScale,
  };
};
