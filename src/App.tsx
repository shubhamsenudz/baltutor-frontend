import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fab,
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useCallback, useEffect, useState } from 'react'
import {
  API,
  type AccessPolicyResponse,
  type AiUsageSnapshotResponse,
  type ConversionPlaybookResponse,
  type FirstUseConversionCopyResponse,
  type FirstUseConversionNudgeResponse,
  type OnboardingExperienceResponse,
  type PreferredOutput,
  type RecallSuggestionItem,
  type SelfStudyGuideResponse,
  type SessionResponse,
  clearStoredSessionId,
} from './api/baltutor'
import { ApiLabPanel } from './components/dev/ApiLabPanel'
import { LandingPlaybookSections } from './components/ConversionPlaybookPanels'
import { isActivationChecklistDismissed } from './components/growth/activationChecklistStorage'
import { HomeActivationChecklist } from './components/growth/HomeActivationChecklist'
import { LandingLoadingSkeleton } from './components/growth/LandingLoadingSkeleton'
import { RecallEmptyPreview } from './components/growth/RecallEmptyPreview'
import { TrustSignalsBar } from './components/growth/TrustSignalsBar'
import { PaywallFlow } from './components/PaywallFlow'
import { UsageMeters } from './components/UsageMeters'

type Phase = 'landing' | 'onboarding' | 'home'

const PAYWALL_AUTO_DISMISS_KEY = 'baltutor_auto_paywall_dismissed'

export default function App() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [err, setErr] = useState<string | null>(null)

  const [onb, setOnb] = useState<OnboardingExperienceResponse | null>(null)
  const [selfStudy, setSelfStudy] = useState<SelfStudyGuideResponse | null>(null)
  const [conversion, setConversion] = useState<FirstUseConversionCopyResponse | null>(null)
  const [playbook, setPlaybook] = useState<ConversionPlaybookResponse | null>(null)
  const [policy, setPolicy] = useState<AccessPolicyResponse | null>(null)

  const [painPick, setPainPick] = useState<string | null>(null)
  const [classLevel, setClassLevel] = useState(8)
  const [board, setBoard] = useState('CBSE')
  const [preferredOutput, setPreferredOutput] = useState<PreferredOutput>('HINGLISH')

  const [session, setSession] = useState<SessionResponse | null>(null)
  const [usage, setUsage] = useState<AiUsageSnapshotResponse | null>(null)
  const [nudge, setNudge] = useState<FirstUseConversionNudgeResponse | null>(null)
  const [recall, setRecall] = useState<RecallSuggestionItem[]>([])

  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallFromNudge, setPaywallFromNudge] = useState(false)
  const [postDismissTip, setPostDismissTip] = useState<string | null>(null)

  /** Two-step onboarding: goal first, then school prefs (time-to-value / completion research). */
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null)
  const [checklistDismissed, setChecklistDismissed] = useState(() => isActivationChecklistDismissed())

  const loadPublic = useCallback(async () => {
    setErr(null)
    try {
      const [bundle, a] = await Promise.all([API.marketingBundle(), API.accessPolicy()])
      setOnb(bundle.onboardingExperience)
      setSelfStudy(bundle.selfStudyGuide)
      setConversion(bundle.firstUseConversion)
      setPlaybook(bundle.conversionPlaybook)
      setPolicy(a)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    let alive = true
    const id = requestAnimationFrame(() => {
      if (alive) void loadPublic()
    })
    return () => {
      alive = false
      cancelAnimationFrame(id)
    }
  }, [loadPublic])

  const refreshSessionData = useCallback(async () => {
    try {
      const [sess, u, n, r] = await Promise.all([
        API.sessionGet(),
        API.aiUsageToday(),
        API.firstUseNudge(),
        API.recallSuggestions(),
      ])
      setSession(sess)
      setUsage(u)
      setNudge(n)
      setRecall(r)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    if (phase !== 'home') return
    let alive = true
    const boot = requestAnimationFrame(() => {
      if (alive) void refreshSessionData()
    })
    const t = window.setInterval(() => void refreshSessionData(), 20000)
    return () => {
      alive = false
      cancelAnimationFrame(boot)
      window.clearInterval(t)
    }
  }, [phase, refreshSessionData])

  useEffect(() => {
    if (!nudge?.eligible || session?.subscriptionActive) return
    if (sessionStorage.getItem(PAYWALL_AUTO_DISMISS_KEY) === '1') return
    const id = requestAnimationFrame(() => {
      setPaywallFromNudge(true)
      setPaywallOpen(true)
    })
    return () => cancelAnimationFrame(id)
  }, [nudge?.eligible, session?.subscriptionActive])

  useEffect(() => {
    if (phase !== 'onboarding') return
    const id = requestAnimationFrame(() => setOnboardingStep(0))
    return () => cancelAnimationFrame(id)
  }, [phase])

  async function submitOnboarding() {
    setErr(null)
    try {
      await API.sessionPatch({
        board,
        classLevel,
        preferredOutput,
        learnerInterestHint: painPick ?? undefined,
      })
      setWelcomeToast(
        `You’re set — ${board} · Class ${classLevel}. Next: one short question in the real app to feel the loop.`,
      )
      setPhase('home')
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    }
  }

  const shellBg = (theme: { palette: { background: { default: string } } }) =>
    `linear-gradient(165deg, ${theme.palette.background.default} 0%, ${alpha('#1e3a5f', 0.35)} 42%, ${theme.palette.background.default} 100%)`

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: shellBg,
      }}
    >
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" component="span" fontWeight={800} letterSpacing="-0.02em">
            Baltutor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            Owli · NCERT homework
          </Typography>
          {phase === 'home' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void refreshSessionData()}
            >
              Refresh
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth="sm"
        sx={{ flex: 1, py: 3, pb: phase === 'home' && !session?.subscriptionActive ? 12 : 4 }}
      >
        <Stack spacing={2}>
          {err && (
            <Alert severity="error" onClose={() => setErr(null)}>
              {err}
            </Alert>
          )}

          {postDismissTip && (
            <Alert severity="info" onClose={() => setPostDismissTip(null)}>
              {postDismissTip}
            </Alert>
          )}

          {phase === 'landing' && !onb && !err && <LandingLoadingSkeleton />}

          {phase === 'landing' && onb && (
            <Stack spacing={3}>
              <TrustSignalsBar trustSignals={playbook?.trustSignals ?? []} taglines={selfStudy?.taglines} />

              <Box>
                <Chip icon={<AutoAwesomeIcon />} label="NCERT-aligned" size="small" color="primary" variant="outlined" sx={{ mb: 2 }} />
                <Typography variant="h3" component="h1" gutterBottom>
                  {onb.heroTitle}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {onb.heroSubtitle}
                </Typography>
              </Box>

              <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap aria-label="Common problems">
                {onb.problemChips.map((c) => (
                  <Chip key={c} label={c} color="primary" variant="filled" />
                ))}
              </Stack>

              <Card>
                <CardContent>
                  <Typography variant="overline" color="primary.light" fontWeight={700}>
                    How it works
                  </Typography>
                  <List disablePadding sx={{ mt: 1 }}>
                    {onb.valueSteps.map((s, i) => (
                      <ListItem key={s} disableGutters sx={{ alignItems: 'flex-start', py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.25 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
                              color: 'primary.light',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                            }}
                          >
                            {i + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText primary={s} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="primary.light" gutterBottom>
                    Not generic AI
                  </Typography>
                  <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }}>
                    {onb.notGenericAiBullets.map((b) => (
                      <Typography key={b} component="li" variant="body2" color="text.secondary">
                        {b}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                {onb.safetyLine}
              </Typography>
              <Typography variant="body1" color="primary.light" fontWeight={600}>
                {onb.subscribeTeaser}
              </Typography>

              {selfStudy && (
                <Card sx={(t) => ({ border: `1px solid ${alpha(t.palette.secondary.main, 0.35)}` })}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selfStudy.headline}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selfStudy.tuitionAlternativePitch}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <LandingPlaybookSections playbook={playbook} />

              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button variant="contained" color="primary" size="large" fullWidth onClick={() => setPhase('onboarding')}>
                    Start free setup
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => {
                      setPhase('home')
                      void refreshSessionData()
                    }}
                  >
                    Skip to dashboard
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" textAlign={{ xs: 'left', sm: 'center' }} display="block">
                  ~2 minute setup · No payment in this demo
                  {playbook?.cancelAnytimeHighlight ? ` · ${playbook.cancelAnytimeHighlight}` : ''}
                </Typography>
              </Stack>
            </Stack>
          )}

          {phase === 'onboarding' && (
            <Stack spacing={2.5} maxWidth={440} mx="auto" width="100%">
              <Typography variant="h4" component="h2">
                Quick setup
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Short path to your “aha” moment: we learn your goal, then match school level and language.
              </Typography>

              <LinearProgress variant="determinate" value={((onboardingStep + 1) / 2) * 100} sx={{ borderRadius: 999, height: 6 }} />

              <Stepper activeStep={onboardingStep} alternativeLabel sx={{ py: 1 }}>
                <Step>
                  <StepLabel>Your goal</StepLabel>
                </Step>
                <Step>
                  <StepLabel>School & language</StepLabel>
                </Step>
              </Stepper>

              {onboardingStep === 0 && (
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="primary.light">
                    What brings you here? (optional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pick one tap—helps Owli tailor tone. You can skip.
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                    {(onb?.problemChips ?? []).map((c) => (
                      <Chip
                        key={c}
                        label={c}
                        onClick={() => setPainPick(c)}
                        color={painPick === c ? 'primary' : 'default'}
                        variant={painPick === c ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Stack>
                  <FormControl fullWidth>
                    <InputLabel id="pain-label">Or choose from list</InputLabel>
                    <Select
                      labelId="pain-label"
                      label="Or choose from list"
                      value={painPick ?? ''}
                      onChange={(e) => setPainPick((e.target.value as string) || null)}
                    >
                      <MenuItem value="">
                        <em>Not listed / prefer not to say</em>
                      </MenuItem>
                      {(onb?.problemChips ?? []).map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Optional—does not block setup.</FormHelperText>
                  </FormControl>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button variant="contained" size="large" fullWidth onClick={() => setOnboardingStep(1)}>
                      Continue
                    </Button>
                    <Button variant="outlined" size="large" fullWidth onClick={() => setPhase('landing')}>
                      Back
                    </Button>
                  </Stack>
                </Stack>
              )}

              {onboardingStep === 1 && (
                <Stack spacing={2}>
                  <TextField label="Board" value={board} onChange={(e) => setBoard(e.target.value)} fullWidth required />

                  <TextField
                    label="Class"
                    type="number"
                    inputProps={{ min: 6, max: 10 }}
                    value={classLevel}
                    onChange={(e) => setClassLevel(Number(e.target.value))}
                    fullWidth
                    required
                    error={classLevel < 6 || classLevel > 10}
                    helperText={classLevel < 6 || classLevel > 10 ? 'Use class 6–10 for this demo' : undefined}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="lang-label">Reply language</InputLabel>
                    <Select
                      labelId="lang-label"
                      label="Reply language"
                      value={preferredOutput}
                      onChange={(e) => setPreferredOutput(e.target.value as PreferredOutput)}
                    >
                      <MenuItem value="EN">English</MenuItem>
                      <MenuItem value="HI">Hindi</MenuItem>
                      <MenuItem value="HINGLISH">Hinglish</MenuItem>
                    </Select>
                  </FormControl>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={classLevel < 6 || classLevel > 10}
                      onClick={() => void submitOnboarding()}
                    >
                      Save & go to dashboard
                    </Button>
                    <Button variant="outlined" size="large" fullWidth onClick={() => setOnboardingStep(0)}>
                      Back
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}

          {phase === 'home' && (
            <Stack spacing={2.5}>
              <HomeActivationChecklist
                session={session}
                dismissed={checklistDismissed}
                onDismiss={() => setChecklistDismissed(true)}
              />

              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Session
                  </Typography>
                  {session ? (
                    <Stack spacing={1.5}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Class
                        </Typography>
                        <Typography variant="body2">
                          {session.board} · Class {session.classLevel ?? '—'}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Language
                        </Typography>
                        <Typography variant="body2">{session.preferredOutput ?? '—'}</Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Subscription
                        </Typography>
                        <Typography variant="body2">
                          {session.subscriptionActive ? session.subscriptionPlan : 'Not subscribed'}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Streak
                        </Typography>
                        <Typography variant="body2">
                          {session.currentStreak ?? 0} day (best {session.longestStreak ?? 0})
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Account
                        </Typography>
                        <Typography variant="body2">
                          {session.sessionLinked ? 'Linked to sign-in' : 'Anonymous session'}
                        </Typography>
                      </Stack>
                      {!session.subscriptionActive &&
                        playbook?.streakEncouragementTemplate &&
                        (session.currentStreak ?? 0) > 0 && (
                          <Alert severity="success" variant="outlined" sx={{ mt: 1 }}>
                            {playbook.streakEncouragementTemplate.replace(
                              /\{streak\}/g,
                              String(session.currentStreak ?? 0),
                            )}
                          </Alert>
                        )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Loading…
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Today’s AI usage
                  </Typography>
                  <UsageMeters snap={usage} />
                  {usage?.trackingEnabled &&
                    usage.freeTier &&
                    !session?.subscriptionActive &&
                    usage.homeworkRemaining <= 1 &&
                    usage.homeworkMax > 0 && (
                      <Alert
                        severity="warning"
                        variant="outlined"
                        sx={{ mt: 2 }}
                        action={
                          <Button
                            color="inherit"
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setPaywallFromNudge(false)
                              setPaywallOpen(true)
                            }}
                          >
                            See plans
                          </Button>
                        }
                      >
                        <strong>Running low on free homework helps today.</strong>
                      </Alert>
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Subscribe nudge (backend)
                  </Typography>
                  {nudge ? (
                    <Stack spacing={1.5}>
                      <Typography variant="body2">
                        <strong>{nudge.eligible ? 'Eligible for paywall' : 'Not yet'}</strong>
                        {nudge.notEligibleReason && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}
                            · {nudge.notEligibleReason}
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Session age: {nudge.minutesSinceSessionCreated} min (need {nudge.minMinutesRequired}) · Homework
                        questions saved: {nudge.homeworkCompletionsTotal}
                        {nudge.minHomeworkCompletionsRequired > 0 && (
                          <> (need {nudge.minHomeworkCompletionsRequired})</>
                        )}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setPaywallFromNudge(false)
                          setPaywallOpen(true)
                        }}
                      >
                        Preview paywall
                      </Button>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Loading…
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Recall suggestions
                  </Typography>
                  {recall.length === 0 ? (
                    <RecallEmptyPreview recallTip={selfStudy?.recallTip} principleLines={selfStudy?.principles} />
                  ) : (
                    <List dense disablePadding>
                      {recall.map((r) => (
                        <ListItem key={`${r.source}-${r.label}`} disableGutters sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <>
                                <Typography component="span" variant="caption" color="primary.light" fontWeight={700} sx={{ mr: 1 }}>
                                  {r.source}
                                </Typography>
                                {r.label}
                              </>
                            }
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <ApiLabPanel />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Dev
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      clearStoredSessionId()
                      window.location.reload()
                    }}
                  >
                    New anonymous session (clear ID)
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Stack>
      </Container>

      <PaywallFlow
        open={paywallOpen}
        onClose={() => {
          if (paywallFromNudge) sessionStorage.setItem(PAYWALL_AUTO_DISMISS_KEY, '1')
          const tip = playbook?.postPaywallDismissTip?.trim()
          if (tip) setPostDismissTip(tip)
          setPaywallOpen(false)
          setPaywallFromNudge(false)
        }}
        conversion={conversion}
        playbook={playbook}
        policy={policy}
        triggeredByNudge={paywallFromNudge}
      />

      {phase === 'home' && !session?.subscriptionActive && (
        <Fab
          variant="extended"
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: (t) => t.zIndex.modal - 1 }}
          onClick={() => {
            setPaywallFromNudge(false)
            setPaywallOpen(true)
          }}
        >
          See plans
        </Fab>
      )}

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          textAlign: 'center',
          borderTop: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Demo shell · API proxied to localhost:8080 · marketing-bundle v2
        </Typography>
      </Box>

      <Snackbar
        open={welcomeToast != null}
        autoHideDuration={6500}
        onClose={() => setWelcomeToast(null)}
        message={welcomeToast ?? ''}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  )
}
