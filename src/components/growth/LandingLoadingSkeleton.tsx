import { Card, CardContent, Skeleton, Stack } from '@mui/material'

/** Perceived-performance pattern: show structure while marketing-bundle loads. */
export function LandingLoadingSkeleton() {
  return (
    <Stack spacing={3} aria-busy="true" aria-label="Loading experience">
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" width={140} height={28} />
        <Skeleton variant="text" sx={{ fontSize: { xs: '2rem', sm: '2.75rem' }, maxWidth: '100%' }} />
        <Skeleton variant="text" width="92%" />
        <Skeleton variant="text" width="88%" />
        <Skeleton variant="text" width="70%" />
      </Stack>
      <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
        <Skeleton variant="rounded" width={100} height={32} />
        <Skeleton variant="rounded" width={120} height={32} />
        <Skeleton variant="rounded" width={90} height={32} />
      </Stack>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Skeleton variant="rounded" height={48} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={48} sx={{ flex: 1 }} />
      </Stack>
    </Stack>
  )
}
