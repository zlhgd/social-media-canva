'use client';

import { useState } from 'react';
import { Box, Typography, TextField, IconButton, Popover, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Sketch } from '@uiw/react-color';
import { PlatformConfig } from '@/types';

interface PlatformConfigItemProps {
  platform: PlatformConfig;
  onUpdate: (_id: string, _updates: Partial<PlatformConfig>) => void;
  onDelete: (_id: string) => void;
}

const PlatformConfigItem = ({ platform, onUpdate, onDelete }: PlatformConfigItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: platform.id,
  });
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}
    >
      <Tooltip title="Réorganiser">
        <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={platform.visible ? 'Masquer' : 'Afficher'}>
        <IconButton
          size="small"
          onClick={() => onUpdate(platform.id, { visible: !platform.visible })}
        >
          {platform.visible ? (
            <VisibilityIcon fontSize="small" />
          ) : (
            <VisibilityOffIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <TextField
        size="small"
        value={platform.name}
        onChange={(e) => onUpdate(platform.id, { name: e.target.value })}
        sx={{ minWidth: 100, opacity: platform.visible ? 1 : 0.5 }}
      />
      <TextField
        type="number"
        size="small"
        label="Largeur"
        value={platform.width}
        onChange={(e) => onUpdate(platform.id, { width: parseInt(e.target.value) || 0 })}
        slotProps={{ htmlInput: { min: 100, max: 4000, step: 10 } }}
        sx={{ width: 90 }}
      />
      <Typography variant="body2">×</Typography>
      <TextField
        type="number"
        size="small"
        label="Hauteur"
        value={platform.height}
        onChange={(e) => onUpdate(platform.id, { height: parseInt(e.target.value) || 0 })}
        slotProps={{ htmlInput: { min: 100, max: 4000, step: 10 } }}
        sx={{ width: 90 }}
      />
      <Box
        onClick={(e) => setColorAnchor(e.currentTarget)}
        sx={{
          width: 40,
          height: 40,
          bgcolor: platform.color,
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
        <Sketch
          color={platform.color}
          onChange={(color) => onUpdate(platform.id, { color: color.hex })}
        />
      </Popover>
      <Tooltip title="Supprimer">
        <IconButton size="small" onClick={() => onDelete(platform.id)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default PlatformConfigItem;
