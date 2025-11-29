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
    <Stack spacing={1}>
      {platforms.map((platform) => (
        <Box key={platform.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ minWidth: 80, color: platform.color, fontWeight: 500, fontSize: '0.875rem' }}>
            {platform.name}
          </Typography>
          <TextField
            type="number"
            size="small"
            value={platform.width}
            onChange={(e) => handleDimensionChange(platform.id, 'width', e.target.value)}
            inputProps={{ min: 100, max: 4000 }}
            sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
          <Typography variant="body2">×</Typography>
          <TextField
            type="number"
            size="small"
            value={platform.height}
            onChange={(e) => handleDimensionChange(platform.id, 'height', e.target.value)}
            inputProps={{ min: 100, max: 4000 }}
            sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </Box>
      ))}
    </Stack>
  );
}
