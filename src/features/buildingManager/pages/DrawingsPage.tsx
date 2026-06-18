/**
 * Drawings (Building Manager).
 *
 * Building list on the LEFT, scoped to the BM's assigned buildings only (no
 * "+ New Building" — BMs cannot create buildings). Drawing detail panel on the
 * RIGHT: per-floor as-built drawings with a mock PDF viewer (pan/zoom), upload
 * (PDF only, max 50MB), replace (warns that placed tags are removed) and delete.
 * Placed asset tags support free-drag (hold-drag-drop) positioning.
 *
 * NOTE: Asset tag *placement/creation* lives on the Assets screen; here tags are
 * shown read-only except for repositioning existing ones via drag.
 */
import { useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import ApartmentIcon from '@mui/icons-material/Apartment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlaceIcon from '@mui/icons-material/Place';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { SectionCard, useToast } from '../components/shared';
import { formatDateTime } from '../../../utils/date';
import { buildings, bmAssignedBuildingIds, floorDrawings as seedDrawings } from '../data/mockData';
import type { FloorDrawing, DrawingTag } from '../data/types';

const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB

export default function DrawingsPage() {
  const { show, node } = useToast();

  // BM is scoped to assigned buildings only.
  const myBuildings = useMemo(
    () => buildings.filter((b) => bmAssignedBuildingIds.includes(b.id)),
    [],
  );

  const [drawings, setDrawings] = useState<FloorDrawing[]>(seedDrawings);
  const [buildingId, setBuildingId] = useState(myBuildings[0]?.id ?? '');
  const building = myBuildings.find((b) => b.id === buildingId);
  const [floor, setFloor] = useState(building?.floors[0] ?? '');

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Drag state for free-drag tag repositioning.
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingTag = useRef<string | null>(null);
  const panning = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const drawing = drawings.find((d) => d.buildingId === buildingId && d.floor === floor);

  const selectBuilding = (id: string) => {
    setBuildingId(id);
    const first = buildings.find((b) => b.id === id)?.floors[0] ?? '';
    setFloor(first);
    resetView();
  };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const validatePdf = (file: File | undefined): boolean => {
    if (!file) return false;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      show('Only PDF files are allowed.', 'error');
      return false;
    }
    if (file.size > MAX_PDF_BYTES) {
      show('File exceeds the 50MB limit.', 'error');
      return false;
    }
    return true;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!validatePdf(file)) { e.target.value = ''; return; }
    const next: FloorDrawing = {
      id: `DRW-${Date.now()}`,
      buildingId,
      floor,
      fileName: file!.name,
      uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      tags: [],
    };
    setDrawings((prev) => [...prev, next]);
    show('Drawing uploaded successfully.');
    e.target.value = '';
  };

  const handleReplaceConfirmed = () => {
    setReplaceOpen(false);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!validatePdf(file)) { e.target.value = ''; return; }
    setDrawings((prev) =>
      prev.map((d) =>
        d.id === drawing?.id
          ? { ...d, fileName: file!.name, uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '), tags: [] }
          : d,
      ),
    );
    show('Drawing replaced. All previous asset tags were removed.');
    e.target.value = '';
  };

  const handleDelete = () => {
    setDrawings((prev) => prev.filter((d) => d.id !== drawing?.id));
    setDeleteOpen(false);
    resetView();
    show('Drawing deleted.');
  };

  // --- Pointer interactions: drag a tag, otherwise pan the canvas. ---
  const onTagPointerDown = (e: React.PointerEvent, tagId: string) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    draggingTag.current = tagId;
  };

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    panning.current = { startX: e.clientX, startY: e.clientY, baseX: pan.x, baseY: pan.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (draggingTag.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
      setDrawings((prev) =>
        prev.map((d) =>
          d.id === drawing?.id
            ? { ...d, tags: d.tags.map((t) => (t.id === draggingTag.current ? { ...t, x, y } : t)) }
            : d,
        ),
      );
      return;
    }
    if (panning.current) {
      setPan({
        x: panning.current.baseX + (e.clientX - panning.current.startX),
        y: panning.current.baseY + (e.clientY - panning.current.startY),
      });
    }
  };

  const onPointerUp = () => {
    if (draggingTag.current) show('Tag position updated.');
    draggingTag.current = null;
    panning.current = null;
  };

  const floors = building?.floors ?? [];

  return (
    <Box>
      <PageHeader title="Drawings" subtitle="As-built floor drawings for your assigned buildings" />

      <Grid container spacing={3}>
        {/* LEFT: building list (scoped to assigned buildings, no New Building) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              My Buildings
            </Typography>
            <List disablePadding>
              {myBuildings.map((b) => (
                <ListItemButton
                  key={b.id}
                  selected={b.id === buildingId}
                  onClick={() => selectBuilding(b.id)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ApartmentIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                  <ListItemText primary={b.name} secondary={`${b.floors.length} floors`} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* RIGHT: drawing detail panel */}
        <Grid size={{ xs: 12, md: 9 }}>
          <SectionCard
            title={building ? `${building.name} — As-Built Drawings` : 'Drawings'}
            action={
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField select size="small" label="Floor" value={floor} onChange={(e) => { setFloor(e.target.value); resetView(); }} sx={{ minWidth: 120 }}>
                  {floors.map((f) => (<MenuItem key={f} value={f}>{f}</MenuItem>))}
                </TextField>
                {drawing ? (
                  <>
                    <Button variant="outlined" size="small" startIcon={<SwapHorizIcon />} onClick={() => setReplaceOpen(true)} sx={{ borderRadius: 8 }}>
                      Replace
                    </Button>
                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} sx={{ borderRadius: 8 }}>
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" size="small" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 8 }}>
                    Upload Drawing
                    <input hidden type="file" accept="application/pdf,.pdf" onChange={handleUpload} />
                  </Button>
                )}
              </Stack>
            }
          >
            {!drawing ? (
              <EmptyState
                title={`No drawing for floor ${floor || '—'}.`}
                description="Upload a PDF (max 50MB) to view it here."
              />
            ) : (
              <>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <PictureAsPdfIcon color="error" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{drawing.fileName}</Typography>
                    <Typography variant="caption" color="text.secondary">Uploaded {formatDateTime(drawing.uploadedAt)}</Typography>
                  </Box>
                  <StatusChip status="Active" label={`${drawing.tags.length} tag(s)`} />
                  <Divider orientation="vertical" flexItem />
                  <Tooltip title="Zoom out"><span><IconButton size="small" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} disabled={zoom <= 0.5}><ZoomOutIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Typography variant="caption" sx={{ width: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Typography>
                  <Tooltip title="Zoom in"><span><IconButton size="small" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} disabled={zoom >= 3}><ZoomInIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Reset view"><IconButton size="small" onClick={resetView}><RestartAltIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>

                {/* Mock PDF viewer: pan by dragging the canvas, zoom via controls. */}
                <Box
                  onPointerDown={onCanvasPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  sx={(t) => ({
                    position: 'relative',
                    height: 460,
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: `1px solid ${t.palette.divider}`,
                    backgroundColor: alpha(t.palette.text.primary, 0.02),
                    cursor: 'grab',
                    touchAction: 'none',
                    '&:active': { cursor: 'grabbing' },
                  })}
                >
                  <Box
                    ref={canvasRef}
                    sx={(t) => ({
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 520,
                      height: 380,
                      transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                      backgroundColor: t.palette.background.paper,
                      boxShadow: 3,
                      backgroundImage: `linear-gradient(${alpha(t.palette.divider, 0.6)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(t.palette.divider, 0.6)} 1px, transparent 1px)`,
                      backgroundSize: '32px 32px',
                    })}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 8, left: 12 }}>
                      {drawing.fileName} · {building?.name} {floor}
                    </Typography>
                    {drawing.tags.map((tag: DrawingTag) => (
                      <Tooltip key={tag.id} title={`${tag.label} (drag to reposition)`}>
                        <Box
                          onPointerDown={(e) => onTagPointerDown(e, tag.id)}
                          sx={{
                            position: 'absolute',
                            left: `${tag.x}%`,
                            top: `${tag.y}%`,
                            transform: 'translate(-50%, -100%)',
                            textAlign: 'center',
                            cursor: 'grab',
                            '&:active': { cursor: 'grabbing' },
                          }}
                        >
                          <PlaceIcon color="primary" sx={{ fontSize: 28 }} />
                          <Box sx={(t) => ({ mt: -0.5, px: 0.5, borderRadius: 1, backgroundColor: t.palette.primary.main, color: t.palette.primary.contrastText, fontSize: 9, whiteSpace: 'nowrap' })}>
                            {tag.label}
                          </Box>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Drag the canvas to pan, use the controls to zoom. Drag a tag to reposition it. Asset tags are created on the Assets screen.
                </Typography>
              </>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Hidden input used by Replace flow (after confirmation). */}
      <input ref={replaceInputRef} hidden type="file" accept="application/pdf,.pdf" onChange={handleReplaceFile} />

      <ConfirmDialog
        open={replaceOpen}
        title="Replace Drawing"
        description="Replacing this drawing will remove ALL existing asset tags placed on it. This cannot be undone. Continue?"
        destructive
        confirmLabel="Choose New PDF"
        onConfirm={handleReplaceConfirmed}
        onClose={() => setReplaceOpen(false)}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Drawing"
        description="Delete this drawing and all placed asset tags? This cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
      {node}
    </Box>
  );
}
