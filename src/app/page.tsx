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

// Helper to load from localStorage synchronously
function loadFromStorage(): Partial<{
  platforms: PlatformConfig[];
  textStyles: TextStyle[];
  imageX: number;
  imageY: number;
  zoom: number;
}> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return {};
}

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(() => {
    const saved = loadFromStorage();
    return saved.platforms || DEFAULT_PLATFORMS;
  });
  const [imageX, setImageX] = useState(() => loadFromStorage().imageX || 0);
  const [imageY, setImageY] = useState(() => loadFromStorage().imageY || 0);
  const [zoom, setZoom] = useState(() => loadFromStorage().zoom || 100);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [textStyles, setTextStyles] = useState<TextStyle[]>(() => {
    const saved = loadFromStorage();
    return saved.textStyles || [];
  });
  const [textIdCounter, setTextIdCounter] = useState(0);
  const [averageColor, setAverageColor] = useState('#808080');
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        platforms,
        textStyles,
        imageX,
        imageY,
        zoom,
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [platforms, textStyles, imageX, imageY, zoom]);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img);
    setAverageColor(getAverageColor(img));
    // Don't reset position/zoom to preserve localStorage values
  }, []);

  const handlePositionChange = useCallback((x: number, y: number) => {
    setImageX(x);
    setImageY(y);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleReset = useCallback(() => {
    setImageX(0);
    setImageY(0);
    setZoom(100);
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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', p: 2 }}>
      <Container maxWidth="xl" disableGutters>
        {/* Content */}
        {!image ? (
          <ImageUploader onImageLoad={handleImageLoad} />
        ) : (
          <Grid container spacing={2}>
            {/* Left Column - Editor */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  onReset={handleReset}
                />

                <TextControls
                  textLayers={textLayers}
                  textStyles={textStyles}
                  onAddLayer={handleAddTextLayer}
                  onDeleteLayer={handleDeleteTextLayer}
                  onSaveStyle={handleSaveTextStyle}
                  onDeleteStyle={handleDeleteTextStyle}
                />
              </Stack>
            </Grid>

            {/* Right Column - Previews */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <PreviewsPanel
                image={image}
                platforms={platforms}
                textLayers={textLayers}
                imageX={imageX}
                imageY={imageY}
                zoom={zoom}
                averageColor={averageColor}
              />
            </Grid>
          </Grid>
        )}

        {/* Platform Configuration Dialog */}
        <Dialog
          open={platformDialogOpen}
          onClose={() => setPlatformDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Configuration des plateformes
            <IconButton onClick={() => setPlatformDialogOpen(false)}>
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
