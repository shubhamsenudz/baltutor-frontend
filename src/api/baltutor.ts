const SESSION_HEADER = 'X-Baltutor-Session'
const STORAGE_KEY = 'baltutor_session_id'

export function getStoredSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setStoredSessionId(id: string) {
  localStorage.setItem(STORAGE_KEY, id)
}

export function clearStoredSessionId() {
  localStorage.removeItem(STORAGE_KEY)
}

export async function baltutorFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  const sid = getStoredSessionId()
  if (sid) headers.set(SESSION_HEADER, sid)
  const res = await fetch(path, { ...init, headers })
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
  return res.json() as Promise<T>
}

// —— Types (subset of backend JSON) ——

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

export interface SessionResponse {
  sessionId: string
  board: string
  classLevel: number | null
  preferredOutput: string
  subscriptionActive: boolean
  subscriptionPlan: string
  currentStreak: number
  longestStreak: number
  sessionLinked: boolean
  learnerInterestHint?: string | null
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

export const API = {
  marketingBundle: () => baltutorJson<MarketingBundleResponse>('/api/v1/public/marketing-bundle'),
  onboardingExperience: () => baltutorJson<OnboardingExperienceResponse>('/api/v1/public/onboarding-experience'),
  firstUseConversion: () => baltutorJson<FirstUseConversionCopyResponse>('/api/v1/public/first-use-conversion'),
  selfStudy: () => baltutorJson<SelfStudyGuideResponse>('/api/v1/public/self-study'),
  conversionPlaybook: () => baltutorJson<ConversionPlaybookResponse>('/api/v1/public/conversion-playbook'),
  accessPolicy: () => baltutorJson<AccessPolicyResponse>('/api/v1/public/access-policy'),
  sessionGet: () => baltutorJson<SessionResponse>('/api/v1/session'),
  sessionPatch: (body: object) =>
    baltutorJson<SessionResponse>('/api/v1/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  aiUsageToday: () => baltutorJson<AiUsageSnapshotResponse>('/api/v1/session/ai-usage-today'),
  firstUseNudge: () => baltutorJson<FirstUseConversionNudgeResponse>('/api/v1/session/first-use-nudge'),
  recallSuggestions: () => baltutorJson<RecallSuggestionItem[]>('/api/v1/session/recall-suggestions'),
}

export function formatPaiseInr(paise: number): string {
  if (paise <= 0) return '₹0'
  const rupees = Math.floor(paise / 100)
  const sub = paise % 100
  return sub === 0 ? `₹${rupees}` : `₹${rupees}.${sub.toString().padStart(2, '0')}`
}

/** Rough “per week” reframing for yearly plans (marketing helper). */
export function weeklyFromYearlyPaise(yearlyPaise: number): string {
  if (yearlyPaise <= 0) return ''
  const perWeek = Math.round(yearlyPaise / 52)
  return `~${formatPaiseInr(perWeek)}/week if billed yearly`
}
