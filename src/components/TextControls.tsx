'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import { TextLayer, FONT_OPTIONS } from '@/types';

interface TextControlsProps {
  textLayers: TextLayer[];
  onAddLayer: (layer: Omit<TextLayer, 'id'>) => void;
  onDeleteLayer: (id: number) => void;
}

export default function TextControls({ textLayers, onAddLayer, onDeleteLayer }: TextControlsProps) {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [styles, setStyles] = useState<string[]>([]);

  const handleAddText = () => {
    if (!text.trim()) return;

    onAddLayer({
      text: text.trim(),
      fontFamily,
      fontSize,
      color,
      strokeColor,
      strokeWidth,
      isBold: styles.includes('bold'),
      isItalic: styles.includes('italic'),
      x: 0,
      y: 0,
    });

    setText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddText();
    }
  };

  const handleStyleChange = (_: React.MouseEvent<HTMLElement>, newStyles: string[]) => {
    setStyles(newStyles);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          ✍️ Ajouter du texte
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Texte"
            placeholder="Entrez votre texte..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            inputProps={{ maxLength: 200 }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Police</InputLabel>
              <Select
                value={fontFamily}
                label="Police"
                onChange={(e) => setFontFamily(e.target.value)}
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
              label="Taille"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
              inputProps={{ min: 12, max: 200 }}
              sx={{ width: 100 }}
            />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Couleur
              </Typography>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 50,
                  height: 40,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
            </Box>

            <ToggleButtonGroup
              value={styles}
              onChange={handleStyleChange}
              aria-label="text formatting"
            >
              <ToggleButton value="bold" aria-label="bold">
                <FormatBoldIcon />
              </ToggleButton>
              <ToggleButton value="italic" aria-label="italic">
                <FormatItalicIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Contour
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  style={{
                    width: 40,
                    height: 40,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                />
                <TextField
                  type="number"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 10 }}
                  sx={{ width: 60 }}
                  size="small"
                />
              </Stack>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddText}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}
            >
              Ajouter
            </Button>
          </Stack>
        </Stack>

        {textLayers.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Calques de texte:
            </Typography>
            <List dense>
              {textLayers.map((layer) => (
                <ListItem
                  key={layer.id}
                  sx={{
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={layer.text}
                    secondary={`${layer.fontFamily}, ${layer.fontSize}px`}
                    primaryTypographyProps={{
                      style: {
                        fontFamily: layer.fontFamily,
                        fontWeight: layer.isBold ? 700 : 400,
                        fontStyle: layer.isItalic ? 'italic' : 'normal',
                        color: layer.color === '#ffffff' ? '#333' : layer.color,
                      },
                      noWrap: true,
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDeleteLayer(layer.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}
