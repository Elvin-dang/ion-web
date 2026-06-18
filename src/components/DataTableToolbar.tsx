/**
 * DataTableToolbar — a search field + optional filter / action slots designed
 * to sit above a table or MUI DataGrid in feature screens.
 */
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import type { ReactNode } from 'react';

interface DataTableToolbarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Left-aligned filter controls. */
  filters?: ReactNode;
  /** Right-aligned action buttons. */
  actions?: ReactNode;
}

export default function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
}: DataTableToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        mb: 2,
      }}
    >
      <TextField
        value={search ?? ''}
        onChange={(e) => onSearchChange?.(e.target.value)}
        placeholder={searchPlaceholder}
        sx={{ minWidth: { xs: '100%', sm: 260 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />
      {filters}
      <Box sx={{ flexGrow: 1 }} />
      {actions}
    </Box>
  );
}
