'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Stack, IconButton, Button, Divider, Popover } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Sketch } from '@uiw/react-color';
import { PlatformConfig } from '@/types';

interface PlatformConfigPanelProps {
  platforms: PlatformConfig[];
  onPlatformChange: (platforms: PlatformConfig[]) => void;
}

function SortableItem({ platform, onUpdate, onDelete }: { 
  platform: PlatformConfig; 
  onUpdate: (id: string, updates: Partial<PlatformConfig>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: platform.id });
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => onUpdate(platform.id, { visible: !platform.visible })}
      >
        {platform.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
      </IconButton>
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
        inputProps={{ min: 100, max: 4000, step: 10 }}
        sx={{ width: 90 }}
      />
      <Typography variant="body2">×</Typography>
      <TextField
        type="number"
        size="small"
        label="Hauteur"
        value={platform.height}
        onChange={(e) => onUpdate(platform.id, { height: parseInt(e.target.value) || 0 })}
        inputProps={{ min: 100, max: 4000, step: 10 }}
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
      <IconButton
        size="small"
        onClick={() => onDelete(platform.id)}
        color="error"
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function PlatformConfigPanel({ platforms, onPlatformChange }: PlatformConfigPanelProps) {
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformWidth, setNewPlatformWidth] = useState('1080');
  const [newPlatformHeight, setNewPlatformHeight] = useState('1080');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = platforms.findIndex((p) => p.id === active.id);
      const newIndex = platforms.findIndex((p) => p.id === over.id);
      onPlatformChange(arrayMove(platforms, oldIndex, newIndex));
    }
  };

  const handleUpdate = (platformId: string, updates: Partial<PlatformConfig>) => {
    const updatedPlatforms = platforms.map(p => 
      p.id === platformId ? { ...p, ...updates } : p
    );
    onPlatformChange(updatedPlatforms);
  };

  const handleDelete = (platformId: string) => {
    const updatedPlatforms = platforms.filter(p => p.id !== platformId);
    onPlatformChange(updatedPlatforms);
  };

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    
    const width = parseInt(newPlatformWidth) || 1080;
    const height = parseInt(newPlatformHeight) || 1080;
    
    if (width < 100 || width > 4000 || height < 100 || height > 4000) return;
    
    const newPlatform: PlatformConfig = {
      id: `custom-${Date.now()}`,
      name: newPlatformName.trim(),
      width,
      height,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      visible: true,
    };
    
    onPlatformChange([...platforms, newPlatform]);
    setNewPlatformName('');
    setNewPlatformWidth('1080');
    setNewPlatformHeight('1080');
  };

  return (
    <Stack spacing={1.5}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={platforms.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <Stack spacing={0.75}>
            {platforms.map((platform) => (
              <SortableItem
                key={platform.id}
                platform={platform}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
      
      <Divider />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <TextField
          size="small"
          label="Nom"
          value={newPlatformName}
          onChange={(e) => setNewPlatformName(e.target.value)}
          sx={{ minWidth: 120 }}
        />
        <TextField
          type="number"
          size="small"
          label="Largeur"
          value={newPlatformWidth}
          onChange={(e) => setNewPlatformWidth(e.target.value)}
          inputProps={{ min: 100, max: 4000, step: 10 }}
          sx={{ width: 90 }}
        />
        <Typography variant="body2">×</Typography>
        <TextField
          type="number"
          size="small"
          label="Hauteur"
          value={newPlatformHeight}
          onChange={(e) => setNewPlatformHeight(e.target.value)}
          inputProps={{ min: 100, max: 4000, step: 10 }}
          sx={{ width: 90 }}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddPlatform}
          disabled={!newPlatformName.trim()}
        >
          Ajouter
        </Button>
      </Box>
    </Stack>
  );
}
