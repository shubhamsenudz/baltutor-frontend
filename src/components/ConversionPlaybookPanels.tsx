import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { ConversionPlaybookResponse } from '../api/baltutor'

function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Stack spacing={1}>
      {items.map((f) => (
        <Accordion key={f.question}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.light' }} />}>
            <Typography variant="subtitle2" fontWeight={600}>
              {f.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {f.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  )
}

export function LandingPlaybookSections({ playbook }: { playbook: ConversionPlaybookResponse | null }) {
  if (!playbook) return null
  return (
    <Stack spacing={2.5} sx={{ mt: 2 }}>
      {(playbook.riskReversalHeadline || playbook.riskReversalBody) && (
        <Card
          variant="outlined"
          sx={(t) => ({
            borderColor: 'primary.dark',
            bgcolor: alpha(t.palette.primary.main, 0.1),
          })}
        >
          <CardContent>
            <Stack spacing={1.5}>
              {playbook.riskReversalHeadline && (
                <Typography variant="h5" component="h2">
                  {playbook.riskReversalHeadline}
                </Typography>
              )}
              {playbook.riskReversalBody && (
                <Typography variant="body1" color="text.secondary">
                  {playbook.riskReversalBody}
                </Typography>
              )}
              {playbook.cancelAnytimeHighlight && (
                <Typography variant="body2" color="primary.light" fontWeight={600}>
                  {playbook.cancelAnytimeHighlight}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {playbook.trustSignals.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Why families trust this model
            </Typography>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }}>
              {playbook.trustSignals.map((t) => (
                <Typography key={t} component="li" variant="body2" color="text.secondary">
                  {t}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {playbook.freeVsPaidHighlights.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Free vs paid—same Owli, different headroom
            </Typography>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }}>
              {playbook.freeVsPaidHighlights.map((x) => (
                <Typography key={x} component="li" variant="body2" color="text.secondary">
                  {x}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {playbook.premiumUnlockBullets.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              What paid unlocks
            </Typography>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }}>
              {playbook.premiumUnlockBullets.map((x) => (
                <Typography key={x} component="li" variant="body2" color="text.secondary">
                  {x}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {playbook.parentPitchHeadline && (
        <Card sx={{ borderColor: 'secondary.dark', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              {playbook.parentPitchHeadline}
            </Typography>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }}>
              {playbook.parentPitchBullets.map((x) => (
                <Typography key={x} component="li" variant="body2" color="text.secondary">
                  {x}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {playbook.socialProofLines.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Built for real classrooms
            </Typography>
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
              {playbook.socialProofLines.map((x) => (
                <Typography key={x} component="li" variant="caption" color="text.secondary">
                  {x}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {playbook.softUrgencyNote && (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          {playbook.softUrgencyNote}
        </Typography>
      )}

      {playbook.paymentPathNote && (
        <Typography variant="body2" color="text.secondary">
          {playbook.paymentPathNote}
        </Typography>
      )}

      {playbook.faqs.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Questions before you subscribe
            </Typography>
            <FaqList items={playbook.faqs} />
          </CardContent>
        </Card>
      )}

      {(playbook.trialTeaserHeadline || playbook.trialTeaserBody) && (
        <Card variant="outlined">
          <CardContent>
            {playbook.trialTeaserHeadline && (
              <Typography variant="h6" gutterBottom>
                {playbook.trialTeaserHeadline}
              </Typography>
            )}
            {playbook.trialTeaserBody && (
              <Typography variant="body2" color="text.secondary">
                {playbook.trialTeaserBody}
              </Typography>
            )}
            {playbook.refundOrCancelSummary && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {playbook.refundOrCancelSummary}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

export function PaywallPlaybookStep({ playbook }: { playbook: ConversionPlaybookResponse | null }) {
  if (!playbook) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading trust & FAQ…
      </Typography>
    )
  }
  const faqs = playbook.faqs.slice(0, 5)
  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h2">
        Trust, parents & billing
      </Typography>
      {playbook.cancelAnytimeHighlight && (
        <Typography variant="body2" color="primary.light" fontWeight={600}>
          {playbook.cancelAnytimeHighlight}
        </Typography>
      )}
      {(playbook.riskReversalHeadline || playbook.riskReversalBody) && (
        <Stack spacing={0.5}>
          {playbook.riskReversalHeadline && (
            <Typography variant="subtitle1" fontWeight={700}>
              {playbook.riskReversalHeadline}
            </Typography>
          )}
          {playbook.riskReversalBody && (
            <Typography variant="caption" color="text.secondary">
              {playbook.riskReversalBody}
            </Typography>
          )}
        </Stack>
      )}
      {playbook.trustSignals.length > 0 && (
        <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
          {playbook.trustSignals.map((t) => (
            <Typography key={t} component="li" variant="body2" color="text.secondary">
              {t}
            </Typography>
          ))}
        </Stack>
      )}
      {playbook.premiumUnlockBullets.length > 0 && (
        <>
          <Typography variant="subtitle2" color="primary.light">
            Paid unlocks
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {playbook.premiumUnlockBullets.map((x) => (
              <Typography key={x} component="li" variant="body2" color="text.secondary">
                {x}
              </Typography>
            ))}
          </Stack>
        </>
      )}
      {playbook.parentPitchHeadline && (
        <>
          <Typography variant="subtitle2" color="primary.light">
            For parents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {playbook.parentPitchHeadline}
          </Typography>
        </>
      )}
      {playbook.paymentPathNote && (
        <Typography variant="caption" color="text.secondary">
          {playbook.paymentPathNote}
        </Typography>
      )}
      {faqs.length > 0 && <FaqList items={faqs} />}
      {playbook.trialTeaserBody && (
        <Typography variant="caption" color="text.secondary">
          {playbook.trialTeaserBody}
        </Typography>
      )}
      {playbook.refundOrCancelSummary && (
        <Typography variant="caption" color="text.secondary">
          {playbook.refundOrCancelSummary}
        </Typography>
      )}
    </Stack>
  )
}
