<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      @click="$emit('close')"
    ></div>

    <div class="fixed inset-y-0 left-0 max-w-full flex pr-10">
      <div
        class="w-screen max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 transform"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">系统设置</h2>
            <p class="text-xs text-slate-400 mt-0.5">偏好配置与本地数据管理</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
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

        <div class="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Akasha · 本地数据存储</span>
          <button
            @click="$emit('close')"
            class="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
} from 'lucide-vue-next'
import type { FontSize, FontFamily, UiScale } from '@/types'

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
}>()

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
