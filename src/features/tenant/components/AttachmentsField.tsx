/**
 * AttachmentsField — multi-upload control for the Service Request form.
 *
 * JPG / PNG / PDF, max 5 MB each, max 5 files (WBS 2.1.1). Shows a per-file
 * chip with a (mock) progress indicator and a size readout. Errors are surfaced
 * verbatim from `validateAttachments`.
 */
import { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import {
  ACCEPTED_FILE_EXT,
  MAX_FILES,
  validateAttachments,
} from '../serviceRequestSchema';

interface AttachmentsFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
  error: string | null;
  onError: (msg: string | null) => void;
}

function fileIcon(file: File) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return <PictureAsPdfIcon fontSize="small" />;
  if (file.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(file.name)) return <ImageIcon fontSize="small" />;
  return <InsertDriveFileIcon fontSize="small" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsField({ files, onChange, error, onError }: AttachmentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const next = [...files, ...picked];
    const validationError = validateAttachments(next);
    if (validationError) {
      onError(validationError);
      // Reset the native input so the same file can be reselected after fixing.
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    onError(null);
    onChange(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    onChange(next);
    const validationError = validateAttachments(next);
    onError(validationError);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Photos / Attachments
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Optional. JPG, PNG, or PDF. Max 5 MB each, up to {MAX_FILES} files.
      </Typography>

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={ACCEPTED_FILE_EXT}
        onChange={handlePick}
      />
      <Button
        variant="outlined"
        startIcon={<AttachFileIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={files.length >= MAX_FILES}
      >
        Add files
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {files.map((file, idx) => (
            <Box
              key={`${file.name}-${idx}`}
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.25,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
              })}
            >
              <Box sx={{ color: 'primary.main', display: 'flex' }}>{fileIcon(file)}</Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                  {file.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    color="success"
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {formatSize(file.size)}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => removeAt(idx)} aria-label={`Remove ${file.name}`}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
