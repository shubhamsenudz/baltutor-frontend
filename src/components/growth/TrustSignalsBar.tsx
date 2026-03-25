import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { Box, Chip, Stack, Typography } from '@mui/material'

/**
 * Lightweight social proof / trust row (above the fold).
 * Aligns with landing-page practice: answer “why trust this?” in the first screen.
 */
export function TrustSignalsBar({
  trustSignals,
  taglines,
}: {
  trustSignals: string[]
  taglines?: string[]
}) {
  const chips = [...(taglines ?? []).slice(0, 2), ...trustSignals.slice(0, 4)].filter(Boolean)
  if (chips.length === 0) return null
  const seen = new Set<string>()
  const unique = chips.filter((c) => {
    if (seen.has(c)) return false
    seen.add(c)
    return true
  })
  return (
    <Box
      sx={{
        py: 1.5,
        px: 0,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={0.08} display="block" sx={{ mb: 1 }}>
        Why families try Owli
      </Typography>
      <Stack
        direction="row"
        gap={1}
        sx={{
          flexWrap: 'wrap',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
        useFlexGap
      >
        {unique.slice(0, 6).map((text) => (
          <Chip
            key={text}
            icon={<VerifiedOutlinedIcon sx={{ '&&': { fontSize: 18 } }} />}
            label={text}
            size="small"
            variant="outlined"
            sx={{ borderColor: 'divider', maxWidth: '100%', '& .MuiChip-label': { whiteSpace: 'normal' } }}
          />
        ))}
      </Stack>
    </Box>
  )
}
