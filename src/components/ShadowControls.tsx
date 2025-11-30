'use client';

import { Stack, FormControlLabel, Switch, TextField } from '@mui/material';
import ColorPicker from './ColorPicker';

interface ShadowControlsProps {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  onEnabledChange: (_enabled: boolean) => void;
  onColorChange: (_color: string) => void;
  onBlurChange: (_blur: number) => void;
  onOffsetXChange: (_offsetX: number) => void;
  onOffsetYChange: (_offsetY: number) => void;
}

const ShadowControls = ({
  enabled,
  color,
  blur,
  offsetX,
  offsetY,
  onEnabledChange,
  onColorChange,
  onBlurChange,
  onOffsetXChange,
  onOffsetYChange,
}: ShadowControlsProps) => (
  <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" sx={{ height: 40 }}>
    <FormControlLabel
      control={
        <Switch
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          size="small"
        />
      }
      label="Ombre"
      sx={{ mr: 0.5 }}
    />
    {enabled && (
      <>
        <ColorPicker color={color} onChange={onColorChange} />
        <TextField
          type="number"
          size="small"
          label="Flou"
          value={blur}
          onChange={(e) => onBlurChange(parseInt(e.target.value) || 0)}
          inputProps={{ min: 0, max: 50, step: 1 }}
          sx={{ width: 55 }}
        />
        <TextField
          type="number"
          size="small"
          label="X"
          value={offsetX}
          onChange={(e) => onOffsetXChange(parseInt(e.target.value) || 0)}
          inputProps={{ min: -50, max: 50, step: 1 }}
          sx={{ width: 50 }}
        />
        <TextField
          type="number"
          size="small"
          label="Y"
          value={offsetY}
          onChange={(e) => onOffsetYChange(parseInt(e.target.value) || 0)}
          inputProps={{ min: -50, max: 50, step: 1 }}
          sx={{ width: 50 }}
        />
      </>
    )}
  </Stack>
);

export default ShadowControls;
