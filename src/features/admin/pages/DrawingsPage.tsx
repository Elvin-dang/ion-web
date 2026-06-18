/**
 * 1.5.19–1.5.25 As-Built Drawing — building + floor selector, per-floor upload /
 * replace / delete drawing, a viewer surface with asset tag pins, edit-tags mode
 * where tags are FREELY draggable (hold-drag-drop anywhere on the canvas) and a
 * tag popup that links to Asset Detail.
 */
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PlaceIcon from '@mui/icons-material/Place';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import ConfirmDialog from '../../../components/ConfirmDialog';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import { buildings, assets, typeName, systemName } from '../data/mockData';

interface Tag { id: string; assetId: string; x: number; y: number }

/** Initial seeded tags keyed by floor id. */
const SEED_TAGS: Record<string, Tag[]> = {
  'F-002': [{ id: 'T1', assetId: 'AS-001', x: 30, y: 40 }, { id: 'T2', assetId: 'AS-003', x: 65, y: 60 }],
};

let tagSeq = 0;

export default function DrawingsPage() {
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const [buildingId, setBuildingId] = useState(buildings[0].id);
  const building = buildings.find((b) => b.id === buildingId)!;
  const [floorId, setFloorId] = useState<string>(building.floors[0]?.id ?? '');

  // per-floor drawing presence (seeded from floor.hasDrawing)
  const [floorDrawings, setFloorDrawings] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    buildings.forEach((b) => b.floors.forEach((f) => { map[f.id] = !!f.hasDrawing; }));
    return map;
  });
  const [editMode, setEditMode] = useState(false);
  // tags keyed by floor id
  const [tagsByFloor, setTagsByFloor] = useState<Record<string, Tag[]>>(() => ({ ...SEED_TAGS }));
  const [popover, setPopover] = useState<{ anchor: { top: number; left: number }; tag: Tag } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragId = useRef<string | null>(null);

  const floor = building.floors.find((f) => f.id === floorId) ?? null;
  const drawing = floorId ? floorDrawings[floorId] : false;
  const tags = (floorId && tagsByFloor[floorId]) || [];
  const buildingAssets = useMemo(() => assets.filter((a) => a.buildingId === buildingId), [buildingId]);

  const setTags = (updater: (prev: Tag[]) => Tag[]) =>
    setTagsByFloor((p) => ({ ...p, [floorId]: updater(p[floorId] ?? []) }));

  const selectBuilding = (id: string) => {
    setBuildingId(id);
    const b = buildings.find((x) => x.id === id)!;
    setFloorId(b.floors[0]?.id ?? '');
    setEditMode(false);
  };

  /* ---- free pointer-drag of tags ---- */
  const pointToPct = (clientX: number, clientY: number) => {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const onTagPointerDown = (e: React.PointerEvent, tag: Tag) => {
    if (!editMode) return;
    e.stopPropagation();
    e.preventDefault();
    dragId.current = tag.id;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onTagPointerMove = (e: React.PointerEvent) => {
    if (!editMode || dragId.current === null) return;
    const { x, y } = pointToPct(e.clientX, e.clientY);
    const id = dragId.current;
    setTags((p) => p.map((t) => (t.id === id ? { ...t, x, y } : t)));
  };
  const onTagPointerUp = (e: React.PointerEvent) => {
    if (dragId.current === null) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragId.current = null;
  };

  const placeTag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode || dragId.current) return;
    const { x, y } = pointToPct(e.clientX, e.clientY);
    const firstAsset = buildingAssets[0];
    if (!firstAsset) { toast('No assets found for this building.', 'error'); return; }
    tagSeq += 1;
    setTags((p) => [...p, { id: `T-${Date.now()}-${tagSeq}`, assetId: firstAsset.id, x, y }]);
  };

  const setDrawing = (has: boolean) => {
    setFloorDrawings((p) => ({ ...p, [floorId]: has }));
    if (!has) { setTags(() => []); setEditMode(false); }
  };

  return (
    <Box>
      <PageHeader title="As-Built Drawings" subtitle="Upload per-floor drawings and place asset tags." />
      <SectionCard>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <TextField select size="small" label="Building" value={buildingId} onChange={(e) => selectBuilding(e.target.value)} sx={{ minWidth: 240 }}>
            {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Floor" value={floorId} onChange={(e) => { setFloorId(e.target.value); setEditMode(false); }} sx={{ minWidth: 200 }} disabled={building.floors.length === 0}>
            {building.floors.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
          </TextField>
        </Stack>
      </SectionCard>

      <Box sx={{ mt: 2.5 }}>
        <SectionCard
          title={floor ? `${building.name} · ${floor.name}` : building.name}
          action={drawing && (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant={editMode ? 'contained' : 'outlined'} startIcon={<EditLocationAltIcon />} onClick={() => { setEditMode((m) => !m); if (editMode) toast('Asset tags saved successfully.'); }}>
                {editMode ? 'Save All Changes' : 'Edit Tags'}
              </Button>
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => toast('Drawing downloaded.')}>Download</Button>
              <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} component="label">Replace<input type="file" hidden accept="application/pdf" onChange={() => toast('Drawing replaced. All previous asset tags have been removed.')} /></Button>
              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmDelete(true)}>Delete</Button>
            </Stack>
          )}
        >
          {!floor ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              This building has no floors yet. Add floors in Buildings first.
            </Typography>
          ) : !drawing ? (
            <Paper variant="outlined" sx={{ borderRadius: '16px', p: 6, textAlign: 'center', borderStyle: 'dashed' }}>
              <UploadFileIcon color="action" sx={{ fontSize: 56 }} />
              <Typography sx={{ mt: 1 }} color="text.secondary">No drawing uploaded for {building.name} · {floor.name}.</Typography>
              <Typography variant="caption" color="text.secondary">PDF only · Max 50 MB</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" startIcon={<UploadFileIcon />} component="label">
                  Upload Drawing
                  <input type="file" hidden accept="application/pdf" onChange={() => { setDrawing(true); toast('Drawing uploaded successfully.'); }} />
                </Button>
              </Box>
            </Paper>
          ) : (
            <Box
              ref={canvasRef}
              onClick={placeTag}
              sx={{
                position: 'relative', height: 460, borderRadius: '16px', touchAction: 'none',
                background: (t) => `repeating-linear-gradient(45deg, ${alpha(t.palette.primary.main, 0.03)}, ${alpha(t.palette.primary.main, 0.03)} 12px, ${alpha(t.palette.primary.main, 0.06)} 12px, ${alpha(t.palette.primary.main, 0.06)} 24px)`,
                border: '1px solid', borderColor: 'divider', cursor: editMode ? 'crosshair' : 'default', overflow: 'hidden', userSelect: 'none',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 8, left: 12 }}>
                {building.id}-{floor.name}-asbuilt.pdf {editMode && '· Click to place · drag pins to reposition'}
              </Typography>
              {tags.map((tag) => (
                <Box
                  key={tag.id}
                  onPointerDown={(e) => onTagPointerDown(e, tag)}
                  onPointerMove={onTagPointerMove}
                  onPointerUp={onTagPointerUp}
                  onClick={(e) => { e.stopPropagation(); if (!dragId.current) setPopover({ anchor: { top: e.clientY, left: e.clientX }, tag }); }}
                  sx={{
                    position: 'absolute', left: `${tag.x}%`, top: `${tag.y}%`, transform: 'translate(-50%, -100%)',
                    color: 'secondary.main', cursor: editMode ? 'grab' : 'pointer', touchAction: 'none',
                    '&:active': { cursor: editMode ? 'grabbing' : 'pointer' },
                  }}
                >
                  <PlaceIcon sx={{ fontSize: 32, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }} />
                </Box>
              ))}
            </Box>
          )}
        </SectionCard>
      </Box>

      <Popover
        open={!!popover}
        anchorReference="anchorPosition"
        anchorPosition={popover ? popover.anchor : undefined}
        onClose={() => setPopover(null)}
      >
        {popover && (() => {
          const asset = assets.find((a) => a.id === popover.tag.assetId);
          if (!asset) return null;
          return (
            <Box sx={{ p: 2, maxWidth: 260 }}>
              <Typography fontWeight={700}>{asset.name}</Typography>
              <Typography variant="body2" color="text.secondary">{asset.code} · {typeName(asset.typeId)}</Typography>
              <Typography variant="body2" color="text.secondary">{systemName(asset.systemId)}</Typography>
              <Box sx={{ my: 1 }}><AdminStatusChip status={asset.status} /></Box>
              {editMode ? (
                <Stack direction="row" spacing={1}>
                  <Typography variant="caption" color="text.secondary">Drag the pin to reposition.</Typography>
                  <Button size="small" color="error" onClick={() => { setTags((p) => p.filter((t) => t.id !== popover.tag.id)); setPopover(null); }}>Remove tag</Button>
                </Stack>
              ) : (
                <Link component="button" onClick={() => navigate(`/admin/assets/${asset.id}`)}>View Asset Detail</Link>
              )}
            </Box>
          );
        })()}
      </Popover>

      <ConfirmDialog
        open={confirmDelete} title="Delete drawing" destructive confirmLabel="Delete"
        description={`Delete the drawing for ${building.name}${floor ? ` · ${floor.name}` : ''}? All asset tags placed on this drawing will also be permanently removed. This cannot be undone.`}
        onConfirm={() => { setDrawing(false); setConfirmDelete(false); toast('Drawing deleted successfully.'); }}
        onClose={() => setConfirmDelete(false)}
      />
      {node}
    </Box>
  );
}
