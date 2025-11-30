'use client';

import { Stack, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { VerticalAlignment } from '@/types';

const DISTANCE_STEP = 10;

interface PositionControlsProps {
  verticalAlign: VerticalAlignment;
  distanceFromEdge: number;
  onVerticalAlignChange: (_align: VerticalAlignment) => void;
  onDistanceFromEdgeChange: (_distance: number) => void;
}

const PositionControls = ({
  verticalAlign,
  distanceFromEdge,
  onVerticalAlignChange,
  onDistanceFromEdgeChange,
}: PositionControlsProps) => (
  <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
    <FormControl size="small" sx={{ minWidth: 85 }}>
      <InputLabel>Position</InputLabel>
      <Select
        value={verticalAlign}
        label="Position"
        onChange={(e) => onVerticalAlignChange(e.target.value as VerticalAlignment)}
      >
        <MenuItem value="top">Haut</MenuItem>
        <MenuItem value="middle">Centre</MenuItem>
        <MenuItem value="bottom">Bas</MenuItem>
      </Select>
    </FormControl>
    {verticalAlign !== 'middle' && (
      <TextField
        type="number"
        size="small"
        label="Distance"
        value={distanceFromEdge}
        onChange={(e) => onDistanceFromEdgeChange(parseInt(e.target.value) || 0)}
        slotProps={{ htmlInput: { min: 0, max: 500, step: DISTANCE_STEP } }}
        sx={{ width: 80 }}
      />
    )}
  </Stack>
);

export default PositionControls;
