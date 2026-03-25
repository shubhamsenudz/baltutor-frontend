/**
 * Baltutor HTTP client — mirrors backend controllers under `/api` and `/api/v1/*`.
 * Session: `X-Baltutor-Session` (stored in localStorage). Optional JWT: `Authorization: Bearer`.
 */

const SESSION_HEADER = 'X-Baltutor-Session'
const STORAGE_SESSION = 'baltutor_session_id'
const STORAGE_ACCESS = 'baltutor_access_token'

export function getStoredSessionId(): string | null {
  return localStorage.getItem(STORAGE_SESSION)
}

export function setStoredSessionId(id: string) {
  localStorage.setItem(STORAGE_SESSION, id)
}

export function clearStoredSessionId() {
  localStorage.removeItem(STORAGE_SESSION)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_ACCESS)
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(STORAGE_ACCESS, token)
  else localStorage.removeItem(STORAGE_ACCESS)
}

export function clearAccessToken() {
  localStorage.removeItem(STORAGE_ACCESS)
}

/** Empty string in dev when using Vite proxy; set `VITE_API_BASE` for prod (no trailing slash). */
function apiBase(): string {
  const raw = import.meta.env.VITE_API_BASE
  if (raw == null || String(raw).trim() === '') return ''
  return String(raw).replace(/\/$/, '')
}

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = apiBase()
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path
}

export async function baltutorFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  const sid = getStoredSessionId()
  if (sid) headers.set(SESSION_HEADER, sid)
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(apiUrl(path), { ...init, headers })
  const issued = res.headers.get(SESSION_HEADER)
  if (issued) setStoredSessionId(issued)
  return res
}

export async function baltutorJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await baltutorFetch(path, init)
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `${res.status} ${res.statusText}`)
  }
  const ct = res.headers.get('content-type')
  if (!ct?.includes('application/json')) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

/** 404 → null (e.g. disabled parent-summary or support). */
export async function baltutorJsonOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await baltutorFetch(path, init)
  const issued = res.headers.get(SESSION_HEADER)
  if (issued) setStoredSessionId(issued)
  if (res.status === 404) return null
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `${res.status} ${res.statusText}`)
  }
  const ct = res.headers.get('content-type')
  if (!ct?.includes('application/json')) return null
  return res.json() as Promise<T>
}

export async function baltutorAccept(path: string, init?: RequestInit): Promise<void> {
  const res = await baltutorFetch(path, init)
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `${res.status} ${res.statusText}`)
  }
}

// —— Public / policy ——

export interface OnboardingExperienceResponse {
  heroTitle: string
  heroSubtitle: string
  problemChips: string[]
  valueSteps: string[]
  notGenericAiBullets: string[]
  safetyLine: string
  subscribeTeaser: string
}

export interface FirstUseConversionCopyResponse {
  headline: string
  subhead: string
  ctaPrimary: string
  ctaSecondary: string
  dismissLabel: string
  quickWins: string[]
  vsGenericAi: { pain: string; owliAnswer: string }[]
}

export interface SelfStudyGuideResponse {
  headline: string
  tuitionAlternativePitch: string
  taglines: string[]
  principles: string[]
  recallTip: string
}

export interface AccessPlanOfferResponse {
  code: string
  title: string
  monthlyPricePaise: number
  yearlyPricePaise: number
  monthlyPriceDisplay: string
  yearlyPriceDisplay: string
  effectiveMonthlyWhenYearlyDisplay: string
  homeworkAiPerDay: number
  chatAiPerDay: number
}

export interface AccessPolicyResponse {
  freeForChildLearners: boolean
  currency: string
  summary: string
  fairUseNote: string
  freeHomeworkAiPerDay: number
  freeChatAiPerDay: number
  paidHomeworkAiPerDay: number
  paidChatAiPerDay: number
  premiumHomeworkAiPerDay: number
  premiumChatAiPerDay: number
  paidTierRequiresSignIn: boolean
  plans: AccessPlanOfferResponse[]
}

export interface ConversionPlaybookResponse {
  trustSignals: string[]
  faqs: { question: string; answer: string }[]
  parentPitchHeadline: string
  parentPitchBullets: string[]
  premiumUnlockBullets: string[]
  socialProofLines: string[]
  softUrgencyNote: string
  paymentPathNote: string
  trialTeaserHeadline: string
  trialTeaserBody: string
  refundOrCancelSummary: string
  freeVsPaidHighlights: string[]
  streakEncouragementTemplate: string
  riskReversalHeadline: string
  riskReversalBody: string
  cancelAnytimeHighlight: string
  postPaywallDismissTip: string
}

export interface MarketingBundleResponse {
  onboardingExperience: OnboardingExperienceResponse
  selfStudyGuide: SelfStudyGuideResponse
  conversionPlaybook: ConversionPlaybookResponse
  firstUseConversion: FirstUseConversionCopyResponse
  bundleVersion: string
}

// —— Session ——

export type PreferredOutput = 'EN' | 'HI' | 'HINGLISH'
export type LearningMode = 'PRACTICE' | 'EXAM'
export type SessionGoal = 'CLEAR_DOUBT' | 'REVISE_CHAPTER' | 'QUICK_QUIZ' | 'EXAM_PREP'
export type TutorResponseStyle = 'HINT_FIRST' | 'FULL_EXPLANATION'

export interface SessionPatchRequest {
  board?: string
  classLevel?: number
  medium?: string
  preferredOutput?: PreferredOutput
  learningMode?: LearningMode
  tutorResponseStyle?: TutorResponseStyle
  sessionGoal?: SessionGoal
  cohortCode?: string
  nickname?: string
  ageBand?: string
  detailLevel?: string
  platform?: string
  appVersion?: string
  learnerInterestHint?: string
  privacyPolicyVersionAccepted?: string
}

export interface SessionResponse {
  sessionId: string
  board: string | null
  classLevel: number | null
  medium: string | null
  preferredOutput: PreferredOutput | string | null
  learningMode: LearningMode | string | null
  tutorResponseStyle: TutorResponseStyle | string | null
  sessionGoal: SessionGoal | string | null
  cohortCode: string | null
  nickname: string | null
  ageBand: string | null
  detailLevel: string | null
  platform: string | null
  appVersion: string | null
  learnerInterestHint: string | null
  lastSeenAt: string | null
  privacyConsentVersion: string | null
  privacyConsentAt: string | null
  currentStreak: number
  longestStreak: number
  sessionLinked: boolean
  subscriptionActive: boolean
  subscriptionPlan: string
}

export interface SessionTodayResponse {
  istDate: string
  homeworkExplainedCount: number
  quizSubmissionsCount: number
  homeworkCompletionsTarget: number
  quizCompletionsTarget: number
  dailyGoalMet: boolean
  doneForTodayMessage: string
}

export interface AiUsageSnapshotResponse {
  trackingEnabled: boolean
  homeworkUsed: number
  homeworkMax: number
  homeworkRemaining: number
  chatUsed: number
  chatMax: number
  chatRemaining: number
  freeTier: boolean
}

export interface FirstUseConversionNudgeResponse {
  eligible: boolean
  minutesSinceSessionCreated: number
  minMinutesRequired: number
  minutesRemainingUntilEligible: number
  subscriptionActive: boolean
  requireSignedInForNudge: boolean
  homeworkCompletionsTotal: number
  minHomeworkCompletionsRequired: number
  notEligibleReason: string | null
}

export interface RecallSuggestionItem {
  source: string
  label: string
  chapterId: string | null
  topicTag: string
}

export interface WeakTopicItemResponse {
  chapterId: string
  topicTag: string
  wrongCount: number
}

export interface ParentSummaryResponse {
  sessionId: string
  board: string | null
  classLevel: number | null
  currentStreak: number
  longestStreak: number
  today: SessionTodayResponse
  weakTopicsTop: WeakTopicItemResponse[]
  estimatedActiveMinutes: number
  pilotEventCount: number
  cohortCode: string | null
  sessionGoal: string | null
}

// —— Chat ——

export interface ChatThread {
  id: number
  sessionId: string
  title: string | null
  createdAt: string
}

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface ChatMessage {
  id: number
  threadId: number
  role: ChatRole | string
  content: string
  createdAt: string
}

export interface ChatThreadCreateRequest {
  title?: string
}

export interface ChatMessageRequest {
  content: string
}

// —— Quiz ——

export interface QuizQuestionPublicDto {
  id: number
  stem: string
  options: string[]
}

export interface QuizStartResponse {
  chapterId: string
  classLevel: number
  questions: QuizQuestionPublicDto[]
}

export interface QuizAnswerItem {
  questionId: number
  selectedIndex: number
}

export interface QuizSubmitRequest {
  chapterId: string
  answers: QuizAnswerItem[]
}

export interface QuizResultResponse {
  attemptId: number
  score: number
  totalQuestions: number
}

// —— Homework ——

export interface Question {
  id: number
  sessionId: string
  questionText: string | null
  imageUrl: string | null
  aiResponse: string | null
  subject: string | null
  difficulty: string | null
  points: number
  chapterId: string | null
  chapterName: string | null
  topicTags: string | null
  ocrLowConfidence: boolean
  learnerAttemptNotes: string | null
  hintLevel: number
  createdAt: string
}

export interface LearnerAttemptPatchRequest {
  notes?: string
}

export interface HintAdvanceResponse {
  questionId: number
  hintLevel: number
  maxHintLevel: number
  hintMessage: string
  canAdvanceFurther: boolean
}

// —— Curriculum ——

export interface ChapterDto {
  id: string
  title: string
}

// —— Feedback ——

export type FeedbackTarget = 'HOMEWORK' | 'CHAT'

export interface FeedbackRequest {
  targetType: FeedbackTarget
  targetId: number
  helpful?: boolean
  comment?: string
  requestId?: string
}

export interface FeedbackEntry {
  id: number
  sessionId: string
  targetType: FeedbackTarget
  targetId: number | null
  helpful: boolean | null
  comment: string | null
  requestId: string | null
  createdAt: string
}

// —— Auth ——

export interface AuthTokenResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
}

export interface RegisterRequest {
  email: string
  password: string
  sessionId: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface GoogleAuthRequest {
  idToken: string
  sessionId?: string
}

// —— Analytics ——

export interface PilotAnalyticsEventDto {
  type: string
  propertiesJson?: string
}

export interface PilotAnalyticsBatchRequest {
  events: PilotAnalyticsEventDto[]
}

// —— Support ——

export interface SupportBotMessageResponse {
  reply: string
  suggestOpenTicket: boolean
  quickPrompts: string[]
}

export interface SupportBotMessageRequest {
  message: string
}

export interface SupportTicketCreateRequest {
  subject: string
  description: string
  category?: string
}

export interface SupportTicketResponse {
  id: number
  sessionId: string
  subject: string
  description: string
  category: string | null
  status: string
  createdAt: string
}

// —— Payments (JWT) ——

export interface PaymentCheckoutRequest {
  plan: 'STANDARD' | 'PREMIUM' | string
  billingPeriod: 'MONTHLY' | 'YEARLY' | string
}

export interface PaymentCheckoutResponse {
  provider?: string
  merchantOrderId?: string
  amountPaise?: number
  currency?: string
  redirectUrl?: string
  paytmTxnToken?: string
  paytmMid?: string
  paytmPaymentPageUrl?: string
}

// —— Health ——

export interface HealthResponse {
  status: string
  readiness?: string
}

function jsonHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' }
}

export const API = {
  // HealthController → /api/health
  health: () => baltutorJson<HealthResponse>('/api/health'),

  // PublicController → /api/v1/public/*
  marketingBundle: () => baltutorJson<MarketingBundleResponse>('/api/v1/public/marketing-bundle'),
  onboardingExperience: () => baltutorJson<OnboardingExperienceResponse>('/api/v1/public/onboarding-experience'),
  firstUseConversion: () => baltutorJson<FirstUseConversionCopyResponse>('/api/v1/public/first-use-conversion'),
  selfStudy: () => baltutorJson<SelfStudyGuideResponse>('/api/v1/public/self-study'),
  conversionPlaybook: () => baltutorJson<ConversionPlaybookResponse>('/api/v1/public/conversion-playbook'),
  accessPolicy: () => baltutorJson<AccessPolicyResponse>('/api/v1/public/access-policy'),

  // SessionController → /api/v1/session
  sessionGet: () => baltutorJson<SessionResponse>('/api/v1/session'),
  sessionPatch: (body: SessionPatchRequest) =>
    baltutorJson<SessionResponse>('/api/v1/session', {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
  firstUseNudge: () => baltutorJson<FirstUseConversionNudgeResponse>('/api/v1/session/first-use-nudge'),
  aiUsageToday: () => baltutorJson<AiUsageSnapshotResponse>('/api/v1/session/ai-usage-today'),
  sessionToday: () => baltutorJson<SessionTodayResponse>('/api/v1/session/today'),
  /** 404 when feature disabled or not subscribed (backend rules). */
  parentSummary: () => baltutorJsonOrNull<ParentSummaryResponse>('/api/v1/session/parent-summary'),
  recallSuggestions: () => baltutorJson<RecallSuggestionItem[]>('/api/v1/session/recall-suggestions'),
  weakTopics: (limit = 5) =>
    baltutorJson<WeakTopicItemResponse[]>(`/api/v1/session/weak-topics?limit=${encodeURIComponent(String(limit))}`),

  // ChatController → /api/v1/chat
  chatCreateThread: (body?: ChatThreadCreateRequest) =>
    baltutorJson<ChatThread>('/api/v1/chat/threads', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body ?? {}),
    }),
  chatListThreads: () => baltutorJson<ChatThread[]>('/api/v1/chat/threads'),
  chatListMessages: (threadId: number) =>
    baltutorJson<ChatMessage[]>(`/api/v1/chat/threads/${threadId}/messages`),
  chatPostMessage: (threadId: number, body: ChatMessageRequest) =>
    baltutorJson<ChatMessage>(`/api/v1/chat/threads/${threadId}/messages`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),

  // QuizController → /api/v1/quiz
  quizStart: (p: { classLevel: number; chapterId: string; size?: number }) => {
    const q = new URLSearchParams({
      classLevel: String(p.classLevel),
      chapterId: p.chapterId,
      size: String(p.size ?? 5),
    })
    return baltutorJson<QuizStartResponse>(`/api/v1/quiz/start?${q}`)
  },
  quizSubmit: (body: QuizSubmitRequest) =>
    baltutorJson<QuizResultResponse>('/api/v1/quiz/submit', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),

  // HomeworkController → /api/v1/homework (and legacy /api/homework)
  homeworkUpload: (file: File, params?: { chapterId?: string; chapterName?: string; topicTags?: string }) => {
    const fd = new FormData()
    fd.append('file', file)
    if (params?.chapterId) fd.append('chapterId', params.chapterId)
    if (params?.chapterName) fd.append('chapterName', params.chapterName)
    if (params?.topicTags) fd.append('topicTags', params.topicTags)
    return baltutorJson<Question>('/api/v1/homework/upload', { method: 'POST', body: fd })
  },
  homeworkHistory: () => baltutorJson<Question[]>('/api/v1/homework/history'),

  // HomeworkQuestionController → /api/v1/homework/questions
  homeworkPatchLearnerAttempt: (questionId: number, body: LearnerAttemptPatchRequest) =>
    baltutorJson<Question>(`/api/v1/homework/questions/${questionId}/learner-attempt`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
  homeworkHintStep: (questionId: number) =>
    baltutorJson<HintAdvanceResponse>(`/api/v1/homework/questions/${questionId}/hint-step`, { method: 'POST' }),

  // CurriculumController → /api/v1/curriculum
  curriculumChapters: (classLevel: number, subjectId: string) =>
    baltutorJson<ChapterDto[]>(`/api/v1/curriculum/classes/${classLevel}/subjects/${encodeURIComponent(subjectId)}/chapters`),

  // FeedbackController → /api/v1/feedback
  feedbackSubmit: (body: FeedbackRequest) =>
    baltutorJson<FeedbackEntry>('/api/v1/feedback', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),

  // AuthController → /api/v1/auth
  authRegister: (body: RegisterRequest) =>
    baltutorJson<AuthTokenResponse>('/api/v1/auth/register', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
  authLogin: (body: LoginRequest) =>
    baltutorJson<AuthTokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
  authGoogle: (body: GoogleAuthRequest) =>
    baltutorJson<AuthTokenResponse>('/api/v1/auth/google', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),

  // AnalyticsController → /api/v1/analytics
  analyticsPostEvents: (body: PilotAnalyticsBatchRequest) =>
    baltutorAccept('/api/v1/analytics/events', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),

  // SupportController → /api/v1/support
  supportBotHello: () => baltutorJsonOrNull<SupportBotMessageResponse>('/api/v1/support/bot/hello'),
  supportBotMessage: (body: SupportBotMessageRequest) =>
    baltutorJsonOrNull<SupportBotMessageResponse>('/api/v1/support/bot/message', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
  supportCreateTicket: (body: SupportTicketCreateRequest) =>
    baltutorJsonOrNull<SupportTicketResponse>('/api/v1/support/tickets', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
  supportListTickets: () => baltutorJsonOrNull<SupportTicketResponse[]>('/api/v1/support/tickets'),

  // PaymentController → /api/v1/payments (requires Bearer JWT)
  paymentsPhonePeCheckout: (body: PaymentCheckoutRequest) =>
    baltutorJson<PaymentCheckoutResponse>('/api/v1/payments/phonepe/checkout', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
  paymentsPaytmCheckout: (body: PaymentCheckoutRequest) =>
    baltutorJson<PaymentCheckoutResponse>('/api/v1/payments/paytm/checkout', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    }),
}

export function formatPaiseInr(paise: number): string {
  if (paise <= 0) return '₹0'
  const rupees = Math.floor(paise / 100)
  const sub = paise % 100
  return sub === 0 ? `₹${rupees}` : `₹${rupees}.${sub.toString().padStart(2, '0')}`
}

export function weeklyFromYearlyPaise(yearlyPaise: number): string {
  if (yearlyPaise <= 0) return ''
  const perWeek = Math.round(yearlyPaise / 52)
  return `~${formatPaiseInr(perWeek)}/week if billed yearly`
}
