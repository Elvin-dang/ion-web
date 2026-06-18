/**
 * Reusable 7-column kanban board for Requests (3.3.1) and Work Orders (3.4.1).
 * Columns: New | Pending | In Progress | Review | Approval | Finalized | Rejected.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { brandTokens } from '../../../theme/theme';
import { HoverCard } from './shared';

export interface KanbanCard {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  group: KanbanGroup;
  overdue?: boolean;
}

export type KanbanGroup =
  | 'New'
  | 'Pending'
  | 'In Progress'
  | 'Review'
  | 'Approval'
  | 'Finalized'
  | 'Rejected';

const COLUMN_ORDER: KanbanGroup[] = [
  'New',
  'Pending',
  'In Progress',
  'Review',
  'Approval',
  'Finalized',
  'Rejected',
];

const COLUMN_COLORS: Record<KanbanGroup, string> = {
  New: brandTokens.status.open,
  Pending: brandTokens.status.scheduled,
  'In Progress': brandTokens.status.inProgress,
  Review: brandTokens.status.scheduled,
  Approval: brandTokens.status.completed,
  Finalized: brandTokens.status.completed,
  Rejected: brandTokens.status.overdue,
};

export default function KanbanBoard({
  cards,
  onCardClick,
  highlightGroup,
}: {
  cards: KanbanCard[];
  onCardClick: (id: string) => void;
  highlightGroup?: KanbanGroup;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
      {COLUMN_ORDER.map((group) => {
        const colCards = cards.filter((c) => c.group === group);
        const color = COLUMN_COLORS[group];
        const highlighted = highlightGroup === group || group === 'Pending';
        return (
          <Box key={group} sx={{ minWidth: 260, flexShrink: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.5,
                py: 1,
                mb: 1.5,
                borderRadius: 3,
                backgroundColor: alpha(color, highlighted ? 0.16 : 0.08),
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
                {group}
              </Typography>
              <Chip
                size="small"
                label={colCards.length}
                sx={{ backgroundColor: alpha(color, 0.16), color, fontWeight: 700 }}
              />
            </Box>
            <Stack spacing={1.5}>
              {colCards.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  No work orders
                </Typography>
              ) : (
                colCards.map((card) => (
                  <HoverCard
                    key={card.id}
                    onClick={() => onCardClick(card.id)}
                    sx={{
                      p: 1.5,
                      borderLeft:
                        group === 'Rejected' || card.overdue
                          ? `3px solid ${brandTokens.status.overdue}`
                          : `3px solid ${color}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {card.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {card.subtitle}
                    </Typography>
                    {card.meta && (
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mt: 0.5, color: card.overdue ? 'error.main' : 'text.secondary' }}
                      >
                        {card.meta}
                      </Typography>
                    )}
                  </HoverCard>
                ))
              )}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
