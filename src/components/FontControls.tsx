'use client';

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
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
  onFontFamilyChange: (_font: string) => void;
  onFontSizeChange: (_size: number) => void;
  onLineHeightChange: (_height: number) => void;
  onColorChange: (_color: string) => void;
  onStyleChange: (_bold: boolean, _italic: boolean) => void;
}

const FontControls = ({
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
}: FontControlsProps) => {
  const styles = [...(isBold ? ['bold'] : []), ...(isItalic ? ['italic'] : [])];

  const handleStyleChange = (_: React.MouseEvent<HTMLElement>, newStyles: string[]) => {
    onStyleChange(newStyles.includes('bold'), newStyles.includes('italic'));
  };

  return (
    <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.5, m: 0 }}>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Police</InputLabel>
        <Select
          value={fontFamily}
          label="Police"
          onChange={(e) => onFontFamilyChange(e.target.value)}
        >
          {FONT_OPTIONS.map((font) => (
            <MenuItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="number"
        size="small"
        label="Taille"
        value={fontSize}
        onChange={(e) => onFontSizeChange(parseInt(e.target.value) || 48)}
        slotProps={{ htmlInput: { min: 12, max: 200, step: 1 } }}
        sx={{ width: 70 }}
      />

      <TextField
        type="number"
        size="small"
        label="Hauteur"
        value={lineHeight}
        onChange={(e) => onLineHeightChange(parseFloat(e.target.value) || 1.2)}
        slotProps={{ htmlInput: { min: 0.5, max: 3, step: 0.1 } }}
        sx={{ width: 75 }}
      />

      <ColorPicker color={color} onChange={onColorChange} />

      <ToggleButtonGroup value={styles} onChange={handleStyleChange} size="small">
        <ToggleButton value="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic">
          <FormatItalicIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
};

export default FontControls;
