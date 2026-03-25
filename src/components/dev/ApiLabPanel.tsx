import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useState } from 'react'
import {
  API,
  clearAccessToken,
  getAccessToken,
  getStoredSessionId,
  setAccessToken,
  type FeedbackTarget,
  type PilotAnalyticsBatchRequest,
  type QuizSubmitRequest,
} from '../../api/baltutor'

function Out({ data, error }: { data: unknown; error: string | null }) {
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
        {error}
      </Alert>
    )
  }
  return (
    <Box
      component="pre"
      sx={{
        mt: 1,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'action.hover',
        fontSize: '0.75rem',
        overflow: 'auto',
        maxHeight: 280,
      }}
    >
      {data === undefined || data === null ? String(data) : JSON.stringify(data, null, 2)}
    </Box>
  )
}

export function ApiLabPanel() {
  const [out, setOut] = useState<{ data: unknown; error: string | null }>({ data: null, error: null })

  const run = useCallback(async (label: string, fn: () => Promise<unknown>) => {
    setOut({ data: `Running ${label}…`, error: null })
    try {
      const data = await fn()
      setOut({ data, error: null })
    } catch (e) {
      setOut({ data: null, error: e instanceof Error ? e.message : String(e) })
    }
  }, [])

  const [qClass, setQClass] = useState('8')
  const [qChapter, setQChapter] = useState('')
  const [qSubmitJson, setQSubmitJson] = useState(
    '{"chapterId":"demo","answers":[{"questionId":1,"selectedIndex":0}]}',
  )

  const [threadId, setThreadId] = useState('')
  const [chatMsg, setChatMsg] = useState('Hello')

  const [hqId, setHqId] = useState('')
  const [attemptNotes, setAttemptNotes] = useState('Tried substituting x=2')

  const [curClass, setCurClass] = useState('8')
  const [curSubject, setCurSubject] = useState('science')

  const [fbTarget, setFbTarget] = useState<FeedbackTarget>('HOMEWORK')
  const [fbTargetId, setFbTargetId] = useState('1')
  const [fbComment, setFbComment] = useState('')

  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [googleToken, setGoogleToken] = useState('')

  const [analyticsJson, setAnalyticsJson] = useState(
    '{"events":[{"type":"demo.shell.tap","propertiesJson":"{\\"where\\":\\"api_lab\\"}"}]}',
  )

  const [supportMsg, setSupportMsg] = useState('How do I reset my session?')
  const [ticketSubject, setTicketSubject] = useState('Demo ticket')
  const [ticketBody, setTicketBody] = useState('Testing support API from demo shell.')

  const [payPlan, setPayPlan] = useState('STANDARD')
  const [payPeriod, setPayPeriod] = useState('MONTHLY')

  const [jwtPaste, setJwtPaste] = useState('')

  return (
    <Accordion defaultExpanded={false} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={700}>Full API lab (E2E vs backend)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Calls every public session-scoped route the backend exposes (plus auth & payments when you have a JWT). Uses
          your stored <code>X-Baltutor-Session</code> and optional Bearer token.
        </Typography>

        <Stack spacing={2}>
          <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Session: {getStoredSessionId() ?? '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JWT: {getAccessToken() ? 'set' : 'none'}
            </Typography>
            <Button size="small" variant="outlined" onClick={() => clearAccessToken()}>
              Clear JWT
            </Button>
          </Stack>

          <TextField
            size="small"
            label="Paste JWT (after login/register)"
            fullWidth
            value={jwtPaste}
            onChange={(e) => setJwtPaste(e.target.value)}
            InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.8rem' } }}
          />
          <Button size="small" variant="contained" onClick={() => setAccessToken(jwtPaste.trim() || null)}>
            Save JWT to localStorage
          </Button>

          <Divider />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Health & public</AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Button size="small" variant="outlined" onClick={() => run('health', () => API.health())}>
                  GET /api/health
                </Button>
                <Button size="small" variant="outlined" onClick={() => run('marketing-bundle', () => API.marketingBundle())}>
                  GET marketing-bundle
                </Button>
                <Button size="small" variant="outlined" onClick={() => run('access-policy', () => API.accessPolicy())}>
                  GET access-policy
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Session extensions</AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Button size="small" variant="outlined" onClick={() => run('session/today', () => API.sessionToday())}>
                  GET session/today
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => run('parent-summary', () => API.parentSummary())}
                >
                  GET session/parent-summary (404 if disabled / not allowed)
                </Button>
                <Button size="small" variant="outlined" onClick={() => run('weak-topics', () => API.weakTopics(5))}>
                  GET session/weak-topics (may 403 without subscription)
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Chat</AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Button size="small" variant="outlined" onClick={() => run('chat threads create', () => API.chatCreateThread({ title: 'Demo' }))}>
                  POST chat/threads
                </Button>
                <Button size="small" variant="outlined" onClick={() => run('chat threads', () => API.chatListThreads())}>
                  GET chat/threads
                </Button>
                <TextField size="small" label="Thread id" value={threadId} onChange={(e) => setThreadId(e.target.value)} />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => run('chat messages', () => API.chatListMessages(Number(threadId)))}
                  disabled={!threadId}
                >
                  GET chat/threads/{'{id}'}/messages
                </Button>
                <TextField size="small" label="Message" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} fullWidth />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    run('chat post', () => API.chatPostMessage(Number(threadId), { content: chatMsg }))
                  }
                  disabled={!threadId || !chatMsg.trim()}
                >
                  POST message
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Quiz</AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                <TextField size="small" label="classLevel" value={qClass} onChange={(e) => setQClass(e.target.value)} sx={{ width: 100 }} />
                <TextField size="small" label="chapterId" value={qChapter} onChange={(e) => setQChapter(e.target.value)} sx={{ minWidth: 160 }} />
              </Stack>
              <Button
                size="small"
                sx={{ mt: 1 }}
                variant="outlined"
                onClick={() =>
                  run('quiz start', () =>
                    API.quizStart({ classLevel: Number(qClass), chapterId: qChapter || 'any', size: 3 }),
                  )
                }
              >
                GET quiz/start
              </Button>
              <TextField
                size="small"
                label="Quiz submit JSON"
                fullWidth
                multiline
                minRows={3}
                value={qSubmitJson}
                onChange={(e) => setQSubmitJson(e.target.value)}
                sx={{ mt: 1, fontFamily: 'monospace' }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={() =>
                  run('quiz submit', () => {
                    const body = JSON.parse(qSubmitJson) as QuizSubmitRequest
                    return API.quizSubmit(body)
                  })
                }
              >
                POST quiz/submit
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Homework</AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Button size="small" variant="outlined" onClick={() => run('homework history', () => API.homeworkHistory())}>
                  GET homework/history
                </Button>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  POST homework/upload (pick image)
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void run('homework upload', () => API.homeworkUpload(f))
                      e.target.value = ''
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Hint / learner-attempt need a real question id from history or upload.
                </Typography>
                <TextField size="small" label="Question id" value={hqId} onChange={(e) => setHqId(e.target.value)} />
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!hqId}
                  onClick={() => run('hint step', () => API.homeworkHintStep(Number(hqId)))}
                >
                  POST homework/questions/{'{id}'}/hint-step
                </Button>
                <TextField size="small" label="Learner attempt notes" value={attemptNotes} onChange={(e) => setAttemptNotes(e.target.value)} fullWidth />
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!hqId}
                  onClick={() =>
                    run('learner attempt', () => API.homeworkPatchLearnerAttempt(Number(hqId), { notes: attemptNotes }))
                  }
                >
                  PATCH learner-attempt
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Curriculum</AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                <TextField size="small" label="classLevel" value={curClass} onChange={(e) => setCurClass(e.target.value)} sx={{ width: 100 }} />
                <TextField size="small" label="subjectId" value={curSubject} onChange={(e) => setCurSubject(e.target.value)} sx={{ minWidth: 120 }} />
              </Stack>
              <Button
                size="small"
                sx={{ mt: 1 }}
                variant="outlined"
                onClick={() =>
                  run('curriculum', () => API.curriculumChapters(Number(curClass), curSubject))
                }
              >
                GET curriculum chapters
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Feedback</AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>targetType</InputLabel>
                  <Select label="targetType" value={fbTarget} onChange={(e) => setFbTarget(e.target.value as FeedbackTarget)}>
                    <MenuItem value="HOMEWORK">HOMEWORK</MenuItem>
                    <MenuItem value="CHAT">CHAT</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" label="targetId" value={fbTargetId} onChange={(e) => setFbTargetId(e.target.value)} />
                <TextField size="small" label="comment" value={fbComment} onChange={(e) => setFbComment(e.target.value)} fullWidth />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    run('feedback', () =>
                      API.feedbackSubmit({
                        targetType: fbTarget,
                        targetId: Number(fbTargetId),
                        comment: fbComment || undefined,
                        helpful: true,
                      }),
                    )
                  }
                >
                  POST feedback
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Auth (sets JWT on success — paste above)</AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Typography variant="caption" color="warning.main">
                  Register requires current session UUID (from header). Use Dev → clear session if you need a fresh one.
                </Typography>
                <TextField size="small" label="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} fullWidth />
                <TextField size="small" label="Password (8+)" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} fullWidth />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    run('register', async () => {
                      const sid = getStoredSessionId()
                      if (!sid) throw new Error('No session id — load the app first')
                      const r = await API.authRegister({ email: regEmail, password: regPassword, sessionId: sid })
                      setAccessToken(r.accessToken)
                      return r
                    })
                  }
                >
                  POST auth/register
                </Button>
                <Divider />
                <TextField size="small" label="Login email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} fullWidth />
                <TextField size="small" label="Login password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} fullWidth />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    run('login', async () => {
                      const r = await API.authLogin({ email: loginEmail, password: loginPassword })
                      setAccessToken(r.accessToken)
                      return r
                    })
                  }
                >
                  POST auth/login
                </Button>
                <TextField
                  size="small"
                  label="Google id_token"
                  value={googleToken}
                  onChange={(e) => setGoogleToken(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    run('google', async () => {
                      const r = await API.authGoogle({
                        idToken: googleToken.trim(),
                        sessionId: getStoredSessionId() ?? undefined,
                      })
                      setAccessToken(r.accessToken)
                      return r
                    })
                  }
                  disabled={!googleToken.trim()}
                >
                  POST auth/google
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Analytics</AccordionSummary>
            <AccordionDetails>
              <TextField size="small" label="Batch JSON" fullWidth multiline minRows={3} value={analyticsJson} onChange={(e) => setAnalyticsJson(e.target.value)} />
              <Button
                size="small"
                sx={{ mt: 1 }}
                variant="outlined"
                onClick={() =>
                  run('analytics', () => {
                    const body = JSON.parse(analyticsJson) as PilotAnalyticsBatchRequest
                    return API.analyticsPostEvents(body).then(() => ({ accepted: true }))
                  })
                }
              >
                POST analytics/events (202)
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Support (404 if disabled)</AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Button size="small" variant="outlined" onClick={() => run('support hello', () => API.supportBotHello())}>
                  GET support/bot/hello
                </Button>
                <TextField size="small" label="Message" value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} fullWidth />
                <Button size="small" variant="outlined" onClick={() => run('support msg', () => API.supportBotMessage({ message: supportMsg }))}>
                  POST support/bot/message
                </Button>
                <TextField size="small" label="Ticket subject" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} fullWidth />
                <TextField size="small" label="Ticket description" value={ticketBody} onChange={(e) => setTicketBody(e.target.value)} fullWidth multiline minRows={2} />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    run('ticket create', () => API.supportCreateTicket({ subject: ticketSubject, description: ticketBody }))
                  }
                >
                  POST support/tickets
                </Button>
                <Button size="small" variant="outlined" onClick={() => run('tickets list', () => API.supportListTickets())}>
                  GET support/tickets
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Payments (JWT required)</AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>plan</InputLabel>
                  <Select label="plan" value={payPlan} onChange={(e) => setPayPlan(e.target.value)}>
                    <MenuItem value="STANDARD">STANDARD</MenuItem>
                    <MenuItem value="PREMIUM">PREMIUM</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>period</InputLabel>
                  <Select label="period" value={payPeriod} onChange={(e) => setPayPeriod(e.target.value)}>
                    <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                    <MenuItem value="YEARLY">YEARLY</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }} useFlexGap>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    run('phonepe', () => API.paymentsPhonePeCheckout({ plan: payPlan, billingPeriod: payPeriod }))
                  }
                >
                  POST payments/phonepe/checkout
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    run('paytm', () => API.paymentsPaytmCheckout({ plan: payPlan, billingPeriod: payPeriod }))
                  }
                >
                  POST payments/paytm/checkout
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Divider />
          <Typography variant="subtitle2">Last response</Typography>
          <Out data={out.data} error={out.error} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
