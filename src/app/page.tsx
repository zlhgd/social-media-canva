'use client';

import React, { useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageUploader from '@/components/ImageUploader';
import PlatformConfigPanel from '@/components/PlatformConfigPanel';
import CanvasEditor from '@/components/CanvasEditor';
import TextControls from '@/components/TextControls';
import PreviewsPanel from '@/components/PreviewsPanel';
import { PlatformConfig, TextLayer, DEFAULT_PLATFORMS } from '@/types';

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(DEFAULT_PLATFORMS);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [textIdCounter, setTextIdCounter] = useState(0);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img);
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

  const handleTextLayerPositionChange = useCallback((layerId: number, x: number, y: number) => {
    setTextLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, x, y } : layer
    ));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom>
            🎨 Social Media Visual Composer
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Créez des visuels optimisés pour Instagram, Facebook et LinkedIn
          </Typography>
        </Paper>

        {/* Content */}
        {!image ? (
          <ImageUploader onImageLoad={handleImageLoad} />
        ) : (
          <Stack spacing={3}>
            <PlatformConfigPanel
              platforms={platforms}
              onPlatformChange={setPlatforms}
            />

            <CanvasEditor
              image={image}
              platforms={platforms}
              textLayers={textLayers}
              imageX={imageX}
              imageY={imageY}
              zoom={zoom}
              onPositionChange={handlePositionChange}
              onZoomChange={handleZoomChange}
              onReset={handleReset}
              onTextLayerPositionChange={handleTextLayerPositionChange}
            />

            <TextControls
              textLayers={textLayers}
              onAddLayer={handleAddTextLayer}
              onDeleteLayer={handleDeleteTextLayer}
            />

            <PreviewsPanel
              image={image}
              platforms={platforms}
              textLayers={textLayers}
              imageX={imageX}
              imageY={imageY}
              zoom={zoom}
            />

            <Box sx={{ textAlign: 'center', pt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleNewImage}
              >
                Charger une nouvelle image
              </Button>
            </Box>
          </Stack>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
          <Typography variant="body2">
            Social Media Visual Composer - Créez des visuels parfaits pour vos réseaux sociaux
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
