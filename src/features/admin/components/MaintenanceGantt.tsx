/**
 * MaintenanceGantt — a reusable Gantt-style chart for maintenance progress.
 *
 * Each plan is one row; each round is a horizontal completion bar spanning the
 * months it covers, labelled with the round number + completion rate
 * (e.g. "R1: 50%", "R2: 100%"). Local to the Admin portal (the MSP portal has
 * its own separate copy).
 */
import { useMemo } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { brandTokens } from '../../../theme/theme';
import type { PlanRound } from '../data/types';

export interface GanttRow {
  id: string;
  label: string;
  rounds: PlanRound[];
}

interface MaintenanceGanttProps {
  rows: GanttRow[];
  /** 12 month buckets like 'APR-25' … 'MAR-26'. */
  months: string[];
  emptyText?: string;
}

/** Map a month bucket label (e.g. 'APR-25') to a dayjs at the 1st of that month. */
function monthLabelToDate(label: string): dayjs.Dayjs {
  const [mon, yy] = label.split('-');
  return dayjs(`20${yy}-${mon}-01`, 'YYYY-MMM-DD');
}

const BAR_HEIGHT = 22;
const ROW_HEIGHT = 34;
const LABEL_W = 240;

export default function MaintenanceGantt({ rows, months, emptyText }: MaintenanceGanttProps) {
  const theme = useTheme();

  const monthStarts = useMemo(() => months.map(monthLabelToDate), [months]);

  if (rows.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        {emptyText ?? 'No maintenance plans for the current selection.'}
      </Typography>
    );
  }

  const colCount = months.length;

  /** Compute the [startCol, endCol] (0-based, inclusive) a round spans. */
  const roundSpan = (round: PlanRound): [number, number] | null => {
    const start = dayjs(round.startDate);
    const end = dayjs(round.endDate);
    let startCol = -1;
    let endCol = -1;
    monthStarts.forEach((ms, i) => {
      const mEnd = ms.endOf('month');
      if (end.isBefore(ms) || start.isAfter(mEnd)) return;
      if (startCol === -1) startCol = i;
      endCol = i;
    });
    if (startCol === -1) return null;
    return [startCol, endCol];
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: LABEL_W + colCount * 64 }}>
        {/* Month header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
          <Box sx={{ width: LABEL_W, flexShrink: 0 }} />
          <Box sx={{ display: 'flex', flex: 1 }}>
            {months.map((m) => (
              <Box key={m} sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {m}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Rows */}
        {rows.map((row) => (
          <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: LABEL_W, flexShrink: 0, pr: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={row.label}>
                {row.label}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                height: ROW_HEIGHT,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.primary, 0.04),
                backgroundImage: `repeating-linear-gradient(to right, ${alpha(
                  theme.palette.divider,
                  0.6,
                )} 0, ${alpha(theme.palette.divider, 0.6)} 1px, transparent 1px, transparent calc(100% / ${colCount}))`,
              }}
            >
              {row.rounds.map((round) => {
                const span = roundSpan(round);
                if (!span) return null;
                const [s, e] = span;
                const leftPct = (s / colCount) * 100;
                const widthPct = ((e - s + 1) / colCount) * 100;
                const done = round.completionRate >= 100;
                const color = done ? brandTokens.status.completed : brandTokens.status.inProgress;
                return (
                  <Box
                    key={round.roundNo}
                    title={`${round.roundNo}: ${round.completionRate}%`}
                    sx={{
                      position: 'absolute',
                      top: (ROW_HEIGHT - BAR_HEIGHT) / 2,
                      left: `${leftPct}%`,
                      width: `calc(${widthPct}% - 4px)`,
                      mx: '2px',
                      height: BAR_HEIGHT,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      px: 0.5,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: alpha(color, 0.35),
                      // completion fill overlay
                      backgroundImage: `linear-gradient(to right, ${color} 0, ${color} ${round.completionRate}%, transparent ${round.completionRate}%)`,
                    }}
                  >
                    <Box component="span" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>
                      {round.roundNo}: {round.completionRate}%
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
