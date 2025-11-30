'use client';

import { Stack, Button, ButtonGroup, Tooltip } from '@mui/material';
import CropFreeIcon from '@mui/icons-material/CropFree';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import AlignVerticalCenterIcon from '@mui/icons-material/AlignVerticalCenter';
import RefreshIcon from '@mui/icons-material/Refresh';

interface CanvasControlsProps {
  onCoverMode: () => void;
  onCenterH: () => void;
  onCenterV: () => void;
  onReplaceImage?: () => void;
}

const CanvasControls = ({
  onCoverMode,
  onCenterH,
  onCenterV,
  onReplaceImage,
}: CanvasControlsProps) => (
  <Stack direction="row" spacing={1} justifyContent="center">
    <ButtonGroup size="small">
      <Tooltip title="Réinitialiser">
        <Button onClick={onCoverMode}>
          <CropFreeIcon />
        </Button>
      </Tooltip>
    </ButtonGroup>
    <ButtonGroup size="small">
      <Tooltip title="Centrer horizontalement">
        <Button onClick={onCenterH}>
          <AlignHorizontalCenterIcon />
        </Button>
      </Tooltip>
      <Tooltip title="Centrer verticalement">
        <Button onClick={onCenterV}>
          <AlignVerticalCenterIcon />
        </Button>
      </Tooltip>
    </ButtonGroup>
    {onReplaceImage && (
      <Button size="small" startIcon={<RefreshIcon />} onClick={onReplaceImage}>
        Remplacer
      </Button>
    )}
  </Stack>
);

export default CanvasControls;
