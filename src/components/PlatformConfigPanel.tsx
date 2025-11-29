'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Grid } from '@mui/material';
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📐 Dimensions des plateformes
        </Typography>
        
        <Grid container spacing={3}>
          {platforms.map((platform) => (
            <Grid size={{ xs: 12, md: 4 }} key={platform.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{platform.icon}</span>
                  <span style={{ color: platform.color, fontWeight: 500 }}>{platform.name}</span>
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={platform.width}
                  onChange={(e) => handleDimensionChange(platform.id, 'width', e.target.value)}
                  inputProps={{ min: 100, max: 4000 }}
                  sx={{ width: 80 }}
                />
                <Typography>×</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={platform.height}
                  onChange={(e) => handleDimensionChange(platform.id, 'height', e.target.value)}
                  inputProps={{ min: 100, max: 4000 }}
                  sx={{ width: 80 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
