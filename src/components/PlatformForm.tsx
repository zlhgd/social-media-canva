'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface PlatformFormProps {
  onAdd: (_name: string, _width: number, _height: number) => void;
}

const PlatformForm = ({ onAdd }: PlatformFormProps) => {
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformWidth, setNewPlatformWidth] = useState('1080');
  const [newPlatformHeight, setNewPlatformHeight] = useState('1080');

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;

    const width = parseInt(newPlatformWidth) || 1080;
    const height = parseInt(newPlatformHeight) || 1080;

    if (width < 100 || width > 4000 || height < 100 || height > 4000) return;

    onAdd(newPlatformName.trim(), width, height);
    setNewPlatformName('');
    setNewPlatformWidth('1080');
    setNewPlatformHeight('1080');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <TextField
        size="small"
        label="Nom"
        value={newPlatformName}
        onChange={(e) => setNewPlatformName(e.target.value)}
        sx={{ minWidth: 120 }}
      />
      <TextField
        type="number"
        size="small"
        label="Largeur"
        value={newPlatformWidth}
        onChange={(e) => setNewPlatformWidth(e.target.value)}
        slotProps={{ htmlInput: { min: 100, max: 4000, step: 10 } }}
        sx={{ width: 90 }}
      />
      <Typography variant="body2">×</Typography>
      <TextField
        type="number"
        size="small"
        label="Hauteur"
        value={newPlatformHeight}
        onChange={(e) => setNewPlatformHeight(e.target.value)}
        slotProps={{ htmlInput: { min: 100, max: 4000, step: 10 } }}
        sx={{ width: 90 }}
      />
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddPlatform}
        disabled={!newPlatformName.trim()}
      >
        Ajouter
      </Button>
    </Box>
  );
};

export default PlatformForm;
