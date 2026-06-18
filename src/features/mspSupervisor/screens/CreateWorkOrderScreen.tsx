/**
 * 5.3.1 Create Ad-hoc Work Order (MSP Supervisor). Full-page form with
 * cascading Asset System → Sub-system → Asset Type → Asset and
 * Building → Floor → Area selectors, all scoped to the User Group.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useToast } from '../components/useToast';
import {
  AREAS,
  ASSET_TYPES,
  assets,
  FLOORS,
  PRIORITIES,
  SUB_SYSTEMS,
  USER_GROUP_BUILDINGS,
  USER_GROUP_SYSTEMS,
} from '../data/mockData';

const schema = z.object({
  assetSystem: z.string().min(1, 'Asset System is required.'),
  subSystem: z.string().optional(),
  assetType: z.string().optional(),
  asset: z.string().optional(),
  building: z.string().min(1, 'Building is required.'),
  floor: z.string().optional(),
  area: z.string().optional(),
  description: z.string().min(1, 'Description is required.').max(1000, 'Description must not exceed 1000 characters.'),
  duration: z.string().optional(),
  priority: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CreateWorkOrderScreen() {
  const navigate = useNavigate();
  const { toast, toastElement } = useToast();
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assetSystem: '',
      subSystem: '',
      assetType: '',
      asset: '',
      building: '',
      floor: '',
      area: '',
      description: '',
      duration: '',
      priority: 'Medium',
    },
  });

  const assetSystem = watch('assetSystem');
  const subSystem = watch('subSystem');

  const subSystemOptions = assetSystem ? SUB_SYSTEMS[assetSystem] ?? [] : [];
  const assetTypeOptions = subSystem ? ASSET_TYPES[subSystem] ?? [] : [];
  const assetOptions = assets.filter(
    (a) => (!assetSystem || a.assetSystem === assetSystem) && (!subSystem || a.subSystem === subSystem),
  );

  const [deleteDraftOpen, setDeleteDraftOpen] = useState(false);

  const onSubmit = () => {
    toast('Work order submitted for Building Manager approval.');
    setTimeout(() => navigate('/msp/work-orders'), 600);
  };

  const handleSaveDraft = () => {
    toast('Draft saved. Status: Preparation Draft.');
    setTimeout(() => navigate('/msp/work-orders'), 600);
  };

  const handleDeleteDraft = () => {
    setDeleteDraftOpen(false);
    toast('Draft deleted.', 'info');
    setTimeout(() => navigate('/msp/work-orders'), 600);
  };

  return (
    <Box>
      <PageHeader
        title="Create Ad-hoc Work Order"
        subtitle="Submitted to the Building Manager for approval"
        breadcrumbs={[
          { label: 'MSP Supervisor', to: '/msp/dashboard' },
          { label: 'Work Orders', to: '/msp/work-orders' },
          { label: 'New Work Order' },
        ]}
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Asset Classification">
              <Stack spacing={2}>
                <Controller
                  name="assetSystem"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      required
                      fullWidth
                      label="Asset System"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('subSystem', '');
                        setValue('assetType', '');
                        setValue('asset', '');
                      }}
                    >
                      {USER_GROUP_SYSTEMS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="subSystem"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Asset Sub-system"
                      disabled={!assetSystem}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('assetType', '');
                        setValue('asset', '');
                      }}
                    >
                      {subSystemOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="assetType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Asset Type" disabled={!subSystem}>
                      {assetTypeOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="asset"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Asset" disabled={!assetSystem}>
                      {assetOptions.map((a) => (
                        <MenuItem key={a.id} value={a.code}>
                          {a.code} · {a.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Location">
              <Stack spacing={2}>
                <Controller
                  name="building"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      required
                      fullWidth
                      label="Building"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      {USER_GROUP_BUILDINGS.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="floor"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Floor">
                      {FLOORS.map((f) => (
                        <MenuItem key={f} value={f}>
                          {f}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Area / Unit">
                      {AREAS.map((a) => (
                        <MenuItem key={a} value={a}>
                          {a}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Work Details">
              <Stack spacing={2}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      multiline
                      minRows={4}
                      label="Description"
                      placeholder="Describe the work required (max 1000 characters)"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? `${field.value.length}/1000`}
                    />
                  )}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="duration"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Duration of Work" placeholder="e.g. 2 hours" />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth label="Priority">
                          {PRIORITIES.map((p) => (
                            <MenuItem key={p} value={p}>
                              {p}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
                <Box>
                  <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                    Add Attachments
                    <input hidden type="file" multiple accept="image/png,image/jpeg,application/pdf" />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    JPG, PNG or PDF · max 5 MB each · up to 5 files
                  </Typography>
                </Box>
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button variant="outlined" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button color="inherit" onClick={() => navigate('/msp/work-orders')}>
            Cancel
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="text" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDraftOpen(true)}>
            Delete Draft
          </Button>
        </Stack>
      </Box>

      <ConfirmDialog
        open={deleteDraftOpen}
        title="Delete Draft"
        description="Are you sure you want to delete this draft work order? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteDraft}
        onClose={() => setDeleteDraftOpen(false)}
      />
      {toastElement}
    </Box>
  );
}
