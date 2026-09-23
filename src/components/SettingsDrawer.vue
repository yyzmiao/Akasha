<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      @click="$emit('close')"
    ></div>

    <div class="fixed inset-y-0 left-0 max-w-full flex pr-0 sm:pr-10">
      <div
        class="w-screen sm:max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 transform"
      >
        <div class="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">系统设置</h2>
            <p class="text-xs text-slate-400 mt-0.5">偏好配置与本地数据管理</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          <section class="space-y-3">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity class="w-3.5 h-3.5 text-blue-500" />
              <span>数据概览</span>
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-400">总项目数</div>
                <div class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {{ projectsCount }}
                </div>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-400">待办进度</div>
                <div class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {{ todosCount.completed }}/{{ todosCount.total }}
                </div>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-400">日常习惯</div>
                <div class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {{ habitsCount }}
                </div>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div class="text-xs text-slate-400">日记随笔</div>
                <div class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {{ journalsCount }}
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <SunMoon class="w-3.5 h-3.5 text-blue-500" />
              <span>界面外观</span>
            </h3>
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-slate-800 dark:text-slate-200">当前模式</div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  {{ isDark ? '暗色模式 (Dark)' : '白天明亮模式 (Light)' }}
                </div>
              </div>
              <button
                @click="$emit('toggle-theme')"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <Sun v-if="isDark" class="w-3.5 h-3.5 text-amber-500" />
                <Moon v-else class="w-3.5 h-3.5 text-blue-500" />
                <span>{{ isDark ? '切换浅色' : '切换暗色' }}</span>
              </button>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-medium text-slate-800 dark:text-slate-200">界面缩放比例</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    等比缩放整个界面、卡片与布局
                  </div>
                </div>
                <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {{ currentUiScaleLabel }}
                </span>
              </div>

              <div class="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs">
                <button
                  v-for="opt in uiScaleOptions"
                  :key="opt.value"
                  @click="$emit('change-ui-scale', opt.value)"
                  :class="[
                    'py-1.5 rounded-md font-medium transition-all text-center',
                    uiScale === opt.value
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  ]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-medium text-slate-800 dark:text-slate-200">字体风格</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    整站全局排版字体切换
                  </div>
                </div>
                <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {{ currentFontFamilyLabel }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs">
                <button
                  v-for="opt in fontFamilyOptions"
                  :key="opt.value"
                  @click="$emit('change-font-family', opt.value)"
                  :class="[
                    'py-1.5 rounded-md font-medium transition-all text-center',
                    fontFamily === opt.value
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  ]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-medium text-slate-800 dark:text-slate-200">字体大小</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    全局基础字号微调
                  </div>
                </div>
                <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {{ currentFontSizeLabel }}
                </span>
              </div>

              <div class="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs">
                <button
                  v-for="opt in fontSizeOptions"
                  :key="opt.value"
                  @click="$emit('change-font-size', opt.value)"
                  :class="[
                    'py-1.5 rounded-md font-medium transition-all text-center',
                    fontSize === opt.value
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  ]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </section>

          <!-- 云端多端实时同步 (PocketBase) -->
          <section class="space-y-3">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Cloud class="w-3.5 h-3.5 text-blue-500" />
                <span>云端多端同步 (PocketBase)</span>
              </span>
              <span v-if="isAuthenticated" class="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                已连接
              </span>
            </h3>

            <!-- Logged In Card -->
            <div v-if="isAuthenticated" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {{ (currentUser?.email || 'U').substring(0, 1).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {{ currentUser?.email?.replace(/@akasha\.local$/, '') || currentUser?.email }}
                      <span v-if="currentUser?.email?.endsWith('@akasha.local')" class="text-[10px] text-slate-400 font-normal ml-1">(简易账号)</span>
                    </div>
                    <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <span>状态: {{ syncStatusLabel }}</span>
                      <span>·</span>
                      <span>最近: {{ formatSyncTime(lastSyncTime) }}</span>
                    </div>
                  </div>
                </div>

                <button
                  @click="handleLogout"
                  class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="退出登录"
                >
                  <LogOut class="w-4 h-4" />
                </button>
              </div>

              <div v-if="syncError" class="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-600 dark:text-rose-400">
                {{ syncError }}
              </div>

              <!-- Action buttons -->
              <div class="grid grid-cols-1 gap-2 pt-1">
                <button
                  @click="handleManualSync"
                  :disabled="isSyncing"
                  class="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-xs"
                >
                  <RefreshCw :class="['w-3.5 h-3.5', isSyncing ? 'animate-spin' : '']" />
                  <span>{{ isSyncing ? '正在同步中...' : '立即双向同步' }}</span>
                </button>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="handleUploadAll"
                    :disabled="isSyncing"
                    class="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-[11px] font-medium transition-colors"
                    title="将本地已有全部数据批量推送到云端"
                  >
                    本地数据推送到云端
                  </button>
                  <button
                    @click="handleDownloadAll"
                    :disabled="isSyncing"
                    class="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-[11px] font-medium transition-colors"
                    title="从云端拉取全量覆盖当前本地（常用于新设备首次同步）"
                  >
                    从云端重新拉取全量
                  </button>
                </div>
              </div>
            </div>

            <!-- Login / Register Form -->
            <div v-else class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                连接私有云服务器（PocketBase），手机修改后电脑瞬间同步，且两端断网依然可用。
              </p>

              <!-- Server URL config -->
              <div>
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  服务器地址 (Server URL)
                </label>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="inputServerUrl"
                    type="text"
                    placeholder="例如: https://your-domain.com 或 http://IP:8090"
                    class="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    @click="handleSaveServerUrl"
                    class="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    保存
                  </button>
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  若已配置 Nginx 反代，可留空或使用当前网址
                </div>
              </div>

              <!-- Auth Mode Switcher -->
              <div class="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  @click="authMode = 'login'"
                  :class="[
                    'text-xs font-medium pb-1 border-b-2 transition-colors',
                    authMode === 'login'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  ]"
                >
                  登录已有账号
                </button>
                <button
                  type="button"
                  @click="authMode = 'register'"
                  :class="[
                    'text-xs font-medium pb-1 border-b-2 transition-colors',
                    authMode === 'register'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  ]"
                >
                  注册新账号
                </button>
              </div>

              <!-- Form inputs -->
              <div class="space-y-2.5">
                <div>
                  <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                    账号 / 邮箱 (Account)
                  </label>
                  <input
                    v-model="authEmail"
                    type="text"
                    placeholder="输入用户名 (如 admin) 或邮箱 (如 you@example.com)"
                    class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                  <div v-if="authEmail.trim() && !authEmail.includes('@')" class="text-[10px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                    <span>💡 用户名将自动匹配为 <b>{{ authEmail.trim() }}@akasha.local</b></span>
                  </div>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                    密码 (Password)
                  </label>
                  <input
                    v-model="authPassword"
                    type="password"
                    :placeholder="authMode === 'register' ? '设置密码 (最少 8 位，如 12345678)' : '输入账号密码'"
                    class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div v-if="authErrorMessage" class="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-600 dark:text-rose-400">
                {{ authErrorMessage }}
              </div>

              <button
                @click="handleAuthSubmit"
                :disabled="isAuthLoading"
                class="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-xs"
              >
                <RefreshCw v-if="isAuthLoading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isAuthLoading ? '正在验证...' : (authMode === 'login' ? '登录并开启同步' : '注册账号并开启同步') }}</span>
              </button>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Database class="w-3.5 h-3.5 text-blue-500" />
              <span>数据备份与恢复</span>
            </h3>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                所有数据均在当前浏览器的本地数据库（IndexedDB）中安全离线存储。请定期导出 JSON 备份文件以备异地还原。
              </p>

              <div class="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  @click="$emit('export-data')"
                  class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium transition-colors"
                >
                  <Download class="w-3.5 h-3.5" />
                  <span>导出备份 (JSON)</span>
                </button>

                <label
                  class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Upload class="w-3.5 h-3.5" />
                  <span>导入恢复备份</span>
                  <input type="file" accept=".json" class="hidden" @change="handleFileImport" />
                </label>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-xs font-semibold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle class="w-3.5 h-3.5 text-rose-500" />
              <span>危险区域</span>
            </h3>
            <div class="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div class="text-xs text-rose-700 dark:text-rose-300">
                清空数据将永久删除本地所有项目、待办、日程、习惯及日记，且无法撤销。
              </div>
              <button
                @click="$emit('clear-all')"
                class="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>清空全系统数据</span>
              </button>
            </div>
          </section>
        </div>

        <div class="px-4 sm:px-6 py-3.5 pb-safe border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Akasha · 本地存储</span>
          <button
            @click="$emit('close')"
            class="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  X,
  Activity,
  SunMoon,
  Sun,
  Moon,
  Database,
  Download,
  Upload,
  AlertTriangle,
  Trash2,
  Cloud,
  RefreshCw,
  LogOut,
} from 'lucide-vue-next'
import type { FontSize, FontFamily, UiScale } from '@/types'
import {
  serverUrl,
  currentUser,
  isAuthenticated,
  setServerUrl,
  loginUser,
  registerUser,
  logoutUser,
  formatAuthErrorMessage,
} from '@/sync/pocketbase'
import {
  syncStatus,
  lastSyncTime,
  syncError,
  syncAll,
  uploadAllLocalToCloud,
  downloadAllCloudToLocal,
} from '@/sync/syncEngine'

const props = defineProps<{
  isOpen: boolean
  isDark: boolean
  fontSize: FontSize
  fontFamily: FontFamily
  uiScale: UiScale
  projectsCount: number
  todosCount: { total: number; completed: number }
  habitsCount: number
  journalsCount: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle-theme'): void
  (e: 'change-font-size', size: FontSize): void
  (e: 'change-font-family', family: FontFamily): void
  (e: 'change-ui-scale', scale: UiScale): void
  (e: 'export-data'): void
  (e: 'import-data', jsonData: string): void
  (e: 'clear-all'): void
  (e: 'reload-data'): void
}>()

// --- Cloud Sync Logic ---
const inputServerUrl = ref(serverUrl.value)
const authMode = ref<'login' | 'register'>('login')
const authEmail = ref('')
const authPassword = ref('')
const isAuthLoading = ref(false)
const authErrorMessage = ref('')

const isSyncing = computed(() => syncStatus.value === 'syncing')

const syncStatusLabel = computed(() => {
  switch (syncStatus.value) {
    case 'synced':
      return '已同步'
    case 'syncing':
      return '正在同步'
    case 'error':
      return '同步异常'
    case 'offline':
      return '离线'
    default:
      return '未连接'
  }
})

function formatSyncTime(ts: number | null): string {
  if (!ts) return '尚未同步'
  const date = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function handleSaveServerUrl() {
  if (!inputServerUrl.value.trim()) {
    inputServerUrl.value = window.location.origin
  }
  setServerUrl(inputServerUrl.value)
  alert('服务器地址已更新：' + serverUrl.value)
}

async function handleAuthSubmit() {
  authErrorMessage.value = ''
  const trimmedAccount = authEmail.value.trim()
  if (!trimmedAccount) {
    authErrorMessage.value = '请输入账号或邮箱'
    return
  }
  if (!authPassword.value) {
    authErrorMessage.value = '请输入密码'
    return
  }
  if (authMode.value === 'register' && authPassword.value.length < 8) {
    authErrorMessage.value = '安全限制：注册密码长度必须至少为 8 位（例如 12345678）'
    return
  }

  isAuthLoading.value = true
  try {
    if (authMode.value === 'login') {
      await loginUser(trimmedAccount, authPassword.value)
    } else {
      await registerUser(trimmedAccount, authPassword.value)
    }
    const successMode = authMode.value
    // Perform initial bidirectional sync
    await syncAll()
    authPassword.value = ''
    emit('reload-data')
    alert(successMode === 'login' ? '🎉 登录成功！已成功连接云端实时同步。' : '🎉 注册成功！已成功开启云端实时同步。')
  } catch (err: any) {
    console.error('Auth error:', err)
    authErrorMessage.value = formatAuthErrorMessage(err)
  } finally {
    isAuthLoading.value = false
  }
}

function handleLogout() {
  if (confirm('确定退出当前云端账号吗？退出后数据依然保存在本地浏览器中。')) {
    logoutUser()
  }
}

async function handleManualSync() {
  try {
    await syncAll()
    emit('reload-data')
  } catch (err: any) {
    alert('同步出错：' + (err?.message || err))
  }
}

async function handleUploadAll() {
  if (confirm('确认将当前设备本地全部数据推送到云端吗？')) {
    try {
      const res = await uploadAllLocalToCloud()
      alert(`已成功推送 ${res.count} 项数据到云端！`)
      emit('reload-data')
    } catch (err: any) {
      alert('推送失败：' + (err?.message || err))
    }
  }
}

async function handleDownloadAll() {
  if (confirm('【高危提醒】从云端拉取将用云端数据覆盖当前本地 IndexedDB 数据，确定继续吗？')) {
    try {
      const res = await downloadAllCloudToLocal()
      alert(`已从云端拉取还原 ${res.count} 项数据！`)
      emit('reload-data')
    } catch (err: any) {
      alert('拉取失败：' + (err?.message || err))
    }
  }
}


const uiScaleOptions: { value: UiScale; label: string }[] = [
  { value: 'compact', label: '紧凑 90%' },
  { value: 'standard', label: '标准 100%' },
  { value: 'comfortable', label: '舒适 108%' },
  { value: 'large', label: '大屏 118%' },
]

const currentUiScaleLabel = computed(() => {
  return uiScaleOptions.find((o) => o.value === props.uiScale)?.label || '标准 100%'
})

const fontFamilyOptions: { value: FontFamily; label: string }[] = [
  { value: 'wenkai', label: '霞鹜文楷' },
  { value: 'system', label: '现代黑体' },
  { value: 'serif', label: '典雅宋体' },
]

const currentFontFamilyLabel = computed(() => {
  return fontFamilyOptions.find((o) => o.value === props.fontFamily)?.label || '霞鹜文楷'
})

const fontSizeOptions: { value: FontSize; label: string }[] = [
  { value: 'small', label: '小号' },
  { value: 'standard', label: '标准' },
  { value: 'large', label: '大号' },
  { value: 'xlarge', label: '特大' },
]

const currentFontSizeLabel = computed(() => {
  return fontSizeOptions.find((o) => o.value === props.fontSize)?.label || '标准'
})

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    if (text) {
      emit('import-data', text)
      target.value = ''
    }
  }
  reader.readAsText(file)
}
</script>
