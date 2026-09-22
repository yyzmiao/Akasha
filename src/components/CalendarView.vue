<template>
  <div class="space-y-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700">
          <button
            @click="prevMonth"
            class="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="上个月"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="px-3 text-sm font-semibold text-slate-800 dark:text-slate-100 min-w-[120px] text-center">
            {{ currentYear }}年 {{ currentMonth + 1 }}月
          </span>
          <button
            @click="nextMonth"
            class="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="下个月"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <button
          @click="goToToday"
          class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
        >
          今天
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="$emit('switch-tab', 'projects')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all"
        >
          <FolderKanban class="w-3.5 h-3.5 text-blue-600" />
          <span>项目 ({{ projects.length }})</span>
        </button>

        <button
          @click="$emit('switch-tab', 'todos')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all"
        >
          <CheckSquare class="w-3.5 h-3.5 text-emerald-600" />
          <span>待办 ({{ datedTodos.length }})</span>
        </button>

        <button
          @click="$emit('switch-tab', 'habits')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all"
        >
          <Sparkles class="w-3.5 h-3.5 text-amber-500" />
          <span>习惯</span>
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
      <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <div>周一</div>
        <div>周二</div>
        <div>周三</div>
        <div>周四</div>
        <div>周五</div>
        <div class="text-blue-600 dark:text-blue-400">周六</div>
        <div class="text-blue-600 dark:text-blue-400">周日</div>
      </div>

      <div class="grid grid-cols-7 auto-rows-auto divide-x divide-y divide-slate-200 dark:divide-slate-800">
        <div
          v-for="day in calendarDays"
          :key="day.dateStr"
          @click="handleDayClick(day.dateStr)"
          :class="[
            'min-h-[58px] sm:min-h-[68px] p-1.5 sm:p-2 flex flex-col transition-all duration-200 group relative cursor-pointer',
            day.isCurrentMonth ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-slate-50/60 dark:bg-slate-950/40 text-slate-400 opacity-60',
            day.isToday && isTodayPulsing
              ? 'bg-blue-100/70 dark:bg-blue-900/50 ring-2 ring-blue-500 shadow-md scale-[1.01] z-10'
              : day.isToday
              ? 'bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500 ring-inset'
              : ''
          ]"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5">
              <span
                :class="[
                  'text-xs font-semibold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md',
                  day.isToday
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : day.isWeekend
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300'
                ]"
              >
                {{ day.dayNumber }}
              </span>
              <span v-if="day.isToday" class="text-[10px] font-medium text-blue-600 dark:text-blue-400 hidden sm:inline">
                今日
              </span>
            </div>

            <button
              @click.stop="quickAddTodo(day.dateStr)"
              class="opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] transition-opacity"
              title="添加代办"
            >
              <Plus class="w-3 h-3" />
            </button>
          </div>

          <div class="flex-1 space-y-1">
            <div
              v-for="s in getSchedulesForDay(day.dateStr)"
              :key="s.id"
              @click.stop="handleOpenSchedule(s)"
              class="px-1.5 py-0.5 sm:py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 hover:border-indigo-400 dark:hover:border-indigo-600 text-indigo-900 dark:text-indigo-200 text-[11px] leading-tight flex items-center justify-between gap-1 select-none truncate shadow-2xs cursor-pointer transition-colors"
              :title="`${s.title} (${getProjectName(s.projectId)})`"
            >
              <div class="flex items-center gap-1 min-w-0 truncate">
                <CalendarDays class="w-3 h-3 text-indigo-600 shrink-0" />
                <span v-if="s.time" class="font-mono text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">{{ s.time }}</span>
                <span class="truncate font-medium">{{ s.title }}</span>
              </div>
              <span
                v-if="getProjectColor(s.projectId)"
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :style="{ backgroundColor: getProjectColor(s.projectId) }"
              ></span>
            </div>

            <div
              v-for="todo in getTodosForDay(day.dateStr)"
              :key="todo.id"
              @click.stop="$emit('open-todo', todo)"
              :class="[
                'px-1.5 py-0.5 sm:py-1 rounded border text-[11px] leading-tight transition-all cursor-pointer select-none truncate flex items-center justify-between gap-1',
                todo.completed
                  ? 'opacity-50 line-through bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
                  : todo.importance && todo.importance >= 8
                  ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
                  : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              ]"
              :title="`${todo.title} (${getProjectName(todo.projectId)})`"
            >
              <div class="flex items-center gap-1 min-w-0 truncate">
                <button
                  @click.stop="$emit('toggle-todo', todo.id)"
                  class="w-3 h-3 rounded border border-slate-400 flex items-center justify-center shrink-0 hover:bg-slate-200"
                >
                  <Check v-if="todo.completed" class="w-2.5 h-2.5 stroke-[3]" />
                </button>
                <span class="truncate font-medium">{{ todo.title }}</span>
              </div>
              <span
                v-if="todo.dueDate === day.dateStr"
                class="text-[9px] px-1 rounded bg-white/80 dark:bg-slate-700 font-bold shrink-0"
              >
                截止
              </span>
            </div>

            <div
              v-if="getExtraCount(day.dateStr) > 0"
              class="text-[10px] text-slate-400 text-center font-medium"
            >
              +{{ getExtraCount(day.dateStr) }} 项
            </div>
          </div>

          <div
            v-if="hasJournalOnDate(day.dateStr)"
            @click.stop="$emit('open-journal', day.dateStr)"
            class="mt-1 flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 truncate"
            title="查看此日记"
          >
            <BookOpen class="w-3 h-3 shrink-0" />
            <span class="truncate">日记</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedSchedule" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <CalendarDays class="w-4 h-4 text-indigo-600" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">日程详情</h3>
          </div>
          <button @click="selectedSchedule = null" class="text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <div class="text-[11px] text-slate-400 mb-0.5">日程事项</div>
            <div class="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {{ selectedSchedule.title }}
            </div>
          </div>

          <div>
            <div class="text-[11px] text-slate-400 mb-0.5">所属项目</div>
            <div class="flex items-center gap-1.5">
              <span
                v-if="getProjectColor(selectedSchedule.projectId)"
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: getProjectColor(selectedSchedule.projectId) }"
              ></span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">
                {{ getProjectName(selectedSchedule.projectId) }}
              </span>
            </div>
          </div>

          <div>
            <div class="text-[11px] text-slate-400 mb-0.5">时间与频次</div>
            <div class="text-slate-700 dark:text-slate-300 font-medium font-mono">
              {{ formatScheduleDetailTiming(selectedSchedule) }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="handleDeleteScheduleItem(selectedSchedule.id)"
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>删除日程</span>
          </button>
          <button
            @click="selectedSchedule = null"
            class="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Plus,
  BookOpen,
  CalendarDays,
  Check,
  X,
  Trash2,
} from 'lucide-vue-next'
import type { TodoItem, JournalEntry, ScheduleItem, Project } from '@/types'
import { getCalendarDays, parseDate, isDateInRange } from '@/utils/date'

const props = defineProps<{
  todos: TodoItem[]
  schedules: ScheduleItem[]
  projects: Project[]
  journals: JournalEntry[]
}>()

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void
  (e: 'open-todo', todo: TodoItem): void
  (e: 'quick-create-todo', date: string): void
  (e: 'open-journal', date: string): void
  (e: 'toggle-todo', id: string): void
  (e: 'delete-schedule', id: string): void
}>()

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const isTodayPulsing = ref(false)
const selectedSchedule = ref<ScheduleItem | null>(null)

function handleOpenSchedule(s: ScheduleItem) {
  selectedSchedule.value = s
}

function handleDeleteScheduleItem(id: string) {
  if (confirm('确定删除此日程吗？')) {
    emit('delete-schedule', id)
    selectedSchedule.value = null
  }
}

function formatScheduleDetailTiming(s: ScheduleItem): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  let timing = ''
  if (s.recurringType === 'weekly' && s.recurringDayOfWeek !== undefined) {
    timing = `每周${weekdays[s.recurringDayOfWeek]}`
  } else if (s.recurringType === 'monthly' && s.recurringDayOfMonth !== undefined) {
    timing = `每月${s.recurringDayOfMonth}号`
  } else if (s.date) {
    timing = s.date
  }
  if (s.time) {
    timing += ` ${s.time}`
  }
  return timing || '无固定时间'
}

const calendarDays = computed(() => {
  return getCalendarDays(currentYear.value, currentMonth.value)
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

function goToToday() {
  const d = new Date()
  currentYear.value = d.getFullYear()
  currentMonth.value = d.getMonth()
  isTodayPulsing.value = true
  setTimeout(() => {
    isTodayPulsing.value = false
  }, 1600)
}

function getProjectName(projectId?: string | null): string {
  if (!projectId) return '无项目'
  return props.projects.find((p) => p.id === projectId)?.title || ''
}

function getProjectColor(projectId?: string | null): string {
  if (!projectId) return ''
  return props.projects.find((p) => p.id === projectId)?.color || ''
}

function getSchedulesForDay(dateStr: string): ScheduleItem[] {
  const d = parseDate(dateStr)
  const dayOfWeek = d.getDay()
  const dayOfMonth = d.getDate()

  return props.schedules.filter((s) => {
    if (s.recurringType === 'none' && s.date) {
      return s.date === dateStr
    }
    if (s.recurringType === 'weekly' && s.recurringDayOfWeek !== undefined) {
      return s.recurringDayOfWeek === dayOfWeek
    }
    if (s.recurringType === 'monthly' && s.recurringDayOfMonth !== undefined) {
      return s.recurringDayOfMonth === dayOfMonth
    }
    return false
  })
}

const datedTodos = computed(() => {
  return props.todos.filter((t) => !!t.dueDate || !!t.startDate)
})

function getTodosForDay(dateStr: string): TodoItem[] {
  const list = datedTodos.value.filter((t) => {
    if (t.startDate && t.dueDate) {
      return isDateInRange(dateStr, t.startDate, t.dueDate)
    }
    return t.dueDate === dateStr || t.startDate === dateStr
  })

  list.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return (b.importance || 5) - (a.importance || 5)
  })

  return list.slice(0, 6)
}

function getExtraCount(dateStr: string): number {
  const totalSchedules = getSchedulesForDay(dateStr).length
  const totalTodos = datedTodos.value.filter((t) => {
    if (t.startDate && t.dueDate) {
      return isDateInRange(dateStr, t.startDate, t.dueDate)
    }
    return t.dueDate === dateStr || t.startDate === dateStr
  }).length

  const shownTodos = getTodosForDay(dateStr).length
  return Math.max(0, totalTodos - shownTodos)
}

function hasJournalOnDate(dateStr: string): boolean {
  return props.journals.some((j) => j.date === dateStr && !!j.content)
}

function handleDayClick(dateStr: string) {
  emit('open-journal', dateStr)
}

function quickAddTodo(dateStr: string) {
  emit('quick-create-todo', dateStr)
}
</script>
