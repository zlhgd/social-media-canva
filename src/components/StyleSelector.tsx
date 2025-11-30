'use client';

import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { TextStyle } from '@/types';

interface StyleSelectorProps {
  textStyles: TextStyle[];
  selectedStyleId: string;
  onApplyStyle: (_styleId: string) => void;
}

const StyleSelector = ({ textStyles, selectedStyleId, onApplyStyle }: StyleSelectorProps) => {
  if (textStyles.length === 0) return null;

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Style</InputLabel>
      <Select 
        value={selectedStyleId} 
        label="Style" 
        onChange={(e) => onApplyStyle(e.target.value)}
        renderValue={(value) => {
          const style = textStyles.find(s => s.id === value);
          return style ? style.name : '';
        }}
      >
        {textStyles.map((style) => (
          <MenuItem 
            key={style.id} 
            value={style.id}
            sx={{
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.isBold ? 700 : 400,
              fontStyle: style.isItalic ? 'italic' : 'normal',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{style.name}</span>
            {selectedStyleId === style.id && <CheckIcon fontSize="small" />}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StyleSelector;
