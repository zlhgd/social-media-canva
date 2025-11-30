'use client';

import { Stack, FormControl, InputLabel, Select, MenuItem, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import ColorPicker from './ColorPicker';
import { FONT_OPTIONS } from '@/types';

interface FontControlsProps {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  onFontFamilyChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (height: number) => void;
  onColorChange: (color: string) => void;
  onStyleChange: (bold: boolean, italic: boolean) => void;
}

export default function FontControls({
  fontFamily,
  fontSize,
  lineHeight,
  color,
  isBold,
  isItalic,
  onFontFamilyChange,
  onFontSizeChange,
  onLineHeightChange,
  onColorChange,
  onStyleChange,
}: FontControlsProps) {
  const styles = [...(isBold ? ['bold'] : []), ...(isItalic ? ['italic'] : [])];

  const handleStyleChange = (_: React.MouseEvent<HTMLElement>, newStyles: string[]) => {
    onStyleChange(newStyles.includes('bold'), newStyles.includes('italic'));
  };

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Police</InputLabel>
        <Select value={fontFamily} label="Police" onChange={(e) => onFontFamilyChange(e.target.value)}>
          {FONT_OPTIONS.map((font) => (
            <MenuItem key={font} value={font} style={{ fontFamily: font }}>{font}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField 
        type="number" 
        size="small" 
        label="Taille" 
        value={fontSize} 
        onChange={(e) => onFontSizeChange(parseInt(e.target.value) || 48)} 
        inputProps={{ min: 12, max: 200, step: 1 }} 
        sx={{ width: 70 }} 
      />

      <TextField 
        type="number" 
        size="small" 
        label="Hauteur" 
        value={lineHeight} 
        onChange={(e) => onLineHeightChange(parseFloat(e.target.value) || 1.2)} 
        inputProps={{ min: 0.5, max: 3, step: 0.1 }} 
        sx={{ width: 75 }} 
      />

      <ColorPicker 
        color={color} 
        label="Texte" 
        onChange={onColorChange} 
      />

      <ToggleButtonGroup value={styles} onChange={handleStyleChange} size="small">
        <ToggleButton value="bold"><FormatBoldIcon /></ToggleButton>
        <ToggleButton value="italic"><FormatItalicIcon /></ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
