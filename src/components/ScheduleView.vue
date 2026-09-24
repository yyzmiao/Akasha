<template>
  <div class="space-y-4 sm:space-y-5 pb-8">
    <!-- Top Action & Filter Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
      <!-- Left: Title & Summary -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
          <CalendarDays class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              固定日程安排
            </h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium">
              共 {{ filteredSchedules.length }} 项
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            单次特定预约与重要日程排期（周期循环打卡请前往“习惯”）
          </p>
        </div>
      </div>

      <!-- Right: Project Filter & New Schedule Button -->
      <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        <!-- Project Filter Dropdown -->
        <div class="relative">
          <select
            v-model="selectedProjectId"
            class="h-9 pl-3 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">所有所属项目</option>
            <option
              v-for="p in projects"
              :key="p.id"
              :value="p.id"
            >
              {{ p.title }}
            </option>
          </select>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- New Schedule Button -->
        <button
          @click="openCreateModal()"
          class="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>新建日程</span>
        </button>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto no-scrollbar select-none">
      <button
        @click="activeCategory = 'all'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
          activeCategory === 'all'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <span>全部日程</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="activeCategory === 'all' ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ filteredSchedules.length }}
        </span>
      </button>

      <button
        @click="activeCategory = 'upcoming'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
          activeCategory === 'upcoming'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <Clock class="w-3.5 h-3.5" />
        <span>近期日程</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="activeCategory === 'upcoming' ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ upcomingSchedules.length }}
        </span>
      </button>

      <button
        @click="activeCategory = 'past'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
          activeCategory === 'past'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <span>已过日程</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="activeCategory === 'past' ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ pastSchedules.length }}
        </span>
      </button>
    </div>

    <!-- Single Date Schedules Grid / List -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <CalendarDays class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
            {{ activeCategory === 'upcoming' ? '近期日程安排' : activeCategory === 'past' ? '历史日程' : '日程排期列表' }}
          </h3>
          <span class="text-xs px-2 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-medium">
            {{ displaySchedules.length }}
          </span>
        </div>
      </div>

      <!-- Cards Grid -->
      <div v-if="displaySchedules.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="s in displaySchedules"
          :key="s.id"
          :id="'schedule-card-' + s.id"
          @click="openEditModal(s)"
          :class="[
            'group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between cursor-pointer',
            highlightedScheduleId === s.id ? 'ring-2 ring-blue-500 shadow-md scale-[1.01]' : ''
          ]"
        >
          <div>
            <!-- Timing & Project Badges -->
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono">
                  {{ formatDisplayDateOnly(s.date) }}
                </span>
                <span v-if="s.time" class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-mono">
                  <Clock class="w-3.5 h-3.5 text-slate-400" />
                  {{ s.time }}{{ s.endTime ? ' ~ ' + s.endTime : '' }}
                </span>
                <span v-else class="text-xs text-slate-500 dark:text-slate-400">
                  全天
                </span>
                <span v-if="s.endDate && s.endDate !== s.date" class="text-xs font-mono text-slate-500 dark:text-slate-400">
                  至 {{ formatDisplayDateOnly(s.endDate) }}
                </span>
                <span
                  v-if="s.date && formatDaysDiff(s.date)"
                  :class="[
                    'text-xs px-1.5 py-0.2 rounded font-medium',
                    formatDaysDiff(s.date)?.urgentClass
                  ]"
                >
                  {{ formatDaysDiff(s.date)?.text }}
                </span>
              </div>

              <div v-if="getProject(s.projectId)" class="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                <span
                  class="w-2 h-2 rounded-full"
                  :style="{ backgroundColor: getProjectColor(s.projectId) }"
                ></span>
                <span class="truncate max-w-[100px]">{{ getProjectName(s.projectId) }}</span>
              </div>
            </div>

            <!-- Title -->
            <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words">
              {{ s.title }}
            </h4>
          </div>

          <!-- Actions Bar -->
          <div class="flex items-center justify-end gap-1 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              @click.stop="openEditModal(s)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
              title="编辑日程"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              @click.stop="handleDelete(s.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="删除日程"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2"
      >
        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">暂无日程安排</p>
        <p class="text-xs text-slate-400">点击右上角“新建日程”添加单次重要预约、考试或节点排期</p>
      </div>
    </div>

    <!-- Create / Edit Schedule Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <CalendarDays class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              {{ editingId ? '编辑日程' : '新建日程' }}
            </h3>
          </div>
          <button
            @click="closeModal"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Content -->
        <div class="space-y-3.5">
          <!-- Title -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              日程名称 <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="formTitle"
              type="text"
              placeholder="例如：下午2点项目评审、周四体检、客户面谈..."
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              @keydown.enter="handleSubmit"
            />
          </div>

          <!-- Project Select -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              所属项目 (可选)
            </label>
            <select
              v-model="formProjectId"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option :value="null">无归属项目 (公共日常)</option>
              <option
                v-for="p in projects"
                :key="p.id"
                :value="p.id"
              >
                {{ p.title }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-blue-500" />
                <span>时间安排 <span class="text-rose-500">*</span></span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="isScheduleAllDay"
                  @change="handleScheduleAllDayChange"
                  class="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20"
                />
                <span>全天日程</span>
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Box 1: 开始时间 -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {{ isScheduleAllDay ? '开始日期' : '开始时间' }}
                  </label>
                </div>
                <input
                  v-if="!isScheduleAllDay"
                  v-model="scheduleStartDateTime"
                  type="datetime-local"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
                <input
                  v-else
                  v-model="scheduleStartDateOnly"
                  type="date"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <!-- Box 2: 结束时间 -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {{ isScheduleAllDay ? '结束日期 (可选)' : '结束时间 (可选)' }}
                  </label>
                  <button
                    v-if="isScheduleAllDay ? scheduleEndDateOnly : scheduleEndDateTime"
                    type="button"
                    @click="clearScheduleEnd"
                    class="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    清除
                  </button>
                </div>
                <input
                  v-if="!isScheduleAllDay"
                  v-model="scheduleEndDateTime"
                  type="datetime-local"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
                <input
                  v-else
                  v-model="scheduleEndDateOnly"
                  type="date"
                  class="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleSubmit"
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            {{ editingId ? '保存变更' : '立即创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  CalendarDays,
  Plus,
  Clock,
  ChevronDown,
  Pencil,
  Trash2,
  X,
} from 'lucide-vue-next'
import type { ScheduleItem, Project } from '@/types'
import { formatDate, parseDate } from '@/utils/date'

const props = defineProps<{
  schedules: ScheduleItem[]
  projects: Project[]
  targetScheduleId?: string | null
}>()

const emit = defineEmits<{
  (e: 'save-schedule', data: Partial<ScheduleItem>): void
  (e: 'delete-schedule', id: string): void
  (e: 'clear-target-id'): void
}>()

const highlightedScheduleId = ref<string | null>(null)
const selectedProjectId = ref<string>('all')
const activeCategory = ref<'all' | 'upcoming' | 'past'>('all')

watch(
  () => props.targetScheduleId,
  (id) => {
    if (!id) return
    const target = props.schedules.find((s) => s.id === id)
    if (!target) return

    if (target.projectId && selectedProjectId.value !== 'all' && selectedProjectId.value !== target.projectId) {
      selectedProjectId.value = target.projectId
    }

    highlightedScheduleId.value = id
    emit('clear-target-id')

    nextTick(() => {
      const el = document.getElementById(`schedule-card-${id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })

    setTimeout(() => {
      if (highlightedScheduleId.value === id) {
        highlightedScheduleId.value = null
      }
    }, 2500)
  },
  { immediate: true }
)

const filteredSchedules = computed(() => {
  if (selectedProjectId.value === 'all') {
    return props.schedules
  }
  return props.schedules.filter((s) => s.projectId === selectedProjectId.value)
})

const sortedSchedules = computed(() => {
  return [...filteredSchedules.value].sort((a, b) => {
    const dateComp = (a.date || '').localeCompare(b.date || '')
    if (dateComp !== 0) return dateComp
    return (a.time || '').localeCompare(b.time || '')
  })
})

const upcomingSchedules = computed(() => {
  const todayStr = formatDate(new Date())
  return sortedSchedules.value.filter((s) => (s.date || '') >= todayStr)
})

const pastSchedules = computed(() => {
  const todayStr = formatDate(new Date())
  return sortedSchedules.value.filter((s) => !!s.date && s.date < todayStr)
})

const displaySchedules = computed(() => {
  if (activeCategory.value === 'upcoming') return upcomingSchedules.value
  if (activeCategory.value === 'past') return pastSchedules.value
  return sortedSchedules.value
})

function getProject(projectId?: string | null): Project | undefined {
  if (!projectId) return undefined
  return props.projects.find((p) => p.id === projectId)
}

function getProjectName(projectId?: string | null): string {
  return getProject(projectId)?.title || ''
}

function getProjectColor(projectId?: string | null): string {
  return getProject(projectId)?.color || '#3b82f6'
}

function formatDisplayDateOnly(dateStr?: string): string {
  if (!dateStr) return '未定日期'
  try {
    const d = parseDate(dateStr)
    const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${weekMap[d.getDay()]}`
  } catch {
    return dateStr
  }
}

function formatDaysDiff(dateStr?: string): { text: string; urgentClass: string } | null {
  if (!dateStr) return null
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = parseDate(dateStr)
    target.setHours(0, 0, 0, 0)
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) {
      return { text: '今日', urgentClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 font-bold' }
    } else if (diff === 1) {
      return { text: '明天', urgentClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' }
    } else if (diff > 1 && diff <= 7) {
      return { text: `${diff}天后`, urgentClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' }
    } else if (diff < 0) {
      return { text: `已过 ${Math.abs(diff)} 天`, urgentClass: 'bg-slate-100 text-slate-500 dark:bg-slate-800' }
    }
    return null
  } catch {
    return null
  }
}

function handleDelete(id: string) {
  if (confirm('确定删除此日程吗？删除后日历中该事项也将同步移除。')) {
    emit('delete-schedule', id)
  }
}

// Modal State
const showModal = ref(false)
const editingId = ref<string | null>(null)
const formTitle = ref('')
const formProjectId = ref<string | null>(null)
const isScheduleAllDay = ref(false)
const scheduleStartDateTime = ref('')
const scheduleEndDateTime = ref('')
const scheduleStartDateOnly = ref('')
const scheduleEndDateOnly = ref('')

function handleScheduleAllDayChange() {
  if (isScheduleAllDay.value) {
    if (scheduleStartDateTime.value) {
      scheduleStartDateOnly.value = scheduleStartDateTime.value.split('T')[0]
    }
    if (scheduleEndDateTime.value) {
      scheduleEndDateOnly.value = scheduleEndDateTime.value.split('T')[0]
    }
  } else {
    if (scheduleStartDateOnly.value) {
      scheduleStartDateTime.value = `${scheduleStartDateOnly.value}T09:00`
    }
    if (scheduleEndDateOnly.value) {
      scheduleEndDateTime.value = `${scheduleEndDateOnly.value}T18:00`
    }
  }
}

function clearScheduleEnd() {
  scheduleEndDateTime.value = ''
  scheduleEndDateOnly.value = ''
}

function openCreateModal() {
  editingId.value = null
  formTitle.value = ''
  formProjectId.value = selectedProjectId.value === 'all' ? null : selectedProjectId.value
  const today = formatDate(new Date())
  isScheduleAllDay.value = false
  scheduleStartDateTime.value = `${today}T09:00`
  scheduleEndDateTime.value = `${today}T10:00`
  scheduleStartDateOnly.value = today
  scheduleEndDateOnly.value = today
  showModal.value = true
}

function openEditModal(s: ScheduleItem) {
  editingId.value = s.id
  formTitle.value = s.title
  formProjectId.value = s.projectId || null

  if (s.time || s.endTime) {
    isScheduleAllDay.value = false
  } else if (s.date) {
    isScheduleAllDay.value = true
  } else {
    isScheduleAllDay.value = false
  }

  if (s.date) {
    scheduleStartDateTime.value = s.time ? `${s.date}T${s.time}` : `${s.date}T09:00`
    scheduleStartDateOnly.value = s.date
  } else {
    scheduleStartDateTime.value = ''
    scheduleStartDateOnly.value = ''
  }

  if (s.endDate) {
    scheduleEndDateTime.value = s.endTime ? `${s.endDate}T${s.endTime}` : `${s.endDate}T18:00`
    scheduleEndDateOnly.value = s.endDate
  } else if (s.endTime && s.date) {
    scheduleEndDateTime.value = `${s.date}T${s.endTime}`
    scheduleEndDateOnly.value = s.date
  } else {
    scheduleEndDateTime.value = ''
    scheduleEndDateOnly.value = ''
  }

  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleSubmit() {
  if (!formTitle.value.trim()) {
    alert('请输入日程名称')
    return
  }

  let date: string | undefined
  let time: string | undefined
  let endDate: string | undefined
  let endTime: string | undefined

  if (isScheduleAllDay.value) {
    date = scheduleStartDateOnly.value?.trim() || formatDate(new Date())
    time = undefined
    endDate = scheduleEndDateOnly.value?.trim() || undefined
    endTime = undefined
  } else {
    if (scheduleStartDateTime.value) {
      const [d, t] = scheduleStartDateTime.value.split('T')
      date = d?.trim() || formatDate(new Date())
      time = t?.trim() || undefined
    } else {
      date = formatDate(new Date())
    }
    if (scheduleEndDateTime.value) {
      const [d, t] = scheduleEndDateTime.value.split('T')
      endDate = d?.trim() || undefined
      endTime = t?.trim() || undefined
    }
  }

  const payload: Partial<ScheduleItem> = {
    title: formTitle.value.trim(),
    projectId: formProjectId.value,
    recurringType: 'none',
    date,
    time,
    endDate,
    endTime,
  }

  if (editingId.value) {
    payload.id = editingId.value
  }

  emit('save-schedule', payload)
  closeModal()
}
</script>
