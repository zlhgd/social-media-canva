'use client';

import { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TextLayer, TextStyle } from '@/types';
import TextLayerBlock from './TextLayerBlock';

interface TextControlsProps {
  textLayers: TextLayer[];
  textStyles: TextStyle[];
  onAddLayer: (_layer: Omit<TextLayer, 'id'>) => void;
  onUpdateLayer: (_id: number, _updates: Partial<TextLayer>) => void;
  onDeleteLayer: (_id: number) => void;
  onSaveStyle: (_style: Omit<TextStyle, 'id'>) => void;
  onDeleteStyle: (_id: string) => void;
  onPreviewChange?: (_preview: Omit<TextLayer, 'id'> | null) => void;
}

export default function TextControls({
  textLayers,
  textStyles,
  onAddLayer,
  onUpdateLayer,
  onDeleteLayer,
  onSaveStyle,
  onDeleteStyle,
}: TextControlsProps) {
  const [saveStyleDialogOpen, setSaveStyleDialogOpen] = useState(false);
  const [styleName, setStyleName] = useState('');
  const [styleToSave, setStyleToSave] = useState<Omit<TextStyle, 'id' | 'name'> | null>(null);

  const handleAddTextLayer = () => {
    onAddLayer({
      text: 'Nouveau texte',
      fontFamily: 'Inter',
      fontSize: 48,
      lineHeight: 1.2,
      color: '#ffffff',
      backgroundColor: '#000000',
      showBackground: true,
      padding: 10,
      borderRadius: 4,
      isBold: false,
      isItalic: false,
      verticalAlign: 'middle',
      distanceFromEdge: 20,
      shadow: {
        enabled: false,
        color: '#000000',
        blur: 4,
        offsetX: 2,
        offsetY: 2,
      },
    });
  };

  const handleSaveStyle = () => {
    if (!styleName.trim() || !styleToSave) return;
    onSaveStyle({
      name: styleName.trim(),
      ...styleToSave,
    });
    setStyleName('');
    setStyleToSave(null);
    setSaveStyleDialogOpen(false);
  };

  const openSaveStyleDialog = (layer: TextLayer) => {
    setStyleToSave({
      fontFamily: layer.fontFamily,
      fontSize: layer.fontSize,
      lineHeight: layer.lineHeight,
      color: layer.color,
      backgroundColor: layer.backgroundColor,
      showBackground: layer.showBackground,
      padding: layer.padding,
      borderRadius: layer.borderRadius,
      isBold: layer.isBold,
      isItalic: layer.isItalic,
      shadow: layer.shadow,
    });
    setSaveStyleDialogOpen(true);
  };



  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2">Texte</Typography>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<AddIcon />} 
            onClick={handleAddTextLayer}
          >
            Ajouter texte
          </Button>
        </Box>

        {textStyles.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Styles sauvegardés:</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {textStyles.map((style) => (
                <Chip 
                  key={style.id} 
                  label={style.name} 
                  onDelete={() => onDeleteStyle(style.id)} 
                  size="small" 
                  sx={{ mb: 0.5 }} 
                />
              ))}
            </Stack>
          </Box>
        )}

        <Stack spacing={1}>
          {textLayers.map((layer) => (
            <TextLayerBlock
              key={layer.id}
              layer={layer}
              textStyles={textStyles}
              onUpdateLayer={onUpdateLayer}
              onDeleteLayer={onDeleteLayer}
              onSaveStyle={openSaveStyleDialog}
            />
          ))}
        </Stack>

        <Dialog open={saveStyleDialogOpen} onClose={() => setSaveStyleDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ py: 1 }}>Sauvegarder le style</DialogTitle>
          <DialogContent sx={{ py: 1 }}>
            <TextField autoFocus fullWidth size="small" label="Nom du style" value={styleName} onChange={(e) => setStyleName(e.target.value)} sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions sx={{ py: 1 }}>
            <Button onClick={() => setSaveStyleDialogOpen(false)} size="small">Annuler</Button>
            <Button onClick={handleSaveStyle} variant="contained" size="small" disabled={!styleName.trim()}>Sauvegarder</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
