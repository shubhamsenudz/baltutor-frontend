import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import { Alert, Card, CardContent, List, ListItem, ListItemText, Stack, Typography } from '@mui/material'

const DEMO_SAMPLES = [
  { source: 'Example', label: 'Revise fractions before the next worksheet' },
  { source: 'Example', label: 'Quick recap: photosynthesis keywords' },
]

/**
 * Pre-populated value pattern: believable preview so the dashboard never feels “dead”
 * on first open (common activation tactic for early-stage products).
 */
export function RecallEmptyPreview({
  recallTip,
  principleLines,
}: {
  recallTip?: string
  principleLines?: string[]
}) {
  const extra =
    principleLines?.slice(0, 2).map((p, i) => ({ source: 'Principle', label: p, key: `p-${i}` })) ?? []
  const rows = [...DEMO_SAMPLES.map((r, i) => ({ ...r, key: `d-${i}` })), ...extra].slice(0, 4)

  return (
    <Stack spacing={2}>
      <Alert severity="info" icon={<AutoAwesomeOutlinedIcon fontSize="inherit" />} variant="outlined">
        <Typography variant="body2">
          {recallTip?.trim() ||
            'When you study in the real app, Owli surfaces short recall nudges here—so today’s work turns into tomorrow’s confidence.'}
        </Typography>
      </Alert>
      <Card variant="outlined" sx={{ borderStyle: 'dashed', opacity: 0.95 }}>
        <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            Sample nudges (demo)
          </Typography>
          <List dense disablePadding sx={{ mt: 1 }}>
            {rows.map((r) => (
              <ListItem key={r.key} disableGutters sx={{ py: 0.5, alignItems: 'flex-start' }}>
                <ListItemText
                  primary={
                    <>
                      <Typography component="span" variant="caption" color="primary.light" fontWeight={700} sx={{ mr: 1 }}>
                        {r.source}
                      </Typography>
                      {r.label}
                    </>
                  }
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  )
}
