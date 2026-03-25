const STORAGE_KEY = 'baltutor_activation_checklist_dismissed'

export function isActivationChecklistDismissed(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === '1'
}

export function persistActivationChecklistDismissed() {
  sessionStorage.setItem(STORAGE_KEY, '1')
}
