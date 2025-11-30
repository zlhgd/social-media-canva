'use client';

import { Box, Popover, Typography } from '@mui/material';
import { Sketch } from '@uiw/react-color';
import { useState } from 'react';

interface ColorPickerProps {
  color: string;
  label?: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ color, label, onChange }: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <Box>
      {label && (
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          width: 40,
          height: 40,
          bgcolor: color,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Sketch color={color} onChange={(newColor) => onChange(newColor.hex)} />
      </Popover>
    </Box>
  );
}
