/**
 * App-wide date formatting. The internal-feedback contract requires all dates
 * to render as dd/mm/yyyy (with HH:mm time where a timestamp is shown), instead
 * of native/ISO/US formats. Use these helpers everywhere a date is displayed
 * and the MUI DatePicker `format="DD/MM/YYYY"` for inputs.
 */
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/** Display format for dates: 20/03/2025 */
export const DATE_FORMAT = 'DD/MM/YYYY';
/** Display format for timestamps: 18:00 20/03/2025 (time first, per spec). */
export const DATETIME_FORMAT = 'HH:mm DD/MM/YYYY';

type DateInput = string | number | Date | dayjs.Dayjs | null | undefined;

/** Format a date as dd/mm/yyyy. Returns '—' for empty/invalid input. */
export function formatDate(value: DateInput): string {
  if (value == null || value === '') return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format(DATE_FORMAT) : '—';
}

/** Format a timestamp as "HH:mm dd/mm/yyyy". Returns '—' for empty/invalid. */
export function formatDateTime(value: DateInput): string {
  if (value == null || value === '') return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format(DATETIME_FORMAT) : '—';
}
