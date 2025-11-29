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
  Collapse,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import { TextLayer, TextStyle, FONT_OPTIONS, VerticalAlignment } from '@/types';

interface TextControlsProps {
  textLayers: TextLayer[];
  textStyles: TextStyle[];
  onAddLayer: (layer: Omit<TextLayer, 'id'>) => void;
  onDeleteLayer: (id: number) => void;
  onSaveStyle: (style: Omit<TextStyle, 'id'>) => void;
  onDeleteStyle: (id: string) => void;
}

export default function TextControls({
  textLayers,
  textStyles,
  onAddLayer,
  onDeleteLayer,
  onSaveStyle,
  onDeleteStyle,
}: TextControlsProps) {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [padding, setPadding] = useState(10);
  const [borderRadius, setBorderRadius] = useState(8);
  const [styles, setStyles] = useState<string[]>([]);
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlignment>('middle');
  const [distanceFromEdge, setDistanceFromEdge] = useState(20);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveStyleDialogOpen, setSaveStyleDialogOpen] = useState(false);
  const [styleName, setStyleName] = useState('');

  const handleAddText = () => {
    if (!text.trim()) return;

    onAddLayer({
      text: text.trim(),
      fontFamily,
      fontSize,
      color,
      backgroundColor,
      padding,
      borderRadius,
      isBold: styles.includes('bold'),
      isItalic: styles.includes('italic'),
      verticalAlign,
      distanceFromEdge,
      shadow: {
        enabled: shadowEnabled,
        color: shadowColor,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
      },
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

  const handleSaveStyle = () => {
    if (!styleName.trim()) return;
    
    onSaveStyle({
      name: styleName.trim(),
      fontFamily,
      fontSize,
      color,
      backgroundColor,
      padding,
      borderRadius,
      isBold: styles.includes('bold'),
      isItalic: styles.includes('italic'),
      shadow: {
        enabled: shadowEnabled,
        color: shadowColor,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
      },
    });
    
    setStyleName('');
    setSaveStyleDialogOpen(false);
  };

  const applyStyle = (style: TextStyle) => {
    setFontFamily(style.fontFamily);
    setFontSize(style.fontSize);
    setColor(style.color);
    setBackgroundColor(style.backgroundColor);
    setPadding(style.padding);
    setBorderRadius(style.borderRadius);
    setStyles([
      ...(style.isBold ? ['bold'] : []),
      ...(style.isItalic ? ['italic'] : []),
    ]);
    if (style.shadow) {
      setShadowEnabled(style.shadow.enabled);
      setShadowColor(style.shadow.color);
      setShadowBlur(style.shadow.blur);
      setShadowOffsetX(style.shadow.offsetX);
      setShadowOffsetY(style.shadow.offsetY);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          ✍️ Texte
        </Typography>

        {/* Saved Styles */}
        {textStyles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Styles enregistrés:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {textStyles.map((style) => (
                <Chip
                  key={style.id}
                  label={style.name}
                  onClick={() => applyStyle(style)}
                  onDelete={() => onDeleteStyle(style.id)}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Stack spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Texte"
            placeholder="Entrez votre texte..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            inputProps={{ maxLength: 200 }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
              size="small"
              label="Taille"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
              inputProps={{ min: 12, max: 200 }}
              sx={{ width: 80 }}
            />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Couleur
              </Typography>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 36, height: 32, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Fond
              </Typography>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={{ width: 36, height: 32, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
              />
            </Box>

            <ToggleButtonGroup
              value={styles}
              onChange={handleStyleChange}
              size="small"
            >
              <ToggleButton value="bold"><FormatBoldIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="italic"><FormatItalicIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Alignement</InputLabel>
              <Select
                value={verticalAlign}
                label="Alignement"
                onChange={(e) => setVerticalAlign(e.target.value as VerticalAlignment)}
              >
                <MenuItem value="top">Haut</MenuItem>
                <MenuItem value="middle">Milieu</MenuItem>
                <MenuItem value="bottom">Bas</MenuItem>
              </Select>
            </FormControl>

            {verticalAlign !== 'middle' && (
              <TextField
                type="number"
                size="small"
                label="Distance"
                value={distanceFromEdge}
                onChange={(e) => setDistanceFromEdge(parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 500 }}
                sx={{ width: 90 }}
              />
            )}

            <TextField
              type="number"
              size="small"
              label="Padding"
              value={padding}
              onChange={(e) => setPadding(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 50 }}
              sx={{ width: 80 }}
            />

            <TextField
              type="number"
              size="small"
              label="Rayon"
              value={borderRadius}
              onChange={(e) => setBorderRadius(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 50 }}
              sx={{ width: 80 }}
            />
          </Stack>

          {/* Advanced Options Toggle */}
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
            endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Ombre
          </Button>

          <Collapse in={showAdvanced}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shadowEnabled}
                    onChange={(e) => setShadowEnabled(e.target.checked)}
                    size="small"
                  />
                }
                label="Activer"
              />
              {shadowEnabled && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                      Couleur
                    </Typography>
                    <input
                      type="color"
                      value={shadowColor}
                      onChange={(e) => setShadowColor(e.target.value)}
                      style={{ width: 32, height: 28, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                    />
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    label="Flou"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 50 }}
                    sx={{ width: 70 }}
                  />
                  <TextField
                    type="number"
                    size="small"
                    label="X"
                    value={shadowOffsetX}
                    onChange={(e) => setShadowOffsetX(parseInt(e.target.value) || 0)}
                    inputProps={{ min: -50, max: 50 }}
                    sx={{ width: 60 }}
                  />
                  <TextField
                    type="number"
                    size="small"
                    label="Y"
                    value={shadowOffsetY}
                    onChange={(e) => setShadowOffsetY(parseInt(e.target.value) || 0)}
                    inputProps={{ min: -50, max: 50 }}
                    sx={{ width: 60 }}
                  />
                </>
              )}
            </Stack>
          </Collapse>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddText}
              disabled={!text.trim()}
            >
              Ajouter
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => setSaveStyleDialogOpen(true)}
            >
              Sauver style
            </Button>
          </Stack>
        </Stack>

        {textLayers.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              Calques ({textLayers.length}):
            </Typography>
            <List dense disablePadding>
              {textLayers.map((layer) => (
                <ListItem
                  key={layer.id}
                  sx={{ backgroundColor: 'grey.100', borderRadius: 1, mb: 0.5, py: 0.5 }}
                >
                  <ListItemText
                    primary={layer.text}
                    secondary={`${layer.fontFamily} ${layer.fontSize}px - ${layer.verticalAlign}`}
                    primaryTypographyProps={{
                      style: {
                        fontFamily: layer.fontFamily,
                        fontWeight: layer.isBold ? 700 : 400,
                        fontStyle: layer.isItalic ? 'italic' : 'normal',
                      },
                      noWrap: true,
                      variant: 'body2',
                    }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onDeleteLayer(layer.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Save Style Dialog */}
        <Dialog open={saveStyleDialogOpen} onClose={() => setSaveStyleDialogOpen(false)}>
          <DialogTitle>Sauvegarder le style</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="Nom du style"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveStyleDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveStyle} variant="contained">Sauvegarder</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
