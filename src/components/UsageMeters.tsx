import { LinearProgress, Stack, Typography } from '@mui/material'
import type { AiUsageSnapshotResponse } from '../api/baltutor'

function MeterRow({
  label,
  badge,
  used,
  max,
  remaining,
  color,
}: {
  label: string
  badge?: string
  used: number
  max: number
  remaining: number
  color: 'primary' | 'secondary'
}) {
  const pct = max ? Math.min(100, (used / max) * 100) : 0
  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        {badge && (
          <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 600 }}>
            {badge}
          </Typography>
        )}
      </Stack>
      <LinearProgress variant="determinate" value={pct} color={color} />
      <Typography variant="caption" color="text.secondary">
        {used} / {max} used · {remaining} left
      </Typography>
    </Stack>
  )
}

export function UsageMeters({ snap }: { snap: AiUsageSnapshotResponse | null }) {
  if (!snap) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading usage…
      </Typography>
    )
  }
  if (!snap.trackingEnabled) {
    return (
      <Typography variant="body2" color="text.secondary">
        AI usage limits are off in this environment.
      </Typography>
    )
  }
  return (
    <Stack spacing={3}>
      <MeterRow
        label="Homework helps today"
        badge={snap.freeTier ? 'Free tier' : undefined}
        used={snap.homeworkUsed}
        max={snap.homeworkMax}
        remaining={snap.homeworkRemaining}
        color="primary"
      />
      <MeterRow
        label="Chat with Owli today"
        used={snap.chatUsed}
        max={snap.chatMax}
        remaining={snap.chatRemaining}
        color="secondary"
      />
    </Stack>
  )
}
