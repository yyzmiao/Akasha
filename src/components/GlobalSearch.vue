<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] transition-all"
    >
      <div class="relative flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
        <Search class="w-5 h-5 text-slate-400 shrink-0 mr-3" />
        <input
          ref="searchInputRef"
          v-model="query"
          type="text"
          placeholder="搜索项目、待办、日程、习惯、日记... (↑↓ 导航, Enter 选择)"
          class="w-full py-4 text-sm sm:text-base bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
          @keydown="handleKeyDown"
        />
        <button
          v-if="query"
          @click="query = ''"
          class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
        >
          <X class="w-4 h-4" />
        </button>
        <kbd class="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
          ESC
        </kbd>
      </div>

      <div class="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto text-xs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap',
            selectedCategory === cat.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          ]"
        >
          {{ cat.label }}
          <span v-if="cat.count !== undefined" class="ml-1 opacity-80">({{ cat.count }})</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[55vh]">
        <div
          v-if="filteredResults.length === 0"
          class="py-12 text-center text-slate-400 text-xs sm:text-sm"
        >
          <p v-if="query.trim()">未找到匹配项</p>
          <p v-else>输入关键词开始检索...</p>
        </div>

        <div
          v-for="(item, index) in filteredResults"
          :key="item.id"
          @mouseenter="highlightedIndex = index"
          @click="selectItem(item)"
          :class="[
            'flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all',
            highlightedIndex === index
              ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
          ]"
        >
          <div class="flex items-center gap-3 min-w-0 pr-3">
            <div
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold',
                item.badgeBg
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-medium truncate">
                  {{ item.title }}
                </span>
                <span
                  v-if="item.tag"
                  class="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                >
                  {{ item.tag }}
                </span>
              </div>
              <p v-if="item.subtitle" class="text-xs text-slate-400 truncate mt-0.5">
                {{ item.subtitle }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[11px] font-medium px-2 py-0.5 rounded-full text-slate-400 dark:text-slate-500">
              {{ item.categoryLabel }}
            </span>
            <ChevronRight class="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-[11px] text-slate-400">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↑</kbd>
            <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↓</kbd>
            导航
          </span>
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Enter</kbd>
            确认跳转
          </span>
        </div>
        <span>共 {{ filteredResults.length }} 条结果</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  Search,
  X,
  ChevronRight,
  FolderKanban,
  CheckSquare,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-vue-next'
import type {
  Project,
  TodoItem,
  ScheduleItem,
  Habit,
  JournalEntry,
  Area,
} from '@/types'

type SearchCategory = 'all' | 'project' | 'todo' | 'schedule' | 'habit' | 'journal'

interface SearchResultItem {
  id: string
  type: SearchCategory
  categoryLabel: string
  title: string
  subtitle?: string
  tag?: string
  icon: any
  badgeBg: string
  rawItem: any
}

const props = defineProps<{
  isOpen: boolean
  projects: Project[]
  todos: TodoItem[]
  schedules: ScheduleItem[]
  habits: Habit[]
  journals: JournalEntry[]
  areas: Area[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-project', projectId: string): void
  (e: 'select-todo', todo: TodoItem): void
  (e: 'select-schedule', schedule: ScheduleItem): void
  (e: 'select-habit', habit: Habit): void
  (e: 'select-journal', dateStr: string): void
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const selectedCategory = ref<SearchCategory>('all')
const highlightedIndex = ref(0)

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      query.value = ''
      selectedCategory.value = 'all'
      highlightedIndex.value = 0
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
)

const allIndexItems = computed<SearchResultItem[]>(() => {
  const list: SearchResultItem[] = []

  const areaMap = new Map<string, string>()
  props.areas.forEach((a) => areaMap.set(a.id, a.title))

  const projectMap = new Map<string, string>()
  props.projects.forEach((p) => projectMap.set(p.id, p.title))

  props.projects.forEach((p) => {
    list.push({
      id: `p-${p.id}`,
      type: 'project',
      categoryLabel: '项目',
      title: p.title,
      subtitle: p.description || areaMap.get(p.areaId) || '无所属领域',
      tag: areaMap.get(p.areaId),
      icon: FolderKanban,
      badgeBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      rawItem: p,
    })
  })

  props.todos.forEach((t) => {
    list.push({
      id: `t-${t.id}`,
      type: 'todo',
      categoryLabel: '待办',
      title: t.title,
      subtitle: t.notes || (t.dueDate ? `截止: ${t.dueDate}` : undefined),
      tag: t.completed ? '已完成' : (t.projectId ? projectMap.get(t.projectId) : undefined),
      icon: CheckSquare,
      badgeBg: t.completed
        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
      rawItem: t,
    })
  })

  props.schedules.forEach((s) => {
    const timeInfo = [s.date, s.time].filter(Boolean).join(' ')
    list.push({
      id: `s-${s.id}`,
      type: 'schedule',
      categoryLabel: '日程',
      title: s.title,
      subtitle: timeInfo || (s.recurringType !== 'none' ? `周期日程: ${s.recurringType}` : undefined),
      tag: s.projectId ? projectMap.get(s.projectId) : undefined,
      icon: Calendar,
      badgeBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      rawItem: s,
    })
  })

  const freqMap: Record<string, string> = {
    daily: '每日习惯',
    weekly: '每周习惯',
    biweekly: '双周习惯',
    monthly: '每月习惯',
  }
  const slotMap: Record<string, string> = {
    morning: '早晨',
    afternoon: '下午',
    evening: '晚上',
    anytime: '全天',
  }

  props.habits.forEach((h) => {
    let sub = freqMap[h.frequency] || h.frequency
    if (h.timeSlot && slotMap[h.timeSlot]) {
      sub += ` · ${slotMap[h.timeSlot]}`
    } else if (h.targetCount && h.targetCount > 1) {
      sub += ` · 目标 ${h.targetCount} 次`
    }
    list.push({
      id: `h-${h.id}`,
      type: 'habit',
      categoryLabel: '习惯',
      title: h.title,
      subtitle: sub,
      tag: h.projectId ? projectMap.get(h.projectId) : undefined,
      icon: Sparkles,
      badgeBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      rawItem: h,
    })
  })

  props.journals.forEach((j) => {
    list.push({
      id: `j-${j.id}`,
      type: 'journal',
      categoryLabel: '日记',
      title: `${j.date} 日记 ${j.mood || ''}`,
      subtitle: j.content ? j.content.slice(0, 60) : '无正文内容',
      tag: j.tags?.length ? j.tags.join(', ') : undefined,
      icon: BookOpen,
      badgeBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
      rawItem: j,
    })
  })

  return list
})

const filteredResults = computed(() => {
  const q = query.value.trim().toLowerCase()
  return allIndexItems.value.filter((item) => {
    if (selectedCategory.value !== 'all' && item.type !== selectedCategory.value) {
      return false
    }
    if (!q) return true
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.tag && item.tag.toLowerCase().includes(q))
    )
  })
})

watch(
  () => [query.value, selectedCategory.value],
  () => {
    highlightedIndex.value = 0
  }
)

const categories = computed(() => [
  { id: 'all' as SearchCategory, label: '全部' },
  {
    id: 'project' as SearchCategory,
    label: '项目',
    count: allIndexItems.value.filter((i) => i.type === 'project').length,
  },
  {
    id: 'todo' as SearchCategory,
    label: '待办',
    count: allIndexItems.value.filter((i) => i.type === 'todo').length,
  },
  {
    id: 'schedule' as SearchCategory,
    label: '日程',
    count: allIndexItems.value.filter((i) => i.type === 'schedule').length,
  },
  {
    id: 'habit' as SearchCategory,
    label: '习惯',
    count: allIndexItems.value.filter((i) => i.type === 'habit').length,
  },
  {
    id: 'journal' as SearchCategory,
    label: '日记',
    count: allIndexItems.value.filter((i) => i.type === 'journal').length,
  },
])

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (filteredResults.value.length > 0) {
      highlightedIndex.value = (highlightedIndex.value + 1) % filteredResults.value.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (filteredResults.value.length > 0) {
      highlightedIndex.value =
        (highlightedIndex.value - 1 + filteredResults.value.length) % filteredResults.value.length
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const target = filteredResults.value[highlightedIndex.value]
    if (target) {
      selectItem(target)
    }
  } else if (e.key === 'Escape') {
    emit('close')
  }
}

function selectItem(item: SearchResultItem) {
  if (item.type === 'project') {
    emit('select-project', item.rawItem.id)
  } else if (item.type === 'todo') {
    emit('select-todo', item.rawItem)
  } else if (item.type === 'schedule') {
    emit('select-schedule', item.rawItem)
  } else if (item.type === 'habit') {
    emit('select-habit', item.rawItem)
  } else if (item.type === 'journal') {
    emit('select-journal', item.rawItem.date)
  }
  emit('close')
}
</script>
