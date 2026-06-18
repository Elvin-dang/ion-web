/**
 * 5.5.3 Create Maintenance Plan (MSP Supervisor). Full-page form, cascading
 * System → Sub-system → Asset Type, Building, Frequency, Time Required.
 * Submitted with Status: Pending for BM approval.
 */
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
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useToast } from '../components/useToast';
import { ASSET_TYPES, SUB_SYSTEMS, USER_GROUP_BUILDINGS, USER_GROUP_SYSTEMS } from '../data/mockData';

const FREQUENCIES = ['Monthly', 'Quarterly', 'Yearly'] as const;

const schema = z.object({
  name: z.string().min(1, 'Plan name is required.').max(150, 'Plan name must not exceed 150 characters.'),
  assetSystem: z.string().min(1, 'Asset System is required.'),
  subSystem: z.string().min(1, 'Asset Sub-system is required.'),
  assetType: z.string().min(1, 'Asset Type is required.'),
  building: z.string().min(1, 'Building is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
  timeRequired: z.string().min(1, 'Time required is required.'),
  description: z.string().max(500).optional(),
  remark: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CreateMaintenancePlanScreen() {
  const navigate = useNavigate();
  const { toast, toastElement } = useToast();
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', assetSystem: '', subSystem: '', assetType: '', building: '', frequency: '', timeRequired: '', description: '', remark: '' },
  });

  const assetSystem = watch('assetSystem');
  const subSystem = watch('subSystem');
  const subSystemOptions = assetSystem ? SUB_SYSTEMS[assetSystem] ?? [] : [];
  const assetTypeOptions = subSystem ? ASSET_TYPES[subSystem] ?? [] : [];

  const onSubmit = () => {
    toast('Maintenance plan submitted for Building Manager approval.');
    setTimeout(() => navigate('/msp/maintenance-plans'), 600);
  };

  return (
    <Box>
      <PageHeader
        title="Create Maintenance Plan"
        subtitle="Submitted to the Building Manager for approval (Status: Pending)"
        breadcrumbs={[
          { label: 'MSP Supervisor', to: '/msp/dashboard' },
          { label: 'Maintenance Plans', to: '/msp/maintenance-plans' },
          { label: 'New Plan' },
        ]}
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Plan Details">
              <Stack spacing={2}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} required fullWidth label="Plan Name" error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
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
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      required
                      fullWidth
                      label="Asset Sub-system"
                      disabled={!assetSystem}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('assetType', '');
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
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      required
                      fullWidth
                      label="Asset Type"
                      disabled={!subSystem}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      {assetTypeOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Schedule">
              <Stack spacing={2}>
                <Controller
                  name="building"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} select required fullWidth label="Building" error={!!fieldState.error} helperText={fieldState.error?.message}>
                      {USER_GROUP_BUILDINGS.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} select required fullWidth label="Frequency" error={!!fieldState.error} helperText={fieldState.error?.message}>
                      {FREQUENCIES.map((f) => (
                        <MenuItem key={f} value={f}>
                          {f}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="timeRequired"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} required fullWidth label="Time Required to Complete" placeholder="e.g. 3 hours" error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Additional Info">
              <Stack spacing={2}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} label="Description" inputProps={{ maxLength: 500 }} />}
                />
                <Controller
                  name="remark"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth multiline minRows={2} label="Remark" inputProps={{ maxLength: 500 }} />}
                />
                <Box>
                  <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                    Add Photos
                    <input hidden type="file" multiple accept="image/png,image/jpeg" />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    JPG or PNG · max 5 MB per photo
                  </Typography>
                </Box>
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained">
            Submit for BM Approval
          </Button>
          <Button color="inherit" onClick={() => navigate('/msp/maintenance-plans')}>
            Cancel
          </Button>
        </Stack>
      </Box>
      {toastElement}
    </Box>
  );
}
