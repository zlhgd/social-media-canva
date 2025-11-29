'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ImageUploader from '@/components/ImageUploader';
import PlatformConfigPanel from '@/components/PlatformConfigPanel';
import CanvasEditor from '@/components/CanvasEditor';
import TextControls from '@/components/TextControls';
import PreviewsPanel from '@/components/PreviewsPanel';
import { PlatformConfig, TextLayer, TextStyle, DEFAULT_PLATFORMS, STORAGE_KEY } from '@/types';
import { getAverageColor } from '@/lib/canvas-utils';

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(DEFAULT_PLATFORMS);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [textStyles, setTextStyles] = useState<TextStyle[]>([]);
  const [textIdCounter, setTextIdCounter] = useState(0);
  const [averageColor, setAverageColor] = useState('#808080');
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [previewText, setPreviewText] = useState<Omit<TextLayer, 'id'> | null>(null);

  // Mark as client-side and load from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.platforms) setPlatforms(parsed.platforms);
        if (parsed.textStyles) setTextStyles(parsed.textStyles);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save only config (platforms and text styles) to localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        platforms,
        textStyles,
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [platforms, textStyles, isClient]);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img);
    setAverageColor(getAverageColor(img));
    setImageX(0);
    setImageY(0);
    setZoom(100);
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
    <Box sx={{ height: '100vh', backgroundColor: '#fafafa', p: 1, display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" disableGutters sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!image ? (
          <ImageUploader onImageLoad={handleImageLoad} />
        ) : (
          <Grid container spacing={1} sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {/* Left Column - Editor (scrollable within itself) */}
            <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Stack spacing={1} sx={{ height: '100%', overflow: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => setPlatformDialogOpen(true)}
                  >
                    Plateformes
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleNewImage}
                  >
                    Nouvelle image
                  </Button>
                </Box>

                <CanvasEditor
                  image={image}
                  platforms={platforms}
                  imageX={imageX}
                  imageY={imageY}
                  zoom={zoom}
                  averageColor={averageColor}
                  onPositionChange={handlePositionChange}
                  onZoomChange={handleZoomChange}
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
            </Grid>

            {/* Right Column - Previews (scrollable) */}
            <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <PreviewsPanel
                image={image}
                platforms={platforms}
                textLayers={textLayers}
                imageX={imageX}
                imageY={imageY}
                zoom={zoom}
                averageColor={averageColor}
                previewText={previewText}
              />
            </Grid>
          </Grid>
        )}

        {/* Platform Configuration Dialog */}
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
}
