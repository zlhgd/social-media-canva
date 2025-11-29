'use client';

import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { PlatformConfig } from '@/types';

interface PlatformConfigPanelProps {
  platforms: PlatformConfig[];
  onPlatformChange: (platforms: PlatformConfig[]) => void;
}

export default function PlatformConfigPanel({ platforms, onPlatformChange }: PlatformConfigPanelProps) {
  const handleDimensionChange = (platformId: string, field: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 100 || numValue > 4000) return;
    
    const updatedPlatforms = platforms.map(p => 
      p.id === platformId ? { ...p, [field]: numValue } : p
    );
    onPlatformChange(updatedPlatforms);
  };

  return (
    <Stack spacing={0.75}>
      {platforms.map((platform) => (
        <Box key={platform.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ minWidth: 80, color: platform.color, fontWeight: 500, fontSize: '0.8rem' }}>
            {platform.name}
          </Typography>
          <TextField
            type="number"
            size="small"
            label="Largeur"
            value={platform.width}
            onChange={(e) => handleDimensionChange(platform.id, 'width', e.target.value)}
            inputProps={{ min: 100, max: 4000, step: 10 }}
            sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: 0.5 }, '& .MuiInputLabel-root': { fontSize: '0.7rem' } }}
          />
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>×</Typography>
          <TextField
            type="number"
            size="small"
            label="Hauteur"
            value={platform.height}
            onChange={(e) => handleDimensionChange(platform.id, 'height', e.target.value)}
            inputProps={{ min: 100, max: 4000, step: 10 }}
            sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: 0.5 }, '& .MuiInputLabel-root': { fontSize: '0.7rem' } }}
          />
        </Box>
      ))}
    </Stack>
  );
}
