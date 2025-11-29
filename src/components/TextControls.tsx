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
import EditIcon from '@mui/icons-material/Edit';
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
    padding,
    borderRadius,
    isBold: styles.includes('bold'),
    isItalic: styles.includes('italic'),
    verticalAlign,
    distanceFromEdge,
    shadow: createShadow(),
  }), [text, fontFamily, fontSize, color, backgroundColor, padding, borderRadius, styles, verticalAlign, distanceFromEdge, createShadow]);

  // Send preview updates in real-time
  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(text.trim() ? createLayerData() : null);
    }
  }, [text, createLayerData, onPreviewChange]);

  const resetForm = () => {
    setText('');
    setEditingLayerId(null);
  };

  const loadLayerForEdit = (layer: TextLayer) => {
    setText(layer.text);
    setFontFamily(layer.fontFamily);
    setFontSize(layer.fontSize);
    setColor(layer.color);
    setBackgroundColor(layer.backgroundColor);
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
  };

  const handleSubmit = () => {
    if (!text.trim()) return;

    if (editingLayerId !== null) {
      onUpdateLayer(editingLayerId, createLayerData());
    } else {
      onAddLayer(createLayerData());
    }
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

  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Texte {editingLayerId !== null && '(édition)'}
        </Typography>

        {textStyles.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {textStyles.map((style) => (
                <Chip key={style.id} label={style.name} onClick={() => applyStyle(style)} onDelete={() => onDeleteStyle(style.id)} size="small" sx={{ mb: 0.5, borderRadius: 1 }} />
              ))}
            </Stack>
          </Box>
        )}

        <Stack spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Texte..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            inputProps={{ maxLength: 200 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />

          <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Police</InputLabel>
              <Select value={fontFamily} label="Police" onChange={(e) => setFontFamily(e.target.value)} sx={{ borderRadius: 1 }}>
                {FONT_OPTIONS.map((font) => (
                  <MenuItem key={font} value={font} style={{ fontFamily: font }}>{font}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField type="number" size="small" label="Taille" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 48)} inputProps={{ min: 12, max: 200 }} sx={{ width: 70, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 28, height: 28, border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer' }} title="Couleur" />
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} style={{ width: 28, height: 28, border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer' }} title="Fond" />
            <ToggleButtonGroup value={styles} onChange={handleStyleChange} size="small">
              <ToggleButton value="bold" sx={{ borderRadius: 1, px: 0.5 }}><FormatBoldIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="italic" sx={{ borderRadius: 1, px: 0.5 }}><FormatItalicIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Align</InputLabel>
              <Select value={verticalAlign} label="Align" onChange={(e) => setVerticalAlign(e.target.value as VerticalAlignment)} sx={{ borderRadius: 1 }}>
                <MenuItem value="top">Haut</MenuItem>
                <MenuItem value="middle">Milieu</MenuItem>
                <MenuItem value="bottom">Bas</MenuItem>
              </Select>
            </FormControl>
            {verticalAlign !== 'middle' && (
              <TextField type="number" size="small" label="Dist." value={distanceFromEdge} onChange={(e) => setDistanceFromEdge(parseInt(e.target.value) || 0)} inputProps={{ min: 0, max: 500 }} sx={{ width: 70, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
            )}
            <TextField type="number" size="small" label="Pad" value={padding} onChange={(e) => setPadding(parseInt(e.target.value) || 0)} inputProps={{ min: 0, max: 50 }} sx={{ width: 60, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
            <TextField type="number" size="small" label="Rad" value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value) || 0)} inputProps={{ min: 0, max: 50 }} sx={{ width: 60, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
          </Stack>

          {/* Shadow controls - always visible */}
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <FormControlLabel control={<Switch checked={shadowEnabled} onChange={(e) => setShadowEnabled(e.target.checked)} size="small" />} label="Ombre" sx={{ mr: 0.5, '& .MuiTypography-root': { fontSize: '0.75rem' } }} />
            {shadowEnabled && (
              <>
                <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} style={{ width: 24, height: 24, border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer' }} />
                <TextField type="number" size="small" label="Flou" value={shadowBlur} onChange={(e) => setShadowBlur(parseInt(e.target.value) || 0)} inputProps={{ min: 0, max: 50 }} sx={{ width: 55, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                <TextField type="number" size="small" label="X" value={shadowOffsetX} onChange={(e) => setShadowOffsetX(parseInt(e.target.value) || 0)} inputProps={{ min: -50, max: 50 }} sx={{ width: 50, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                <TextField type="number" size="small" label="Y" value={shadowOffsetY} onChange={(e) => setShadowOffsetY(parseInt(e.target.value) || 0)} inputProps={{ min: -50, max: 50 }} sx={{ width: 50, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
              </>
            )}
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Button variant="contained" size="small" startIcon={editingLayerId !== null ? <EditIcon /> : <AddIcon />} onClick={handleSubmit} disabled={!text.trim()} sx={{ borderRadius: 1, textTransform: 'none' }}>
              {editingLayerId !== null ? 'Modifier' : 'Ajouter'}
            </Button>
            {editingLayerId !== null && (
              <Button variant="outlined" size="small" onClick={resetForm} sx={{ borderRadius: 1, textTransform: 'none' }}>Annuler</Button>
            )}
            <Button variant="outlined" size="small" startIcon={<SaveIcon />} onClick={() => setSaveStyleDialogOpen(true)} sx={{ borderRadius: 1, textTransform: 'none' }}>Style</Button>
          </Stack>
        </Stack>

        {textLayers.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">Calques ({textLayers.length}):</Typography>
            <List dense disablePadding>
              {textLayers.map((layer) => (
                <ListItem key={layer.id} sx={{ backgroundColor: 'grey.100', borderRadius: 0.5, mb: 0.5, py: 0.25, px: 1 }}>
                  <ListItemText
                    primary={layer.text}
                    secondary={`${layer.fontFamily} ${layer.fontSize}px`}
                    primaryTypographyProps={{ style: { fontFamily: layer.fontFamily, fontWeight: layer.isBold ? 700 : 400, fontStyle: layer.isItalic ? 'italic' : 'normal' }, noWrap: true, variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small" onClick={() => loadLayerForEdit(layer)} sx={{ mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton edge="end" size="small" onClick={() => onDeleteLayer(layer.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Dialog open={saveStyleDialogOpen} onClose={() => setSaveStyleDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ py: 1 }}>Sauvegarder le style</DialogTitle>
          <DialogContent sx={{ py: 1 }}>
            <TextField autoFocus fullWidth size="small" label="Nom du style" value={styleName} onChange={(e) => setStyleName(e.target.value)} sx={{ mt: 1 }} />
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
