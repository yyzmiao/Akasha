<template>
  <div class="relative min-h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 sm:gap-8 items-start">
    <div class="flex-1 w-full flex justify-center py-1 sm:py-2">
      <div class="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-8 relative min-h-[380px] sm:min-h-[580px] flex flex-col">
        <div class="flex items-start justify-between mb-4 sm:mb-6">
          <div class="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center select-none shrink-0">
            <span class="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {{ currentMonthShort }}
            </span>
            <span class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-none mt-0.5">
              {{ currentDayNumber }}
            </span>
          </div>

          <div class="flex-1 text-center px-2 sm:px-4">
            <h2 class="text-base sm:text-xl font-medium text-slate-800 dark:text-slate-100 tracking-normal select-none">
              {{ formattedDateTitle }}
            </h2>
          </div>

          <div class="relative shrink-0">
            <button
              @click="showMoodPicker = !showMoodPicker"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-base sm:text-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="选择心情"
            >
              <span>{{ activeEntry?.mood || '😊' }}</span>
            </button>

            <div
              v-if="showMoodPicker"
              class="absolute right-0 top-10 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl flex gap-1 animate-in zoom-in-95"
            >
              <button
                v-for="m in ['😊', '💪', '😐', '☕', '🌧️', '🔥']"
                :key="m"
                @click="setMood(m)"
                class="w-7 h-7 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-base"
              >
                {{ m }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col">
          <textarea
            v-model="journalContent"
            @input="handleAutoSave"
            placeholder="写下今天的日记与随笔..."
            class="w-full flex-1 min-h-[260px] sm:min-h-[420px] resize-none bg-transparent text-slate-700 dark:text-slate-200 text-sm sm:text-base focus:outline-none placeholder:text-slate-400 tracking-wide"
            style="line-height: 2.2;"
          ></textarea>
        </div>

        <div class="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
          <span class="text-[11px] text-slate-400">
            {{ autoSaveStatus || '已自动保存' }}
          </span>

          <button
            @click="handleClearOrDelete"
            class="p-1 rounded text-slate-300 hover:text-slate-500 transition-colors"
            title="清空日记"
          >
            <XCircle class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <aside class="w-full lg:w-72 shrink-0 space-y-6 text-xs text-slate-600 dark:text-slate-400">
      <div class="space-y-3 select-none">
        <div class="flex items-center justify-between">
          <span class="font-bold text-sm text-slate-800 dark:text-slate-200">
            {{ formatSidebarMonth(sidebarYear, sidebarMonth) }}
          </span>
          <div class="flex items-center gap-1.5">
            <button
              @click="handleNewToday"
              class="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              写今天
            </button>
            <div class="flex items-center gap-1 text-slate-400">
              <button @click="prevSidebarMonth" class="p-1 hover:text-slate-700 dark:hover:text-slate-200">
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button @click="nextSidebarMonth" class="p-1 hover:text-slate-700 dark:hover:text-slate-200">
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-7 text-center text-[11px] font-medium text-slate-400 pb-1">
          <div>一</div>
          <div>二</div>
          <div>三</div>
          <div>四</div>
          <div>五</div>
          <div class="text-blue-500 dark:text-blue-400">六</div>
          <div class="text-blue-500 dark:text-blue-400">日</div>
        </div>

        <div class="grid grid-cols-7 text-center text-xs gap-y-1">
          <div
            v-for="d in sidebarDays"
            :key="d.dateStr"
            @click="selectDate(d.dateStr)"
            :class="[
              'h-7 flex flex-col items-center justify-center rounded cursor-pointer transition-colors relative',
              d.isCurrentMonth ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-600',
              selectedDate === d.dateStr ? 'font-bold text-blue-600 dark:text-blue-400' : ''
            ]"
          >
            <span>{{ d.dayNumber }}</span>
            <span
              v-if="selectedDate === d.dateStr || hasEntryOnDate(d.dateStr)"
              :class="[
                'w-1 h-1 rounded-full absolute bottom-0.5',
                selectedDate === d.dateStr ? 'bg-blue-600' : 'bg-slate-400'
              ]"
            ></span>
          </div>
        </div>
      </div>

      <div>
        <button
          @click="showTemplateModal = true"
          class="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          编辑日记微模板
        </button>
      </div>

      <div class="space-y-2 py-1 text-xs border-y border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-slate-500">记录天数</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">{{ totalEntries }} 天</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">随笔总字数</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">{{ totalMemories }} 字</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">连续记录</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">{{ currentStreak }} 天</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">记录月数</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">{{ monthsJournaling }} 个月</span>
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          往期回顾
        </div>
        <button
          @click="filterMonth = null"
          :class="[
            'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            filterMonth === null
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          ]"
        >
          全部记录
        </button>
      </div>

      <div class="space-y-1.5">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          按月份筛选
        </div>
        <div class="space-y-0.5">
          <button
            v-for="m in monthGroups"
            :key="m.monthKey"
            @click="selectMonthFilter(m.monthKey)"
            :class="[
              'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors',
              filterMonth === m.monthKey
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            ]"
          >
            <span>{{ m.label }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 font-medium">
              {{ m.count }}
            </span>
          </button>
        </div>
      </div>

      <div v-if="displayedEntries.length > 0" class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {{ filterMonth ? '月份随笔列表' : '全部历史随笔' }} ({{ displayedEntries.length }})
        </div>
        <div class="max-h-48 overflow-y-auto space-y-1 pr-1">
          <button
            v-for="entry in displayedEntries"
            :key="entry.id"
            @click="selectDate(entry.date)"
            :class="[
              'w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between gap-1.5',
              selectedDate === entry.date
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            ]"
          >
            <div class="min-w-0 flex-1 truncate">
              <div class="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {{ entry.date }}
              </div>
              <div class="text-[10px] text-slate-400 truncate mt-0.5">
                {{ entry.content.slice(0, 30) }}
              </div>
            </div>
            <span class="text-xs shrink-0">{{ entry.mood || '😊' }}</span>
          </button>
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          年度记录
        </div>
        <div class="px-3 py-1 text-slate-600 dark:text-slate-300 font-medium">
          {{ new Date().getFullYear() }} 年
        </div>
      </div>
    </aside>

    <div
      v-if="showTemplateModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      @click.self="showTemplateModal = false"
    >
      <div class="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-xl p-5 space-y-4 shadow-xl max-h-[88vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        <div class="sm:hidden w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2"></div>

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">日记模板设置</h3>
          <button @click="showTemplateModal = false" class="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <textarea
          v-model="customTemplate"
          rows="8"
          class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
        ></textarea>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="resetDefaultTemplate"
            class="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-700 mr-auto border border-slate-200 dark:border-slate-700"
          >
            恢复默认
          </button>
          <button
            @click="showTemplateModal = false"
            class="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            取消
          </button>
          <button
            @click="saveCustomTemplate"
            class="px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  XCircle,
  X,
} from 'lucide-vue-next'
import type { JournalEntry } from '@/types'
import { formatDate, parseDate, getCalendarDays } from '@/utils/date'
import { DEFAULT_JOURNAL_TEMPLATE } from '@/db'

const props = defineProps<{
  journals: JournalEntry[]
  initialDate?: string | null
}>()

const emit = defineEmits<{
  (e: 'save-journal', entry: Partial<JournalEntry>): void
  (e: 'delete-journal', id: string): void
}>()

const selectedDate = ref(props.initialDate || formatDate(new Date()))
const journalContent = ref('')
const showMoodPicker = ref(false)
const showTemplateModal = ref(false)
const autoSaveStatus = ref('')
const filterMonth = ref<string | null>(null)

interface PendingJournalSnapshot {
  id?: string
  date: string
  content: string
  mood: string
}

const isDirty = ref(false)
let pendingSnapshot: PendingJournalSnapshot | null = null
let saveTimer: any = null

const TEMPLATE_KEY = 'flow_os_journal_template_v1'
const customTemplate = ref(DEFAULT_JOURNAL_TEMPLATE)

onMounted(() => {
  const saved = localStorage.getItem(TEMPLATE_KEY)
  if (saved) {
    customTemplate.value = saved
  }
  loadEntryForSelectedDate()
})

onBeforeUnmount(() => {
  flushPendingSave()
})

const activeEntry = computed(() => {
  return props.journals.find((j) => j.date === selectedDate.value)
})

function loadEntryForSelectedDate() {
  const entry = activeEntry.value
  if (entry && entry.content) {
    journalContent.value = entry.content
  } else {
    journalContent.value = customTemplate.value
  }
  isDirty.value = false
  pendingSnapshot = null
}

function flushPendingSave() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (isDirty.value && pendingSnapshot) {
    const toSave = { ...pendingSnapshot }
    pendingSnapshot = null
    isDirty.value = false
    emit('save-journal', toSave)
    autoSaveStatus.value = '已自动保存'
    setTimeout(() => {
      if (!isDirty.value) {
        autoSaveStatus.value = ''
      }
    }, 2000)
  }
}

watch(selectedDate, () => {
  loadEntryForSelectedDate()
})

watch(
  () => props.initialDate,
  (newDate) => {
    if (newDate && newDate !== selectedDate.value) {
      flushPendingSave()
      selectedDate.value = newDate
      const d = parseDate(newDate)
      sidebarYear.value = d.getFullYear()
      sidebarMonth.value = d.getMonth()
    }
  }
)

watch(
  () => props.journals,
  () => {
    // 保护正在输入的文字，避免外部 props 或自动保存返回数据刷新覆盖
    if (!isDirty.value) {
      loadEntryForSelectedDate()
    }
  },
  { deep: true }
)

const formattedDateTitle = computed(() => {
  const d = parseDate(selectedDate.value)
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = weekdays[d.getDay()]
  return `${year}年${month}月${day}日 · ${weekday}`
})

const currentMonthShort = computed(() => {
  const d = parseDate(selectedDate.value)
  return `${d.getMonth() + 1}月`
})

const currentDayNumber = computed(() => {
  const d = parseDate(selectedDate.value)
  return d.getDate()
})

const sidebarYear = ref(new Date().getFullYear())
const sidebarMonth = ref(new Date().getMonth())

const sidebarDays = computed(() => {
  return getCalendarDays(sidebarYear.value, sidebarMonth.value)
})

function prevSidebarMonth() {
  if (sidebarMonth.value === 0) {
    sidebarMonth.value = 11
    sidebarYear.value -= 1
  } else {
    sidebarMonth.value -= 1
  }
}

function nextSidebarMonth() {
  if (sidebarMonth.value === 11) {
    sidebarMonth.value = 0
    sidebarYear.value += 1
  } else {
    sidebarMonth.value += 1
  }
}

function formatSidebarMonth(year: number, month: number) {
  return `${year}年 ${month + 1}月`
}

function selectDate(dateStr: string) {
  if (selectedDate.value === dateStr) return
  flushPendingSave()
  selectedDate.value = dateStr
}

function hasEntryOnDate(dateStr: string): boolean {
  return props.journals.some((j) => j.date === dateStr && !!j.content)
}

function handleAutoSave() {
  autoSaveStatus.value = '正在输入...'
  isDirty.value = true
  pendingSnapshot = {
    id: activeEntry.value?.id,
    date: selectedDate.value,
    content: journalContent.value,
    mood: activeEntry.value?.mood || '😊',
  }
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    flushPendingSave()
  }, 400)
}

function setMood(m: string) {
  showMoodPicker.value = false
  if (pendingSnapshot) {
    pendingSnapshot.mood = m
  }
  emit('save-journal', {
    id: activeEntry.value?.id,
    date: selectedDate.value,
    content: journalContent.value,
    mood: m,
  })
}

function handleClearOrDelete() {
  if (activeEntry.value && confirm('确定清空今天写的这篇日记吗？')) {
    emit('delete-journal', activeEntry.value.id)
    journalContent.value = customTemplate.value
  } else {
    journalContent.value = customTemplate.value
  }
}

function handleNewToday() {
  const today = formatDate(new Date())
  if (selectedDate.value === today) return
  flushPendingSave()
  selectedDate.value = today
}

const totalEntries = computed(() => props.journals.filter((j) => !!j.content).length)
const totalMemories = computed(() => props.journals.reduce((acc, j) => acc + (j.content ? j.content.trim().length : 0), 0))
const currentStreak = computed(() => {
  if (totalEntries.value === 0) return 0
  return 1
})
const monthsJournaling = computed(() => {
  const months = new Set(props.journals.map((j) => j.date.slice(0, 7)))
  return Math.max(1, months.size)
})

const monthGroups = computed(() => {
  const groups = new Map<string, number>()
  props.journals.forEach((j) => {
    if (j.content) {
      const key = j.date.slice(0, 7)
      groups.set(key, (groups.get(key) || 0) + 1)
    }
  })

  const thisMonthKey = formatDate(new Date()).slice(0, 7)
  if (!groups.has(thisMonthKey)) {
    groups.set(thisMonthKey, totalEntries.value || 0)
  }

  const result: { monthKey: string; label: string; count: number }[] = []
  groups.forEach((count, key) => {
    const [y, m] = key.split('-').map(Number)
    result.push({
      monthKey: key,
      label: `${y}年${m}月`,
      count,
    })
  })
  return result
})

const displayedEntries = computed(() => {
  return props.journals
    .filter((j) => {
      if (!j.content || !j.content.trim()) return false
      if (filterMonth.value) {
        return j.date.startsWith(filterMonth.value)
      }
      return true
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1))
})

function selectMonthFilter(monthKey: string) {
  if (filterMonth.value === monthKey) {
    filterMonth.value = null
  } else {
    filterMonth.value = monthKey
    const found = props.journals.find((j) => j.date.startsWith(monthKey) && !!j.content)
    if (found) {
      selectedDate.value = found.date
    }
  }
}

function saveCustomTemplate() {
  localStorage.setItem(TEMPLATE_KEY, customTemplate.value)
  showTemplateModal.value = false
  alert('模板已保存')
}

function resetDefaultTemplate() {
  customTemplate.value = DEFAULT_JOURNAL_TEMPLATE
}
</script>
