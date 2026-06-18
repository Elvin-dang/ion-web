/**
 * 5.4.3 View Asset Tags on Drawing (MSP Supervisor — Read-only). Building
 * selector + a simulated drawing canvas with clickable tag pins. Clicking a pin
 * shows asset info; in-scope pins link to Asset Detail (5.4.2). No edit mode.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import RoomIcon from '@mui/icons-material/Room';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import InfoField from '../components/InfoField';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../components/useToast';
import { drawings, USER_GROUP_BUILDINGS } from '../data/mockData';
import type { DrawingTag } from '../data/types';

export default function AssetDrawingScreen() {
  const navigate = useNavigate();
  const { toast, toastElement } = useToast();
  const [building, setBuilding] = useState(USER_GROUP_BUILDINGS[0]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [activeTag, setActiveTag] = useState<DrawingTag | null>(null);

  const drawing = useMemo(() => drawings.find((d) => d.building === building), [building]);

  return (
    <Box>
      <PageHeader
        title="Asset Drawing"
        subtitle="Read-only as-built drawing with asset tags"
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Assets', to: '/msp/assets' }, { label: 'Drawing' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 180 }}>
              {USER_GROUP_BUILDINGS.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!drawing} onClick={() => toast('Drawing PDF downloaded.', 'info')}>
              Download PDF
            </Button>
          </Stack>
        }
      />

      <Tabs value={1} sx={{ mb: 3 }}>
        <Tab label="Asset List" onClick={() => navigate('/msp/assets')} />
        <Tab label="Drawing" />
        <Tab label="Inventory" onClick={() => navigate('/msp/inventory')} />
      </Tabs>

      {!drawing ? (
        <EmptyState title="No drawing" description="No drawing uploaded for this building." />
      ) : (
        <SectionCard title={`${drawing.fileName} · uploaded ${drawing.uploadDate}`}>
          <Box
            sx={(theme) => ({
              position: 'relative',
              width: '100%',
              height: { xs: 360, md: 520 },
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              backgroundImage: `linear-gradient(${alpha(theme.palette.text.primary, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
                theme.palette.text.primary,
                0.05,
              )} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              overflow: 'hidden',
            })}
          >
            <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 8, left: 12 }}>
              As-built drawing (read-only) · pan & zoom simulated · {drawing.tags.length} tags
            </Typography>
            {drawing.tags.map((tag) => (
              <Tooltip key={tag.assetId} title={tag.assetCode}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setAnchor(e.currentTarget);
                    setActiveTag(tag);
                  }}
                  sx={{
                    position: 'absolute',
                    left: `${tag.x}%`,
                    top: `${tag.y}%`,
                    transform: 'translate(-50%, -100%)',
                    color: tag.inScope ? 'primary.main' : 'text.disabled',
                  }}
                >
                  <RoomIcon />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </SectionCard>
      )}

      <Popover
        open={!!activeTag}
        anchorEl={anchor}
        onClose={() => setActiveTag(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {activeTag && (
          <Box sx={{ p: 2, width: 260 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">{activeTag.assetName}</Typography>
              <IconButton size="small" onClick={() => setActiveTag(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
            {activeTag.inScope ? (
              <>
                <InfoField label="Asset Code" value={activeTag.assetCode} />
                <InfoField label="Asset Type" value={activeTag.assetType} />
                <InfoField label="Asset System" value={activeTag.assetSystem} />
                <InfoField label="Status" value={<StatusChip status={activeTag.status} />} />
                <InfoField label="Last Maintenance" value={activeTag.lastMaintenance} />
                <Button size="small" variant="contained" fullWidth sx={{ mt: 1 }} onClick={() => navigate(`/msp/assets/${activeTag.assetId}`)}>
                  Link to Asset Detail
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                This asset is outside your current scope.
              </Typography>
            )}
          </Box>
        )}
      </Popover>
      {toastElement}
    </Box>
  );
}
