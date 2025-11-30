'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, IconButton, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { TextLayer, TextStyle } from '@/types';
import StyleSelector from './StyleSelector';
import FontControls from './FontControls';
import BackgroundControls from './BackgroundControls';
import PositionControls from './PositionControls';
import ShadowControls from './ShadowControls';

interface TextLayerBlockProps {
  layer: TextLayer;
  textStyles: TextStyle[];
  onUpdateLayer: (_id: number, _updates: Partial<TextLayer>) => void;
  onDeleteLayer: (_id: number) => void;
  onSaveStyle: (_layer: TextLayer) => void;
}

const TextLayerBlock = ({ 
  layer, 
  textStyles,
  onUpdateLayer, 
  onDeleteLayer, 
  onSaveStyle,
}: TextLayerBlockProps) => {
  const [text, setText] = useState(layer.text);
  const [fontFamily, setFontFamily] = useState(layer.fontFamily);
  const [fontSize, setFontSize] = useState(layer.fontSize);
  const [lineHeight, setLineHeight] = useState(layer.lineHeight);
  const [color, setColor] = useState(layer.color);
  const [backgroundColor, setBackgroundColor] = useState(layer.backgroundColor);
  const [showBackground, setShowBackground] = useState(layer.showBackground);
  const [padding, setPadding] = useState(layer.padding);
  const [borderRadius, setBorderRadius] = useState(layer.borderRadius);
  const [isBold, setIsBold] = useState(layer.isBold);
  const [isItalic, setIsItalic] = useState(layer.isItalic);
  const [verticalAlign, setVerticalAlign] = useState(layer.verticalAlign);
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
        isBold,
        isItalic,
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
  }, [layer.id, text, fontFamily, fontSize, lineHeight, color, backgroundColor, showBackground, padding, borderRadius, isBold, isItalic, verticalAlign, distanceFromEdge, shadowEnabled, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, onUpdateLayer]);

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
    setIsBold(style.isBold);
    setIsItalic(style.isItalic);
    setShadowEnabled(style.shadow.enabled);
    setShadowColor(style.shadow.color);
    setShadowBlur(style.shadow.blur);
    setShadowOffsetX(style.shadow.offsetX);
    setShadowOffsetY(style.shadow.offsetY);
    setSelectedStyleId(styleId);
  };

  const handleSaveStyle = () => {
    onSaveStyle({
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
      isBold,
      isItalic,
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
  };

  return (
    <Card variant="outlined" sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5, gap: 0.5 }}>
          <Button 
            size="small" 
            startIcon={<SaveIcon />} 
            onClick={handleSaveStyle}
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
              <StyleSelector 
                textStyles={textStyles} 
                selectedStyleId={selectedStyleId} 
                onApplyStyle={handleApplyStyle} 
              />

              <FontControls 
                fontFamily={fontFamily}
                fontSize={fontSize}
                lineHeight={lineHeight}
                color={color}
                isBold={isBold}
                isItalic={isItalic}
                onFontFamilyChange={setFontFamily}
                onFontSizeChange={setFontSize}
                onLineHeightChange={setLineHeight}
                onColorChange={setColor}
                onStyleChange={(bold, italic) => {
                  setIsBold(bold);
                  setIsItalic(italic);
                }}
              />

              <BackgroundControls 
                showBackground={showBackground}
                backgroundColor={backgroundColor}
                padding={padding}
                borderRadius={borderRadius}
                onShowBackgroundChange={setShowBackground}
                onBackgroundColorChange={setBackgroundColor}
                onPaddingChange={setPadding}
                onBorderRadiusChange={setBorderRadius}
              />

              <PositionControls 
                verticalAlign={verticalAlign}
                distanceFromEdge={distanceFromEdge}
                onVerticalAlignChange={setVerticalAlign}
                onDistanceFromEdgeChange={setDistanceFromEdge}
              />

              <ShadowControls 
                enabled={shadowEnabled}
                color={shadowColor}
                blur={shadowBlur}
                offsetX={shadowOffsetX}
                offsetY={shadowOffsetY}
                onEnabledChange={setShadowEnabled}
                onColorChange={setShadowColor}
                onBlurChange={setShadowBlur}
                onOffsetXChange={setShadowOffsetX}
                onOffsetYChange={setShadowOffsetY}
              />
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TextLayerBlock;
