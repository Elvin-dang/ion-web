/**
 * Submit Service Request — Tenant Public Portal (WBS 2.1.1).
 *
 * Public, no-auth service-request submission. Multi-step MUI Stepper:
 *   1. Location & Asset   (Building*, Floor, Area/Unit, Asset System*, ...)
 *   2. Issue & Photos     (Description*, Attachments)
 *   3. Contact            (Name*, Phone*, Email*)
 *   -> Confirmation screen (Request ID, save-your-id note, Submit Another).
 *
 * Validation + error messages are verbatim from the checklist. If no active
 * building exists, the form is replaced with the WBS "no buildings" message.
 */
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import PlaceIcon from '@mui/icons-material/Place';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import ApartmentIcon from '@mui/icons-material/Apartment';

import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import AttachmentsField from '../components/AttachmentsField';
import SubmissionConfirmation from '../components/SubmissionConfirmation';
import { activeBuildings } from '../data/locations';
import { assetSystems } from '../data/assets';
import {
  serviceRequestSchema,
  defaultServiceRequestValues,
  validateAttachments,
  generateRequestId,
  MAX_DESCRIPTION,
  MAX_NAME,
  MAX_PHONE,
  type ServiceRequestForm,
} from '../serviceRequestSchema';

const STEPS = [
  { label: 'Location & Asset', icon: <PlaceIcon /> },
  { label: 'Issue & Photos', icon: <DescriptionIcon /> },
  { label: 'Contact Details', icon: <ContactMailIcon /> },
];

// Field groups per step, used to trigger partial validation on "Next".
const STEP_FIELDS: (keyof ServiceRequestForm)[][] = [
  ['buildingId', 'floorId', 'areaId', 'assetSystemId', 'assetSubSystemId', 'assetTypeId', 'assetId'],
  ['description'],
  ['contactName', 'contactPhone', 'contactEmail'],
];

export default function SubmitServiceRequest() {
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState('');

  const {
    control,
    handleSubmit,
    trigger,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: defaultServiceRequestValues,
    mode: 'onTouched',
  });

  const buildingId = watch('buildingId');
  const floorId = watch('floorId');
  const assetSystemId = watch('assetSystemId');
  const assetSubSystemId = watch('assetSubSystemId');
  const assetTypeId = watch('assetTypeId');
  const description = watch('description');

  // Cascading option lists.
  const floors = useMemo(
    () => activeBuildings.find((b) => b.id === buildingId)?.floors ?? [],
    [buildingId],
  );
  const areas = useMemo(
    () => floors.find((f) => f.id === floorId)?.areas ?? [],
    [floors, floorId],
  );
  const subSystems = useMemo(
    () => assetSystems.find((s) => s.id === assetSystemId)?.subSystems ?? [],
    [assetSystemId],
  );
  const assetTypes = useMemo(
    () => subSystems.find((s) => s.id === assetSubSystemId)?.types ?? [],
    [subSystems, assetSubSystemId],
  );
  const assets = useMemo(
    () => assetTypes.find((t) => t.id === assetTypeId)?.assets ?? [],
    [assetTypes, assetTypeId],
  );

  // Precondition: at least one active building must exist (WBS step 2).
  if (activeBuildings.length === 0) {
    return (
      <Box>
        <PageHeader
          title="Submit Service Request"
          subtitle="Report a maintenance issue in your building."
        />
        <Card>
          <CardContent>
            <EmptyState
              icon={<ApartmentIcon />}
              title="No buildings are currently available"
              description="No buildings are currently available. Please contact your building management office."
            />
          </CardContent>
        </Card>
      </Box>
    );
  }

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[activeStep]);
    if (activeStep === 1) {
      // Re-validate attachments before leaving the Issue & Photos step.
      const attErr = validateAttachments(files);
      setFileError(attErr);
      if (attErr) return;
    }
    if (valid) setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const onValid = async (values: ServiceRequestForm) => {
    const attErr = validateAttachments(files);
    if (attErr) {
      setFileError(attErr);
      setActiveStep(1);
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Simulate server round-trip. WBS: loading indicator; >15s => timeout.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const id = generateRequestId();
      setConfirmedId(id);
      setConfirmedEmail(values.contactEmail);
    } catch {
      setSubmitError('Submission timed out. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    reset(defaultServiceRequestValues);
    setFiles([]);
    setFileError(null);
    setSubmitError(null);
    setConfirmedId(null);
    setConfirmedEmail('');
    setActiveStep(0);
  };

  // Confirmation screen (WBS step 5).
  if (confirmedId) {
    return (
      <Box>
        <PageHeader
          title="Submit Service Request"
          subtitle="Report a maintenance issue in your building."
        />
        <SubmissionConfirmation
          requestId={confirmedId}
          email={confirmedEmail}
          onSubmitAnother={handleSubmitAnother}
        />
      </Box>
    );
  }

  const selectErrorSx = { '& .MuiFormHelperText-root': { fontWeight: 500 } };

  return (
    <Box>
      <PageHeader
        title="Submit Service Request"
        subtitle="Report a maintenance issue. No account needed — you'll get email updates."
      />

      <Card sx={{ maxWidth: 880, mx: 'auto' }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" noValidate onSubmit={handleSubmit(onValid)}>
            {/* ---- Step 1: Location & Asset ---- */}
            {activeStep === 0 && (
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Where is the issue?
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="buildingId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        required
                        label="Building"
                        error={!!errors.buildingId}
                        helperText={errors.buildingId?.message}
                        sx={selectErrorSx}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue('floorId', '');
                          setValue('areaId', '');
                        }}
                      >
                        {activeBuildings.map((b) => (
                          <MenuItem key={b.id} value={b.id}>
                            {b.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="floorId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Floor"
                        disabled={!buildingId || floors.length === 0}
                        helperText={!buildingId ? 'Select a building first' : ' '}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue('areaId', '');
                        }}
                      >
                        {floors.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="areaId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Area / Unit"
                        disabled={!floorId || areas.length === 0}
                        helperText={!floorId ? 'Select a floor first' : ' '}
                      >
                        {areas.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ mb: 0.5, mt: 1 }}>
                    What needs attention?
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="assetSystemId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        required
                        label="Asset System"
                        error={!!errors.assetSystemId}
                        helperText={errors.assetSystemId?.message}
                        sx={selectErrorSx}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue('assetSubSystemId', '');
                          setValue('assetTypeId', '');
                          setValue('assetId', '');
                        }}
                      >
                        {assetSystems.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="assetSubSystemId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Asset Sub-system"
                        disabled={!assetSystemId || subSystems.length === 0}
                        helperText={!assetSystemId ? 'Select an asset system first' : ' '}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue('assetTypeId', '');
                          setValue('assetId', '');
                        }}
                      >
                        {subSystems.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="assetTypeId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Asset Type"
                        disabled={!assetSubSystemId || assetTypes.length === 0}
                        helperText={!assetSubSystemId ? 'Select a sub-system first' : ' '}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue('assetId', '');
                        }}
                      >
                        {assetTypes.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="assetId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Asset"
                        disabled={!assetTypeId || assets.length === 0}
                        helperText={!assetTypeId ? 'Select an asset type first' : ' '}
                      >
                        {assets.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {/* ---- Step 2: Issue & Photos ---- */}
            {activeStep === 1 && (
              <Stack spacing={3}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      required
                      multiline
                      minRows={5}
                      label="Issue Description"
                      placeholder="Please describe the issue in detail"
                      error={!!errors.description}
                      helperText={
                        errors.description?.message ??
                        `${description?.length ?? 0}/${MAX_DESCRIPTION} characters`
                      }
                    />
                  )}
                />
                <AttachmentsField
                  files={files}
                  onChange={setFiles}
                  error={fileError}
                  onError={setFileError}
                />
              </Stack>
            )}

            {/* ---- Step 3: Contact ---- */}
            {activeStep === 2 && (
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    We'll send all updates about this request to the email you provide below.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="contactName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Full Name"
                        inputProps={{ maxLength: MAX_NAME }}
                        error={!!errors.contactName}
                        helperText={errors.contactName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="contactPhone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Phone Number"
                        inputProps={{ maxLength: MAX_PHONE }}
                        error={!!errors.contactPhone}
                        helperText={errors.contactPhone?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    name="contactEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        type="email"
                        label="Email"
                        inputProps={{ maxLength: MAX_NAME }}
                        error={!!errors.contactEmail}
                        helperText={errors.contactEmail?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {submitError && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {submitError}
              </Alert>
            )}

            {/* ---- Navigation ---- */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 4,
                gap: 2,
              }}
            >
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || submitting}
                startIcon={<ArrowBackIcon />}
                color="inherit"
              >
                Back
              </Button>

              {activeStep < STEPS.length - 1 ? (
                <Button variant="contained" onClick={handleNext} endIcon={<ArrowForwardIcon />}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={
                    submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />
                  }
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
