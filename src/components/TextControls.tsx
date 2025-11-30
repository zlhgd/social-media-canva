'use client';

import React, { useState, useEffect } from 'react';
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
  Popover,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import { Sketch } from '@uiw/react-color';
import { TextLayer, TextStyle, FONT_OPTIONS, VerticalAlignment } from '@/types';

const DISTANCE_STEP = 10;

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
}: TextControlsProps) {
  const [saveStyleDialogOpen, setSaveStyleDialogOpen] = useState(false);
  const [styleName, setStyleName] = useState('');
  const [styleToSave, setStyleToSave] = useState<Omit<TextStyle, 'id' | 'name'> | null>(null);

  const handleAddTextLayer = () => {
    onAddLayer({
      text: 'Nouveau texte',
      fontFamily: 'Inter',
      fontSize: 48,
      lineHeight: 1.2,
      color: '#ffffff',
      backgroundColor: '#000000',
      showBackground: true,
      padding: 10,
      borderRadius: 4,
      isBold: false,
      isItalic: false,
      verticalAlign: 'middle',
      distanceFromEdge: 20,
      shadow: {
        enabled: false,
        color: '#000000',
        blur: 4,
        offsetX: 2,
        offsetY: 2,
      },
    });
  };

  const handleSaveStyle = () => {
    if (!styleName.trim() || !styleToSave) return;
    onSaveStyle({
      name: styleName.trim(),
      ...styleToSave,
    });
    setStyleName('');
    setStyleToSave(null);
    setSaveStyleDialogOpen(false);
  };

  const openSaveStyleDialog = (layer: TextLayer) => {
    setStyleToSave({
      fontFamily: layer.fontFamily,
      fontSize: layer.fontSize,
      lineHeight: layer.lineHeight,
      color: layer.color,
      backgroundColor: layer.backgroundColor,
      showBackground: layer.showBackground,
      padding: layer.padding,
      borderRadius: layer.borderRadius,
      isBold: layer.isBold,
      isItalic: layer.isItalic,
      shadow: layer.shadow,
    });
    setSaveStyleDialogOpen(true);
  };



  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2">Texte</Typography>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<AddIcon />} 
            onClick={handleAddTextLayer}
          >
            Ajouter texte
          </Button>
        </Box>

        {textStyles.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Styles sauvegardés:</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {textStyles.map((style) => (
                <Chip 
                  key={style.id} 
                  label={style.name} 
                  onDelete={() => onDeleteStyle(style.id)} 
                  size="small" 
                  sx={{ mb: 0.5 }} 
                />
              ))}
            </Stack>
          </Box>
        )}

        <Stack spacing={1}>
          {textLayers.map((layer) => (
            <TextLayerBlock
              key={layer.id}
              layer={layer}
              textStyles={textStyles}
              onUpdateLayer={onUpdateLayer}
              onDeleteLayer={onDeleteLayer}
              onSaveStyle={openSaveStyleDialog}
            />
          ))}
        </Stack>

        <Dialog open={saveStyleDialogOpen} onClose={() => setSaveStyleDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ py: 1 }}>Sauvegarder le style</DialogTitle>
          <DialogContent sx={{ py: 1 }}>
            <TextField autoFocus fullWidth size="small" label="Nom du style" value={styleName} onChange={(e) => setStyleName(e.target.value)} sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions sx={{ py: 1 }}>
            <Button onClick={() => setSaveStyleDialogOpen(false)} size="small">Annuler</Button>
            <Button onClick={handleSaveStyle} variant="contained" size="small" disabled={!styleName.trim()}>Sauvegarder</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface TextLayerBlockProps {
  layer: TextLayer;
  textStyles: TextStyle[];
  onUpdateLayer: (id: number, updates: Partial<TextLayer>) => void;
  onDeleteLayer: (id: number) => void;
  onSaveStyle: (layer: TextLayer) => void;
}

function TextLayerBlock({ 
  layer, 
  textStyles,
  onUpdateLayer, 
  onDeleteLayer, 
  onSaveStyle,
}: TextLayerBlockProps) {
  const [text, setText] = useState(layer.text);
  const [fontFamily, setFontFamily] = useState(layer.fontFamily);
  const [fontSize, setFontSize] = useState(layer.fontSize);
  const [lineHeight, setLineHeight] = useState(layer.lineHeight);
  const [color, setColor] = useState(layer.color);
  const [backgroundColor, setBackgroundColor] = useState(layer.backgroundColor);
  const [showBackground, setShowBackground] = useState(layer.showBackground);
  const [padding, setPadding] = useState(layer.padding);
  const [borderRadius, setBorderRadius] = useState(layer.borderRadius);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [bgColorAnchor, setBgColorAnchor] = useState<HTMLElement | null>(null);
  const [shadowColorAnchor, setShadowColorAnchor] = useState<HTMLElement | null>(null);
  const [styles, setStyles] = useState<string[]>([
    ...(layer.isBold ? ['bold'] : []),
    ...(layer.isItalic ? ['italic'] : []),
  ]);
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlignment>(layer.verticalAlign);
  const [distanceFromEdge, setDistanceFromEdge] = useState(layer.distanceFromEdge);
  const [shadowEnabled, setShadowEnabled] = useState(layer.shadow.enabled);
  const [shadowColor, setShadowColor] = useState(layer.shadow.color);
  const [shadowBlur, setShadowBlur] = useState(layer.shadow.blur);
  const [shadowOffsetX, setShadowOffsetX] = useState(layer.shadow.offsetX);
  const [shadowOffsetY, setShadowOffsetY] = useState(layer.shadow.offsetY);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('');

  useEffect(() => {
    if (text.trim()) {
      onUpdateLayer(layer.id, {
        text: text.trim(),
        fontFamily,
        fontSize,
        lineHeight,
        color,
        backgroundColor,
        showBackground,
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
    }
  }, [layer.id, text, fontFamily, fontSize, lineHeight, color, backgroundColor, showBackground, padding, borderRadius, styles, verticalAlign, distanceFromEdge, shadowEnabled, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, onUpdateLayer]);

  const handleStyleChange = (_: React.MouseEvent<HTMLElement>, newStyles: string[]) => {
    setStyles(newStyles);
  };

  const handleApplyStyle = (styleId: string) => {
    const style = textStyles.find(s => s.id === styleId);
    if (!style) return;
    
    setFontFamily(style.fontFamily);
    setFontSize(style.fontSize);
    setLineHeight(style.lineHeight);
    setColor(style.color);
    setBackgroundColor(style.backgroundColor);
    setShowBackground(style.showBackground);
    setPadding(style.padding);
    setBorderRadius(style.borderRadius);
    setStyles([...(style.isBold ? ['bold'] : []), ...(style.isItalic ? ['italic'] : [])]);
    setShadowEnabled(style.shadow.enabled);
    setShadowColor(style.shadow.color);
    setShadowBlur(style.shadow.blur);
    setShadowOffsetX(style.shadow.offsetX);
    setShadowOffsetY(style.shadow.offsetY);
    setSelectedStyleId(styleId);
  };

  return (
    <Card variant="outlined" sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5, gap: 0.5 }}>
          <Button 
            size="small" 
            startIcon={<SaveIcon />} 
            onClick={() => onSaveStyle({
              ...layer,
              text: text.trim(),
              fontFamily,
              fontSize,
              lineHeight,
              color,
              backgroundColor,
              showBackground,
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
            })}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Sauver
          </Button>
          <IconButton 
            size="small" 
            onClick={() => onDeleteLayer(layer.id)} 
            color="error"
            sx={{ p: 0.5 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={8}
              size="small"
              placeholder="Saisissez votre texte..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack spacing={0.75}>
              {textStyles.length > 0 && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Style</InputLabel>
                  <Select 
                    value={selectedStyleId} 
                    label="Style" 
                    onChange={(e) => handleApplyStyle(e.target.value)}
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
              )}

              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Police</InputLabel>
                  <Select value={fontFamily} label="Police" onChange={(e) => setFontFamily(e.target.value)}>
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
                  sx={{ width: 70 }} 
                />

                <TextField 
                  type="number" 
                  size="small" 
                  label="Hauteur" 
                  value={lineHeight} 
                  onChange={(e) => setLineHeight(parseFloat(e.target.value) || 1.2)} 
                  inputProps={{ min: 0.5, max: 3, step: 0.1 }} 
                  sx={{ width: 75 }} 
                />

                <Box>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Texte</Typography>
                  <Box
                    onClick={(e) => setColorAnchor(e.currentTarget)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                  />
                  <Popover
                    open={Boolean(colorAnchor)}
                    anchorEl={colorAnchor}
                    onClose={() => setColorAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  >
                    <Sketch color={color} onChange={(color) => setColor(color.hex)} />
                  </Popover>
                </Box>

                <ToggleButtonGroup value={styles} onChange={handleStyleChange} size="small">
                  <ToggleButton value="bold"><FormatBoldIcon /></ToggleButton>
                  <ToggleButton value="italic"><FormatItalicIcon /></ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <FormControlLabel 
                  control={<Switch checked={showBackground} onChange={(e) => setShowBackground(e.target.checked)} size="small" />} 
                  label="Fond" 
                  sx={{ mr: 0.5 }} 
                />
                {showBackground && (
                  <>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Fond</Typography>
                      <Box
                        onClick={(e) => setBgColorAnchor(e.currentTarget)}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: backgroundColor,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                        }}
                      />
                      <Popover
                        open={Boolean(bgColorAnchor)}
                        anchorEl={bgColorAnchor}
                        onClose={() => setBgColorAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      >
                        <Sketch color={backgroundColor} onChange={(color) => setBackgroundColor(color.hex)} />
                      </Popover>
                    </Box>
                    <TextField 
                      type="number" 
                      size="small" 
                      label="Marge" 
                      value={padding} 
                      onChange={(e) => setPadding(parseInt(e.target.value) || 0)} 
                      inputProps={{ min: 0, max: 50, step: 1 }} 
                      sx={{ width: 65 }} 
                    />
                    <TextField 
                      type="number" 
                      size="small" 
                      label="Arrondi" 
                      value={borderRadius} 
                      onChange={(e) => setBorderRadius(parseInt(e.target.value) || 0)} 
                      inputProps={{ min: 0, max: 50, step: 1 }} 
                      sx={{ width: 65 }} 
                    />
                  </>
                )}
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 85 }}>
                  <InputLabel>Position</InputLabel>
                  <Select value={verticalAlign} label="Position" onChange={(e) => setVerticalAlign(e.target.value as VerticalAlignment)}>
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
                    inputProps={{ min: 0, max: 500, step: DISTANCE_STEP }} 
                    sx={{ width: 80 }} 
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <FormControlLabel 
                  control={<Switch checked={shadowEnabled} onChange={(e) => setShadowEnabled(e.target.checked)} size="small" />} 
                  label="Ombre" 
                  sx={{ mr: 0.5 }} 
                />
                {shadowEnabled && (
                  <>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Couleur</Typography>
                      <Box
                        onClick={(e) => setShadowColorAnchor(e.currentTarget)}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: shadowColor,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                        }}
                      />
                      <Popover
                        open={Boolean(shadowColorAnchor)}
                        anchorEl={shadowColorAnchor}
                        onClose={() => setShadowColorAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      >
                        <Sketch color={shadowColor} onChange={(color) => setShadowColor(color.hex)} />
                      </Popover>
                    </Box>
                    <TextField 
                      type="number" 
                      size="small" 
                      label="Flou" 
                      value={shadowBlur} 
                      onChange={(e) => setShadowBlur(parseInt(e.target.value) || 0)} 
                      inputProps={{ min: 0, max: 50, step: 1 }} 
                      sx={{ width: 55 }} 
                    />
                    <TextField 
                      type="number" 
                      size="small" 
                      label="X" 
                      value={shadowOffsetX} 
                      onChange={(e) => setShadowOffsetX(parseInt(e.target.value) || 0)} 
                      inputProps={{ min: -50, max: 50, step: 1 }} 
                      sx={{ width: 50 }} 
                    />
                    <TextField 
                      type="number" 
                      size="small" 
                      label="Y" 
                      value={shadowOffsetY} 
                      onChange={(e) => setShadowOffsetY(parseInt(e.target.value) || 0)} 
                      inputProps={{ min: -50, max: 50, step: 1 }} 
                      sx={{ width: 50 }} 
                    />
                  </>
                )}
              </Stack>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
