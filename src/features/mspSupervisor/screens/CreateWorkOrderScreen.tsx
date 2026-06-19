/**
 * 5.3.1 Create Ad-hoc Work Order (MSP Supervisor). Full-page form.
 *
 * The Asset is the single entry point: selecting it auto-derives the full Asset
 * System hierarchy (System / Sub-system / Type) and Location hierarchy (Campus /
 * Building / Floor / Area-Unit) — no manual re-entry. The supervisor then fills
 * the issue description, proposed solution, estimated time and attachments.
 */
import { useMemo, useState } from 'react';
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
import { assets, PRIORITIES } from '../data/mockData';

const schema = z.object({
  asset: z.string().min(1, 'Asset is required.'),
  description: z.string().min(1, 'Issue description is required.').max(1000, 'Description must not exceed 1000 characters.'),
  proposedSolution: z.string().max(1000, 'Proposed solution must not exceed 1000 characters.').optional(),
  estimatedTime: z.string().optional(),
  priority: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/** A read-only field displaying a value auto-derived from the selected asset. */
function DerivedField({ label, value }: { label: string; value: string }) {
  return <TextField label={label} value={value || '—'} fullWidth InputProps={{ readOnly: true }} variant="filled" />;
}

export default function CreateWorkOrderScreen() {
  const navigate = useNavigate();
  const { toast, toastElement } = useToast();
  const { control, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { asset: '', description: '', proposedSolution: '', estimatedTime: '', priority: 'Medium' },
  });

  const assetCode = watch('asset');
  const selectedAsset = useMemo(() => assets.find((a) => a.code === assetCode), [assetCode]);

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
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Asset">
              <Controller
                name="asset"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    required
                    fullWidth
                    label="Asset"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? 'Selecting an asset auto-fills its classification and location below.'}
                  >
                    {assets.map((a) => (
                      <MenuItem key={a.id} value={a.code}>
                        {a.code} · {a.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Asset Classification (auto-derived)">
              <Stack spacing={2}>
                <DerivedField label="Asset System" value={selectedAsset?.assetSystem ?? ''} />
                <DerivedField label="Asset Sub-system" value={selectedAsset?.subSystem ?? ''} />
                <DerivedField label="Asset Type" value={selectedAsset?.assetType ?? ''} />
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Location (auto-derived)">
              <Stack spacing={2}>
                {/* Campus applies only where the building belongs to one; otherwise N/A. */}
                <DerivedField label="Campus" value={selectedAsset ? '—' : ''} />
                <DerivedField label="Building" value={selectedAsset?.building ?? ''} />
                <DerivedField label="Floor" value={selectedAsset?.floor ?? ''} />
                <DerivedField label="Area / Unit" value={selectedAsset?.area ?? ''} />
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
                      label="Issue Description"
                      placeholder="Describe the issue / work required (max 1000 characters)"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? `${field.value.length}/1000`}
                    />
                  )}
                />
                <Controller
                  name="proposedSolution"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={3}
                      label="Proposed Solution"
                      placeholder="Describe the proposed solution (optional)"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="estimatedTime"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Estimated Time Required" placeholder="e.g. 2 hours" />
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
                    Add Photos / Attachments
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
