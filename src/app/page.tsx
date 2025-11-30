'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageUploader from '@/components/ImageUploader';
import PlatformConfigPanel from '@/components/PlatformConfigPanel';
import CanvasEditor from '@/components/CanvasEditor';
import TextControls from '@/components/TextControls';
import PreviewsPanel from '@/components/PreviewsPanel';
import { PlatformConfig, TextLayer, TextStyle, DEFAULT_PLATFORMS, STORAGE_KEY } from '@/types';
import { getAverageColor } from '@/lib/canvas-utils';

const loadFromLocalStorage = () => {
  if (typeof window === 'undefined') return { platforms: DEFAULT_PLATFORMS, textStyles: [] };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const textStyles = (parsed.textStyles || []).map((style: TextStyle) => ({
        ...style,
        lineHeight: style.lineHeight ?? 1.2,
      }));
      const platforms = (parsed.platforms || DEFAULT_PLATFORMS).map((p: PlatformConfig) => ({
        ...p,
        visible: p.visible ?? true,
      }));
      return {
        platforms,
        textStyles,
      };
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return { platforms: DEFAULT_PLATFORMS, textStyles: [] };
};

const Home = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(() => loadFromLocalStorage().platforms);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [textStyles, setTextStyles] = useState<TextStyle[]>(() => loadFromLocalStorage().textStyles);
  const [textIdCounter, setTextIdCounter] = useState(0);
  const [averageColor, setAverageColor] = useState('#808080');
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [previewText, setPreviewText] = useState<Omit<TextLayer, 'id'> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        platforms,
        textStyles,
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [platforms, textStyles]);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img);
    setAverageColor(getAverageColor(img));
    setImageX(0);
    setImageY(0);
    
    const maxDimension = Math.max(img.width, img.height);
    const coverZoom = (maxDimension / img.width) * 100;
    setZoom(coverZoom);
  }, []);

  const handlePositionChange = useCallback((x: number, y: number) => {
    setImageX(x);
    setImageY(y);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleNewImage = useCallback(() => {
    setImage(null);
    setImageX(0);
    setImageY(0);
    setZoom(100);
    setTextLayers([]);
    setTextIdCounter(0);
  }, []);

  const handleAddTextLayer = useCallback((layer: Omit<TextLayer, 'id'>) => {
    setTextIdCounter(prev => prev + 1);
    setTextLayers(prev => [...prev, { ...layer, id: textIdCounter + 1 }]);
  }, [textIdCounter]);

  const handleUpdateTextLayer = useCallback((id: number, updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  }, []);

  const handleDeleteTextLayer = useCallback((id: number) => {
    setTextLayers(prev => prev.filter(layer => layer.id !== id));
  }, []);

  const handleSaveTextStyle = useCallback((style: Omit<TextStyle, 'id'>) => {
    const newStyle: TextStyle = {
      ...style,
      id: Date.now().toString(),
    };
    setTextStyles(prev => [...prev, newStyle]);
  }, []);

  const handleDeleteTextStyle = useCallback((id: string) => {
    setTextStyles(prev => prev.filter(style => style.id !== id));
  }, []);

  const handlePreviewChange = useCallback((preview: Omit<TextLayer, 'id'> | null) => {
    setPreviewText(preview);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', p: 1 }}>
      <Container maxWidth="xl" disableGutters>
        {!image ? (
          <ImageUploader onImageLoad={handleImageLoad} />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
          }}>
            <Box sx={{ 
              flex: '1 1 500px', 
              minWidth: { xs: '100%', md: '500px' },
            }}>
              <Stack spacing={1}>
                <CanvasEditor
                  image={image}
                  platforms={platforms}
                  imageX={imageX}
                  imageY={imageY}
                  zoom={zoom}
                  averageColor={averageColor}
                  onPositionChange={handlePositionChange}
                  onZoomChange={handleZoomChange}
                  onReplaceImage={handleNewImage}
                />

                <TextControls
                  textLayers={textLayers}
                  textStyles={textStyles}
                  onAddLayer={handleAddTextLayer}
                  onUpdateLayer={handleUpdateTextLayer}
                  onDeleteLayer={handleDeleteTextLayer}
                  onSaveStyle={handleSaveTextStyle}
                  onDeleteStyle={handleDeleteTextStyle}
                  onPreviewChange={handlePreviewChange}
                />
              </Stack>
            </Box>

            <Box sx={{ 
              width: { xs: '100%', md: '500px' },
              flexShrink: 0,
            }}>
              <PreviewsPanel
                image={image}
                platforms={platforms}
                textLayers={textLayers}
                imageX={imageX}
                imageY={imageY}
                zoom={zoom}
                averageColor={averageColor}
                previewText={previewText}
                onOpenSettings={() => setPlatformDialogOpen(true)}
              />
            </Box>
          </Box>
        )}

        <Dialog
          open={platformDialogOpen}
          onClose={() => setPlatformDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Configuration des plateformes
            <IconButton size="small" onClick={() => setPlatformDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <PlatformConfigPanel
              platforms={platforms}
              onPlatformChange={setPlatforms}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Home;
