'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import SaveIcon from '@mui/icons-material/Save';
import { TextLayer, TextStyle, FONT_OPTIONS, VerticalAlignment } from '@/types';

interface TextControlsProps {
  textLayers: TextLayer[];
  textStyles: TextStyle[];
  onAddLayer: (layer: Omit<TextLayer, 'id'>) => void;
  onUpdateLayer: (id: number, updates: Partial<TextLayer>) => void;
  onDeleteLayer: (id: number) => void;
  onSaveStyle: (style: Omit<TextStyle, 'id'>) => void;
  onDeleteStyle: (id: string) => void;
  onPreviewChange?: (preview: Omit<TextLayer, 'id'> | null) => void;
}

export default function TextControls({
  textLayers,
  textStyles,
  onAddLayer,
  onUpdateLayer,
  onDeleteLayer,
  onSaveStyle,
  onDeleteStyle,
  onPreviewChange,
}: TextControlsProps) {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [showBackground, setShowBackground] = useState(true);
  const [padding, setPadding] = useState(10);
  const [borderRadius, setBorderRadius] = useState(4);
  const [styles, setStyles] = useState<string[]>([]);
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlignment>('middle');
  const [distanceFromEdge, setDistanceFromEdge] = useState(20);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [saveStyleDialogOpen, setSaveStyleDialogOpen] = useState(false);
  const [styleName, setStyleName] = useState('');
  const [editingLayerId, setEditingLayerId] = useState<number | null>(null);

  // Helper to create shadow object
  const createShadow = useCallback(() => ({
    enabled: shadowEnabled,
    color: shadowColor,
    blur: shadowBlur,
    offsetX: shadowOffsetX,
    offsetY: shadowOffsetY,
  }), [shadowEnabled, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY]);

  // Helper to create layer data
  const createLayerData = useCallback((): Omit<TextLayer, 'id'> => ({
    text: text.trim(),
    fontFamily,
    fontSize,
    color,
    backgroundColor,
    showBackground,
    padding,
    borderRadius,
    isBold: styles.includes('bold'),
    isItalic: styles.includes('italic'),
    verticalAlign,
    distanceFromEdge,
    shadow: createShadow(),
  }), [text, fontFamily, fontSize, color, backgroundColor, showBackground, padding, borderRadius, styles, verticalAlign, distanceFromEdge, createShadow]);

  // Real-time update when editing existing layer
  useEffect(() => {
    if (editingLayerId !== null && text.trim()) {
      onUpdateLayer(editingLayerId, createLayerData());
    }
  }, [editingLayerId, text, fontFamily, fontSize, color, backgroundColor, showBackground, padding, borderRadius, styles, verticalAlign, distanceFromEdge, shadowEnabled, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, createLayerData, onUpdateLayer]);

  // Send preview updates for new text (not editing)
  useEffect(() => {
    if (onPreviewChange && editingLayerId === null) {
      onPreviewChange(text.trim() ? createLayerData() : null);
    }
  }, [editingLayerId, text, createLayerData, onPreviewChange]);

  const resetForm = () => {
    setText('');
    setEditingLayerId(null);
    if (onPreviewChange) {
      onPreviewChange(null);
    }
  };

  const loadLayerForEdit = (layer: TextLayer) => {
    setText(layer.text);
    setFontFamily(layer.fontFamily);
    setFontSize(layer.fontSize);
    setColor(layer.color);
    setBackgroundColor(layer.backgroundColor);
    setShowBackground(layer.showBackground ?? true);
    setPadding(layer.padding);
    setBorderRadius(layer.borderRadius);
    setStyles([...(layer.isBold ? ['bold'] : []), ...(layer.isItalic ? ['italic'] : [])]);
    setVerticalAlign(layer.verticalAlign);
    setDistanceFromEdge(layer.distanceFromEdge);
    setShadowEnabled(layer.shadow.enabled);
    setShadowColor(layer.shadow.color);
    setShadowBlur(layer.shadow.blur);
    setShadowOffsetX(layer.shadow.offsetX);
    setShadowOffsetY(layer.shadow.offsetY);
    setEditingLayerId(layer.id);
    if (onPreviewChange) {
      onPreviewChange(null);
    }
  };

  const handleAddNew = () => {
    if (!text.trim()) return;
    onAddLayer(createLayerData());
    resetForm();
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
      showBackground,
      padding,
      borderRadius,
      isBold: styles.includes('bold'),
      isItalic: styles.includes('italic'),
      shadow: createShadow(),
    });
    setStyleName('');
    setSaveStyleDialogOpen(false);
  };

  const applyStyle = (style: TextStyle) => {
    setFontFamily(style.fontFamily);
    setFontSize(style.fontSize);
    setColor(style.color);
    setBackgroundColor(style.backgroundColor);
    setShowBackground(style.showBackground ?? true);
    setPadding(style.padding);
    setBorderRadius(style.borderRadius);
    setStyles([...(style.isBold ? ['bold'] : []), ...(style.isItalic ? ['italic'] : [])]);
    if (style.shadow) {
      setShadowEnabled(style.shadow.enabled);
      setShadowColor(style.shadow.color);
      setShadowBlur(style.shadow.blur);
      setShadowOffsetX(style.shadow.offsetX);
      setShadowOffsetY(style.shadow.offsetY);
    }
  };

  const inputStyle = { 
    '& .MuiOutlinedInput-root': { borderRadius: 0.5 },
    '& .MuiInputLabel-root': { fontSize: '0.75rem' },
  };

  return (
    <Card sx={{ borderRadius: 0.5 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          Texte {editingLayerId !== null && <span style={{ fontWeight: 400, color: '#666' }}>(modification en cours)</span>}
        </Typography>

        {textStyles.length > 0 && (
          <Box sx={{ mb: 0.5 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {textStyles.map((style) => (
                <Chip key={style.id} label={style.name} onClick={() => applyStyle(style)} onDelete={() => onDeleteStyle(style.id)} size="small" sx={{ mb: 0.5, borderRadius: 0.5, height: 22 }} />
              ))}
            </Stack>
          </Box>
        )}

        <Stack spacing={0.75}>
          {/* Text input */}
          <TextField
            fullWidth
            size="small"
            placeholder="Saisissez votre texte..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputProps={{ maxLength: 200 }}
            sx={inputStyle}
          />

          {/* Row 1: Font, size, colors, bold/italic */}
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Police</InputLabel>
              <Select value={fontFamily} label="Police" onChange={(e) => setFontFamily(e.target.value)} sx={{ borderRadius: 0.5 }}>
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
              onChange={(e) => setFontSize(parseInt(e.target.value) || 48)} 
              inputProps={{ min: 12, max: 200, step: 1 }} 
              sx={{ width: 70, ...inputStyle }} 
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666' }}>Texte</Typography>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 24, height: 24, border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer', padding: 0 }} />
            </Box>

            <ToggleButtonGroup value={styles} onChange={handleStyleChange} size="small">
              <ToggleButton value="bold" sx={{ borderRadius: 0.5, px: 0.5, py: 0.25 }}><FormatBoldIcon sx={{ fontSize: 16 }} /></ToggleButton>
              <ToggleButton value="italic" sx={{ borderRadius: 0.5, px: 0.5, py: 0.25 }}><FormatItalicIcon sx={{ fontSize: 16 }} /></ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Row 2: Background settings */}
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <FormControlLabel 
              control={<Switch checked={showBackground} onChange={(e) => setShowBackground(e.target.checked)} size="small" />} 
              label="Fond" 
              sx={{ mr: 0.5, '& .MuiTypography-root': { fontSize: '0.7rem' }, '& .MuiSwitch-root': { mr: 0.5 } }} 
            />
            {showBackground && (
              <>
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} style={{ width: 24, height: 24, border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer', padding: 0 }} />
                <TextField 
                  type="number" 
                  size="small" 
                  label="Marge" 
                  value={padding} 
                  onChange={(e) => setPadding(parseInt(e.target.value) || 0)} 
                  inputProps={{ min: 0, max: 50, step: 1 }} 
                  sx={{ width: 65, ...inputStyle }} 
                />
                <TextField 
                  type="number" 
                  size="small" 
                  label="Arrondi" 
                  value={borderRadius} 
                  onChange={(e) => setBorderRadius(parseInt(e.target.value) || 0)} 
                  inputProps={{ min: 0, max: 50, step: 1 }} 
                  sx={{ width: 65, ...inputStyle }} 
                />
              </>
            )}
          </Stack>

          {/* Row 3: Alignment settings */}
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 85 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Position</InputLabel>
              <Select value={verticalAlign} label="Position" onChange={(e) => setVerticalAlign(e.target.value as VerticalAlignment)} sx={{ borderRadius: 0.5 }}>
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
                onChange={(e) => setDistanceFromEdge(parseInt(e.target.value) || 0)} 
                inputProps={{ min: 0, max: 500, step: 10 }} 
                sx={{ width: 80, ...inputStyle }} 
              />
            )}
          </Stack>

          {/* Row 4: Shadow settings - always visible */}
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <FormControlLabel 
              control={<Switch checked={shadowEnabled} onChange={(e) => setShadowEnabled(e.target.checked)} size="small" />} 
              label="Ombre" 
              sx={{ mr: 0.5, '& .MuiTypography-root': { fontSize: '0.7rem' }, '& .MuiSwitch-root': { mr: 0.5 } }} 
            />
            {shadowEnabled && (
              <>
                <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} style={{ width: 24, height: 24, border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer', padding: 0 }} />
                <TextField 
                  type="number" 
                  size="small" 
                  label="Flou" 
                  value={shadowBlur} 
                  onChange={(e) => setShadowBlur(parseInt(e.target.value) || 0)} 
                  inputProps={{ min: 0, max: 50, step: 1 }} 
                  sx={{ width: 55, ...inputStyle }} 
                />
                <TextField 
                  type="number" 
                  size="small" 
                  label="X" 
                  value={shadowOffsetX} 
                  onChange={(e) => setShadowOffsetX(parseInt(e.target.value) || 0)} 
                  inputProps={{ min: -50, max: 50, step: 1 }} 
                  sx={{ width: 50, ...inputStyle }} 
                />
                <TextField 
                  type="number" 
                  size="small" 
                  label="Y" 
                  value={shadowOffsetY} 
                  onChange={(e) => setShadowOffsetY(parseInt(e.target.value) || 0)} 
                  inputProps={{ min: -50, max: 50, step: 1 }} 
                  sx={{ width: 50, ...inputStyle }} 
                />
              </>
            )}
          </Stack>

          {/* Row 5: Buttons */}
          <Stack direction="row" spacing={0.5}>
            {editingLayerId === null ? (
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<AddIcon sx={{ fontSize: 16 }} />} 
                onClick={handleAddNew} 
                disabled={!text.trim()} 
                sx={{ borderRadius: 0.5, textTransform: 'none', py: 0.25, fontSize: '0.75rem' }}
              >
                Ajouter
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={resetForm} 
                sx={{ borderRadius: 0.5, textTransform: 'none', py: 0.25, fontSize: '0.75rem' }}
              >
                Nouveau calque
              </Button>
            )}
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<SaveIcon sx={{ fontSize: 16 }} />} 
              onClick={() => setSaveStyleDialogOpen(true)} 
              sx={{ borderRadius: 0.5, textTransform: 'none', py: 0.25, fontSize: '0.75rem' }}
            >
              Style
            </Button>
          </Stack>
        </Stack>

        {/* Layer list */}
        {textLayers.length > 0 && (
          <>
            <Divider sx={{ my: 0.75 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Calques ({textLayers.length}):</Typography>
            <List dense disablePadding sx={{ mt: 0.25 }}>
              {textLayers.map((layer) => (
                <ListItem 
                  key={layer.id} 
                  onClick={() => loadLayerForEdit(layer)}
                  sx={{ 
                    backgroundColor: editingLayerId === layer.id ? 'primary.light' : 'grey.100', 
                    borderRadius: 0.5, 
                    mb: 0.25, 
                    py: 0.25, 
                    px: 1,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: editingLayerId === layer.id ? 'primary.light' : 'grey.200' }
                  }}
                >
                  <ListItemText
                    primary={layer.text}
                    secondary={`${layer.fontFamily} ${layer.fontSize}px - ${layer.verticalAlign === 'top' ? 'Haut' : layer.verticalAlign === 'bottom' ? 'Bas' : 'Centre'}`}
                    primaryTypographyProps={{ 
                      style: { fontFamily: layer.fontFamily, fontWeight: layer.isBold ? 700 : 400, fontStyle: layer.isItalic ? 'italic' : 'normal' }, 
                      noWrap: true, 
                      variant: 'body2',
                      sx: { fontSize: '0.8rem' }
                    }}
                    secondaryTypographyProps={{ variant: 'caption', sx: { fontSize: '0.65rem' } }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); if (editingLayerId === layer.id) resetForm(); }} 
                      color="error"
                      sx={{ p: 0.25 }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Dialog open={saveStyleDialogOpen} onClose={() => setSaveStyleDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ py: 1, fontSize: '0.9rem' }}>Sauvegarder le style</DialogTitle>
          <DialogContent sx={{ py: 1 }}>
            <TextField autoFocus fullWidth size="small" label="Nom du style" value={styleName} onChange={(e) => setStyleName(e.target.value)} sx={{ mt: 1, ...inputStyle }} />
          </DialogContent>
          <DialogActions sx={{ py: 1 }}>
            <Button onClick={() => setSaveStyleDialogOpen(false)} size="small">Annuler</Button>
            <Button onClick={handleSaveStyle} variant="contained" size="small">Sauvegarder</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
