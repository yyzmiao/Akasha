import PocketBase from 'pocketbase'
import { ref, computed } from 'vue'

const PB_URL_STORAGE_KEY = 'akasha_pb_url'

// By default in browser: use same origin if deployed behind reverse proxy, or fallback to relative '/'
function getDefaultServerUrl(): string {
  const saved = localStorage.getItem(PB_URL_STORAGE_KEY)
  if (saved) return saved
  if (typeof window !== 'undefined' && window.location) {
    // If in dev mode on vite (e.g. localhost:5173), fallback to http://127.0.0.1:8090
    if (window.location.port === '5173') {
      return 'http://127.0.0.1:8090'
    }
    return window.location.origin
  }
  return 'http://127.0.0.1:8090'
}

export const serverUrl = ref(getDefaultServerUrl())
export const pb = new PocketBase(serverUrl.value)

// Reactive auth state
export const currentUser = ref(pb.authStore.record)
export const isAuthenticated = computed(() => pb.authStore.isValid && !!currentUser.value)

// Listen to auth changes
pb.authStore.onChange((_token, model) => {
  currentUser.value = model
})

export function setServerUrl(newUrl: string): void {
  const cleanUrl = newUrl.trim().replace(/\/+$/, '')
  serverUrl.value = cleanUrl
  localStorage.setItem(PB_URL_STORAGE_KEY, cleanUrl)
  pb.baseUrl = cleanUrl
}

export async function loginUser(email: string, password: string): Promise<any> {
  const authData = await pb.collection('users').authWithPassword(email.trim(), password)
  currentUser.value = authData.record
  return authData
}

export async function registerUser(email: string, password: string): Promise<any> {
  const cleanEmail = email.trim()
  await pb.collection('users').create({
    email: cleanEmail,
    password: password,
    passwordConfirm: password,
  })
  // Automatically login after register
  return loginUser(cleanEmail, password)
}

export function logoutUser(): void {
  pb.authStore.clear()
  currentUser.value = null
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const health = await pb.health.check()
    return health.code === 200
  } catch (_e) {
    return false
  }
}
