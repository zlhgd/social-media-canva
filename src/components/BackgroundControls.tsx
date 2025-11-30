'use client';

import { Stack, FormControlLabel, Switch, TextField } from '@mui/material';
import ColorPicker from './ColorPicker';

interface BackgroundControlsProps {
  showBackground: boolean;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  onShowBackgroundChange: (show: boolean) => void;
  onBackgroundColorChange: (color: string) => void;
  onPaddingChange: (padding: number) => void;
  onBorderRadiusChange: (radius: number) => void;
}

export default function BackgroundControls({
  showBackground,
  backgroundColor,
  padding,
  borderRadius,
  onShowBackgroundChange,
  onBackgroundColorChange,
  onPaddingChange,
  onBorderRadiusChange,
}: BackgroundControlsProps) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
      <FormControlLabel 
        control={
          <Switch 
            checked={showBackground} 
            onChange={(e) => onShowBackgroundChange(e.target.checked)} 
            size="small" 
          />
        } 
        label="Fond" 
        sx={{ mr: 0.5 }} 
      />
      {showBackground && (
        <>
          <ColorPicker 
            color={backgroundColor} 
            label="Fond" 
            onChange={onBackgroundColorChange} 
          />
          <TextField 
            type="number" 
            size="small" 
            label="Marge" 
            value={padding} 
            onChange={(e) => onPaddingChange(parseInt(e.target.value) || 0)} 
            inputProps={{ min: 0, max: 50, step: 1 }} 
            sx={{ width: 65 }} 
          />
          <TextField 
            type="number" 
            size="small" 
            label="Arrondi" 
            value={borderRadius} 
            onChange={(e) => onBorderRadiusChange(parseInt(e.target.value) || 0)} 
            inputProps={{ min: 0, max: 50, step: 1 }} 
            sx={{ width: 65 }} 
          />
        </>
      )}
    </Stack>
  );
}
