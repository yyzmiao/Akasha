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

// Truly reactive auth state tracked by Vue
export const authToken = ref<string>(pb.authStore.token)
export const currentUser = ref<any>(pb.authStore.record || pb.authStore.model)
export const isAuthenticated = computed(() => !!authToken.value && !!currentUser.value)

// Listen to auth changes from PocketBase SDK
pb.authStore.onChange((token, model) => {
  authToken.value = token
  currentUser.value = model
})

export function setServerUrl(newUrl: string): void {
  const cleanUrl = newUrl.trim().replace(/\/+$/, '')
  serverUrl.value = cleanUrl
  localStorage.setItem(PB_URL_STORAGE_KEY, cleanUrl)
  pb.baseUrl = cleanUrl
}

/**
 * Normalize username or email:
 * If the user inputs a plain username without '@' (e.g. 'admin' or 'yyzmiao'),
 * automatically map it to an email address (e.g. 'admin@akasha.local').
 */
export function normalizeAccount(account: string): string {
  const clean = (account || '').trim()
  if (!clean) return ''
  if (!clean.includes('@')) {
    return `${clean}@akasha.local`
  }
  return clean
}

export function formatAuthErrorMessage(err: any): string {
  if (!err) return '认证失败，请检查网络或服务器连接'

  // PocketBase ClientResponseError details/data
  const data = err.data || err.response?.data || {}
  const details = data.details || data.data || data

  if (details.email) {
    const emailMsg = typeof details.email === 'string' ? details.email : (details.email.message || '')
    if (emailMsg.includes('valid email')) {
      return '账号格式不正确（请输入有效用户名或邮箱）'
    }
    if (emailMsg.includes('unique') || emailMsg.includes('already')) {
      return '该账号/邮箱已被注册，请直接切换为【登录已有账号】'
    }
    return `账号错误: ${emailMsg}`
  }

  if (details.password) {
    const pwdMsg = typeof details.password === 'string' ? details.password : (details.password.message || '')
    if (pwdMsg.includes('least 8') || pwdMsg.includes('out_of_range') || pwdMsg.includes('length')) {
      return '密码过短：密码长度至少需要 8 个字符（例如 12345678）'
    }
    return `密码错误: ${pwdMsg}`
  }

  if (err.status === 400) {
    if (err.message?.includes('Failed to authenticate')) {
      return '登录失败：账号或密码不正确，请重新输入'
    }
    if (err.message?.includes('Failed to create record')) {
      return '注册失败：账号需至少包含字符，且密码需至少8位'
    }
  }

  return err.message || '操作失败，请重试'
}

export async function loginUser(account: string, password: string): Promise<any> {
  const normalizedEmail = normalizeAccount(account)
  const authData = await pb.collection('users').authWithPassword(normalizedEmail, password)
  authToken.value = authData.token
  currentUser.value = authData.record || (authData as any).model
  return authData
}

export async function registerUser(account: string, password: string): Promise<any> {
  const normalizedEmail = normalizeAccount(account)
  await pb.collection('users').create({
    email: normalizedEmail,
    password: password,
    passwordConfirm: password,
  })
  // Automatically login after register
  return loginUser(normalizedEmail, password)
}

export function logoutUser(): void {
  pb.authStore.clear()
  authToken.value = ''
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
