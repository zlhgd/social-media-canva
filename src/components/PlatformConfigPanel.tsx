'use client';

import { Stack, Divider } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlatformConfig } from '@/types';
import PlatformConfigItem from './PlatformConfigItem';
import PlatformForm from './PlatformForm';

interface PlatformConfigPanelProps {
  platforms: PlatformConfig[];
  onPlatformChange: (_platforms: PlatformConfig[]) => void;
}

export default function PlatformConfigPanel({ platforms, onPlatformChange }: PlatformConfigPanelProps) {
  
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

  const handleAddPlatform = (name: string, width: number, height: number) => {
    const newPlatform: PlatformConfig = {
      id: `custom-${Date.now()}`,
      name,
      width,
      height,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      visible: true,
    };
    
    onPlatformChange([...platforms, newPlatform]);
  };

  return (
    <Stack spacing={1.5}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={platforms.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <Stack spacing={0.75}>
            {platforms.map((platform) => (
              <PlatformConfigItem
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
      
      <PlatformForm onAdd={handleAddPlatform} />
    </Stack>
  );
}
