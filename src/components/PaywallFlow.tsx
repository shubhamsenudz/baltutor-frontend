import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import type {
  AccessPolicyResponse,
  ConversionPlaybookResponse,
  FirstUseConversionCopyResponse,
} from '../api/baltutor'
import { formatPaiseInr, weeklyFromYearlyPaise } from '../api/baltutor'
import { PaywallPlaybookStep } from './ConversionPlaybookPanels'

type Props = {
  open: boolean
  onClose: () => void
  conversion: FirstUseConversionCopyResponse | null
  playbook: ConversionPlaybookResponse | null
  policy: AccessPolicyResponse | null
  triggeredByNudge: boolean
}

const STEP_LABELS = ['Value', 'Compare', 'Trust', 'Plans']

export function PaywallFlow({
  open,
  onClose,
  conversion,
  playbook,
  policy,
  triggeredByNudge,
}: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => setStep(0))
    return () => cancelAnimationFrame(id)
  }, [open])

  const c = conversion
  const p = policy

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            maxHeight: '92vh',
            borderRadius: 3,
          },
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ px: 2, pt: 2, pr: 1 }}>
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0, pl: 1 }}>
          {triggeredByNudge && (
            <Chip
              size="small"
              label="Right after your first minutes with Owli"
              color="primary"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          <Stepper activeStep={step} alternativeLabel sx={{ py: 1, display: { xs: 'none', sm: 'flex' } }}>
            {STEP_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 600 },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>
            Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} aria-label="Close" edge="end" size="small">
          <CloseIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        {step === 0 && c && (
          <Stack spacing={2.5}>
            <Typography variant="h4" component="h2">
              {c.headline || 'Unlock Owli'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {c.subhead}
            </Typography>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }}>
              {c.quickWins.map((q) => (
                <Typography key={q} component="li" variant="body2">
                  {q}
                </Typography>
              ))}
            </Stack>
            {playbook?.cancelAnytimeHighlight && (
              <Chip label={playbook.cancelAnytimeHighlight} color="primary" variant="filled" sx={{ alignSelf: 'flex-start' }} />
            )}
            <Typography variant="caption" color="text.secondary">
              Value → vs generic AI → trust & billing → plans
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button variant="contained" color="primary" size="large" onClick={() => setStep(1)}>
                Why not ChatGPT?
              </Button>
              <Button variant="outlined" onClick={() => setStep(2)}>
                Skip to trust & FAQ
              </Button>
              <Button variant="text" onClick={() => setStep(3)}>
                Skip to plans
              </Button>
            </Stack>
          </Stack>
        )}

        {step === 1 && c && (
          <Stack spacing={2.5}>
            <Typography variant="h4" component="h2">
              Generic AI vs Owli
            </Typography>
            <Stack spacing={1.5}>
              {c.vsGenericAi.map((row) => (
                <Box
                  key={row.pain}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  }}
                >
                  <Typography variant="caption" color="primary.light" fontWeight={700} display="block" gutterBottom>
                    Pain
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {row.pain}
                  </Typography>
                  <Typography variant="caption" color="secondary.light" fontWeight={700} display="block" gutterBottom>
                    Owli
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.owliAnswer}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button variant="contained" size="large" onClick={() => setStep(2)}>
                Continue
              </Button>
              <Button variant="outlined" onClick={() => setStep(0)}>
                Back
              </Button>
            </Stack>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2.5}>
            <PaywallPlaybookStep playbook={playbook} />
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button variant="contained" size="large" onClick={() => setStep(3)}>
                {c?.ctaSecondary || 'See plans'}
              </Button>
              <Button variant="outlined" onClick={() => setStep(1)}>
                Back
              </Button>
            </Stack>
          </Stack>
        )}

        {step === 3 && p && (
          <Stack spacing={2.5}>
            <Typography variant="h4" component="h2">
              Plans & daily limits
            </Typography>
            {p.summary && (
              <Typography variant="body1" color="text.secondary">
                {p.summary}
              </Typography>
            )}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
              {p.plans.map((plan) => (
                <Box
                  key={plan.code}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    p: 2.5,
                    borderRadius: 2,
                    border: (theme) =>
                      plan.code === 'STANDARD'
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${alpha('#fff', 0.1)}`,
                    bgcolor: (theme) =>
                      plan.code === 'STANDARD' ? alpha(theme.palette.primary.main, 0.08) : alpha('#fff', 0.03),
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    {plan.code}
                  </Typography>
                  <Typography variant="h6">{plan.title}</Typography>
                  <Typography variant="h5" color="primary.light" sx={{ mt: 1 }}>
                    {plan.monthlyPriceDisplay}
                  </Typography>
                  {plan.yearlyPricePaise > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {plan.yearlyPriceDisplay}
                      {plan.effectiveMonthlyWhenYearlyDisplay && (
                        <span> · {plan.effectiveMonthlyWhenYearlyDisplay}</span>
                      )}
                    </Typography>
                  )}
                  {plan.yearlyPricePaise > 0 && (
                    <Typography variant="caption" color="primary.light" display="block" sx={{ mt: 0.5 }}>
                      {weeklyFromYearlyPaise(plan.yearlyPricePaise)}
                    </Typography>
                  )}
                  <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2, my: 2 }}>
                    <Typography component="li" variant="body2" color="text.secondary">
                      {plan.homeworkAiPerDay} homework AI / day
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      {plan.chatAiPerDay} chat AI / day
                    </Typography>
                  </Stack>
                  {plan.code !== 'FREE' && (
                    <Button
                      variant="contained"
                      fullWidth
                      disabled
                      title="Wire to Play Billing / App Store"
                    >
                      {c?.ctaPrimary || 'Subscribe'} ({formatPaiseInr(plan.monthlyPricePaise)}/mo)
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
            {p.fairUseNote && (
              <Typography variant="caption" color="text.secondary">
                {p.fairUseNote}
              </Typography>
            )}
            {p.paidTierRequiresSignIn && (
              <Typography variant="caption" color="text.secondary">
                Paid tier requires Google sign-in in the real app.
              </Typography>
            )}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={onClose}>{c?.dismissLabel || 'Maybe later'}</Button>
            </Stack>
          </Stack>
        )}

        {((step === 0 || step === 1) && !c) || (step === 3 && !p) ? (
          <Typography variant="body2" color="text.secondary">
            Loading paywall copy…
          </Typography>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
