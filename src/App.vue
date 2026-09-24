<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-6 transition-colors">
    <Navbar
      :active-tab="activeTab"
      :is-dark="isDark"
      @update:active-tab="handleTabChange"
      @open-settings="isSettingsOpen = true"
      @open-search="isSearchOpen = true"
      @toggle-theme="toggleTheme"
    />

    <main class="flex-1 flex flex-col max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-5 min-h-0">
      <CalendarView
        v-if="activeTab === 'calendar'"
        :todos="todos"
        :schedules="schedules"
        :projects="projects"
        :journals="journals"
        :habits="habits"
        :habit-logs="habitLogs"
        @switch-tab="handleTabChange($event as any)"
        @open-todo="handleOpenTodo"
        @open-schedule="handleOpenSchedule"
        @delete-schedule="handleDeleteSchedule"
        @quick-create-todo="handleQuickCreateTodo"
        @open-journal="handleOpenJournalDate"
        @toggle-todo="handleToggleTodoComplete"
        @toggle-habit="handleToggleHabitLog"
        @save-schedule="handleSaveSchedule"
      />

      <ProjectView
        v-else-if="activeTab === 'projects'"
        :areas="areas"
        :projects="projects"
        :schedules="schedules"
        :habits="habits"
        :habit-logs="habitLogs"
        :todos="todos"
        :target-project-id="targetProjectId"
        @save-area="handleSaveArea"
        @delete-area="handleDeleteArea"
        @reorder-areas="handleReorderAreas"
        @save-project="handleSaveProject"
        @delete-project="handleDeleteProject"
        @save-schedule="handleSaveSchedule"
        @delete-schedule="handleDeleteSchedule"
        @save-habit="handleSaveHabit"
        @delete-habit="handleDeleteHabit"
        @toggle-habit="handleToggleHabitLog"
        @save-todo="handleSaveTodo"
        @delete-todo="handleDeleteTodo"
        @batch-update="handleBatchUpdateTodos"
      />

      <ScheduleView
        v-else-if="activeTab === 'schedules'"
        :schedules="schedules"
        :projects="projects"
        :target-schedule-id="targetScheduleId"
        @save-schedule="handleSaveSchedule"
        @delete-schedule="handleDeleteSchedule"
        @clear-target-id="targetScheduleId = null"
      />

      <TodoView
        v-else-if="activeTab === 'todos'"
        :todos="todos"
        :projects="projects"
        :target-todo-id="targetTodoId"
        @save-todo="handleSaveTodo"
        @delete-todo="handleDeleteTodo"
        @batch-update="handleBatchUpdateTodos"
        @clear-target-id="targetTodoId = null"
      />

      <HabitsView
        v-else-if="activeTab === 'habits'"
        :habits="habits"
        :habit-logs="habitLogs"
        :projects="projects"
        :target-habit-id="targetHabitId"
        @toggle-log="handleToggleHabitLog"
        @create-habit="handleSaveHabit"
        @save-habit="handleSaveHabit"
        @delete-habit="handleDeleteHabit"
        @clear-target-id="targetHabitId = null"
      />

      <JournalView
        v-else-if="activeTab === 'journal'"
        :journals="journals"
        :initial-date="targetJournalDate"
        @save-journal="handleSaveJournal"
        @delete-journal="handleDeleteJournal"
      />
    </main>

    <SettingsDrawer
      :is-open="isSettingsOpen"
      :is-dark="isDark"
      :font-size="currentFontSize"
      :font-family="currentFontFamily"
      :ui-scale="currentUiScale"
      :projects-count="projects.length"
      :todos-count="todosCount"
      :habits-count="habits.length"
      :journals-count="journals.length"
      @close="isSettingsOpen = false"
      @toggle-theme="toggleTheme"
      @change-font-size="applyFontSize"
      @change-font-family="applyFontFamily"
      @change-ui-scale="applyUiScale"
      @export-data="handleExportData"
      @import-data="handleImportData"
      @clear-all="handleClearAll"
      @reload-data="loadAllData"
    />

    <GlobalSearch
      :is-open="isSearchOpen"
      :projects="projects"
      :todos="todos"
      :schedules="schedules"
      :habits="habits"
      :journals="journals"
      :areas="areas"
      @close="isSearchOpen = false"
      @select-project="handleSearchSelectProject"
      @select-todo="handleSearchSelectTodo"
      @select-schedule="handleSearchSelectSchedule"
      @select-habit="handleSearchSelectHabit"
      @select-journal="handleSearchSelectJournal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import CalendarView from '@/components/CalendarView.vue'
import ProjectView from '@/components/ProjectView.vue'
import ScheduleView from '@/components/ScheduleView.vue'
import TodoView from '@/components/TodoView.vue'
import HabitsView from '@/components/HabitsView.vue'
import JournalView from '@/components/JournalView.vue'
import SettingsDrawer from '@/components/SettingsDrawer.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'

import { db, clearAllDatabaseData, initSeedData } from '@/db'
import type {
  ActiveTab,
  Area,
  Project,
  ScheduleItem,
  TodoItem,
  Habit,
  HabitLog,
  JournalEntry,
  FontSize,
  FontFamily,
  UiScale,
} from '@/types'
import { formatDate } from '@/utils/date'
import { getDescendantTodoIds, calculateLinkedTodoCompletion } from '@/utils/tree'
import { enqueueChange, onRemoteDataChange, syncAll, applyBackupToCloud, resetSyncOutbox } from '@/sync/syncEngine'
import { isAuthenticated } from '@/sync/pocketbase'

const THEME_KEY = 'flow_os_theme'
const isDark = ref(false)

function applyTheme(dark: boolean) {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem(THEME_KEY, 'light')
  }
}

function toggleTheme() {
  applyTheme(!isDark.value)
}

const UI_SCALE_KEY = 'flow_os_ui_scale'
const currentUiScale = ref<UiScale>('standard')
const UI_SCALE_MAP: Record<UiScale, string> = {
  compact: '0.9',
  standard: '1',
  comfortable: '1.08',
  large: '1.18',
}

function applyUiScale(scale: UiScale) {
  currentUiScale.value = scale
  const zoomVal = UI_SCALE_MAP[scale] || '1'
  document.documentElement.style.setProperty('--app-zoom', zoomVal)
  try {
    ;(document.body.style as any).zoom = zoomVal
  } catch (_e) {}
  localStorage.setItem(UI_SCALE_KEY, scale)
}

const FONT_FAMILY_KEY = 'flow_os_font_family'
const currentFontFamily = ref<FontFamily>('wenkai')
const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  wenkai: `'LXGW WenKai', 'LXGW WenKai Screen', '霞鹜文楷', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  system: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", sans-serif`,
  serif: `"Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", "SimSun", "宋体", serif`,
}

function applyFontFamily(family: FontFamily) {
  currentFontFamily.value = family
  const familyVal = FONT_FAMILY_MAP[family] || FONT_FAMILY_MAP.wenkai
  document.documentElement.style.setProperty('--app-font-family', familyVal)
  localStorage.setItem(FONT_FAMILY_KEY, family)
}

const FONT_SIZE_KEY = 'flow_os_font_size'
const currentFontSize = ref<FontSize>('standard')
const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  standard: '16px',
  large: '18px',
  xlarge: '20px',
}

function applyFontSize(size: FontSize) {
  currentFontSize.value = size
  document.documentElement.style.fontSize = FONT_SIZE_MAP[size] || '16px'
  localStorage.setItem(FONT_SIZE_KEY, size)
}

const activeTab = ref<ActiveTab>('calendar')
const targetJournalDate = ref<string | null>(null)
const targetProjectId = ref<string | null>(null)
const targetTodoId = ref<string | null>(null)
const targetScheduleId = ref<string | null>(null)
const targetHabitId = ref<string | null>(null)
const areas = ref<Area[]>([])
const projects = ref<Project[]>([])
const schedules = ref<ScheduleItem[]>([])
const todos = ref<TodoItem[]>([])
const habits = ref<Habit[]>([])
const habitLogs = ref<HabitLog[]>([])
const journals = ref<JournalEntry[]>([])

const isSettingsOpen = ref(false)
const isSearchOpen = ref(false)

const todosCount = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter((t) => t.completed).length
  return { total, completed }
})

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    isSearchOpen.value = !isSearchOpen.value
  }
}

function handleTabChange(tab: ActiveTab) {
  targetTodoId.value = null
  targetProjectId.value = null
  targetJournalDate.value = null
  targetScheduleId.value = null
  targetHabitId.value = null
  activeTab.value = tab
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function handleSearchSelectProject(projectId: string) {
  targetProjectId.value = projectId
  activeTab.value = 'projects'
}

function handleSearchSelectTodo(todo: TodoItem) {
  targetTodoId.value = todo.id
  activeTab.value = 'todos'
}

function handleSearchSelectSchedule(schedule: ScheduleItem) {
  targetScheduleId.value = schedule.id
  activeTab.value = 'schedules'
}

function handleSearchSelectHabit(habit: Habit) {
  targetHabitId.value = habit.id
  activeTab.value = 'habits'
}

function handleSearchSelectJournal(dateStr: string) {
  targetJournalDate.value = dateStr
  activeTab.value = 'journal'
}

async function loadAllData() {
  await initSeedData()
  areas.value = await db.areas.toArray()
  projects.value = await db.projects.toArray()
  schedules.value = await db.schedules.toArray()
  todos.value = await db.todos.toArray()
  habits.value = await db.habits.toArray()
  habitLogs.value = await db.habitLogs.toArray()
  journals.value = await db.journals.toArray()
}

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown)
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark') {
    applyTheme(true)
  } else {
    applyTheme(false)
  }
  const savedScale = localStorage.getItem(UI_SCALE_KEY) as UiScale | null
  if (savedScale && UI_SCALE_MAP[savedScale]) {
    applyUiScale(savedScale)
  } else {
    applyUiScale('standard')
  }
  const savedFamily = localStorage.getItem(FONT_FAMILY_KEY) as FontFamily | null
  if (savedFamily && FONT_FAMILY_MAP[savedFamily]) {
    applyFontFamily(savedFamily)
  } else {
    applyFontFamily('wenkai')
  }
  const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null
  if (savedFontSize && FONT_SIZE_MAP[savedFontSize]) {
    applyFontSize(savedFontSize)
  } else {
    applyFontSize('standard')
  }
  await loadAllData()

  // 监听远程跨端变更推送（SSE Realtime）
  onRemoteDataChange(async () => {
    await loadAllData()
  })

  // 若已登录云端，启动后台双向同步与长连接订阅
  if (isAuthenticated.value) {
    syncAll().catch((err) => {
      console.warn('Initial sync error:', err)
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

async function handleSaveArea(areaData: Partial<Area>) {
  const now = Date.now()
  if (areaData.id) {
    const updated = { ...areaData, updatedAt: now }
    await db.areas.update(areaData.id, updated)
    const saved = await db.areas.get(areaData.id)
    if (saved) enqueueChange('area', saved.id, saved)
  } else {
    const newArea: Area = {
      id: 'area-' + Date.now(),
      title: areaData.title || '新领域',
      order: areaData.order ?? areas.value.length,
      createdAt: new Date().toISOString(),
      updatedAt: now,
    }
    await db.areas.add(newArea)
    enqueueChange('area', newArea.id, newArea)
  }
  areas.value = await db.areas.toArray()
}

async function handleReorderAreas(reorderedAreas: Area[]) {
  const now = Date.now()
  for (const a of reorderedAreas) {
    await db.areas.update(a.id, { order: a.order, updatedAt: now })
    const saved = await db.areas.get(a.id)
    if (saved) enqueueChange('area', saved.id, saved)
  }
  areas.value = await db.areas.toArray()
}

async function handleDeleteArea(id: string) {
  const projs = await db.projects.where('areaId').equals(id).toArray()
  for (const p of projs) {
    const schs = await db.schedules.where('projectId').equals(p.id).toArray()
    for (const s of schs) enqueueChange('schedule', s.id, null, true)
    await db.schedules.where('projectId').equals(p.id).delete()

    const hbs = await db.habits.where('projectId').equals(p.id).toArray()
    for (const h of hbs) {
      const logs = await db.habitLogs.where('habitId').equals(h.id).toArray()
      for (const l of logs) enqueueChange('habitLog', l.id, null, true)
      await db.habitLogs.where('habitId').equals(h.id).delete()
      enqueueChange('habit', h.id, null, true)
    }
    await db.habits.where('projectId').equals(p.id).delete()

    const tds = await db.todos.where('projectId').equals(p.id).toArray()
    for (const t of tds) enqueueChange('todo', t.id, null, true)
    await db.todos.where('projectId').equals(p.id).delete()

    enqueueChange('project', p.id, null, true)
  }
  await db.projects.where('areaId').equals(id).delete()
  await db.areas.delete(id)
  enqueueChange('area', id, null, true)
  await loadAllData()
}

async function handleSaveProject(projData: Partial<Project>) {
  const now = Date.now()
  if (projData.id) {
    const updated = { ...projData, updatedAt: now }
    await db.projects.update(projData.id, updated)
    const saved = await db.projects.get(projData.id)
    if (saved) enqueueChange('project', saved.id, saved)
  } else {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      areaId: projData.areaId || (areas.value[0]?.id ?? 'area-1'),
      title: projData.title || '新项目',
      description: projData.description,
      color: projData.color || '#3b82f6',
      order: projData.order ?? projects.value.length,
      createdAt: new Date().toISOString(),
      updatedAt: now,
    }
    await db.projects.add(newProj)
    enqueueChange('project', newProj.id, newProj)
  }
  projects.value = await db.projects.toArray()
}

async function handleDeleteProject(id: string) {
  const schs = await db.schedules.where('projectId').equals(id).toArray()
  for (const s of schs) enqueueChange('schedule', s.id, null, true)
  await db.schedules.where('projectId').equals(id).delete()

  const hbs = await db.habits.where('projectId').equals(id).toArray()
  for (const h of hbs) {
    const logs = await db.habitLogs.where('habitId').equals(h.id).toArray()
    for (const l of logs) enqueueChange('habitLog', l.id, null, true)
    await db.habitLogs.where('habitId').equals(h.id).delete()
    enqueueChange('habit', h.id, null, true)
  }
  await db.habits.where('projectId').equals(id).delete()

  const tds = await db.todos.where('projectId').equals(id).toArray()
  for (const t of tds) enqueueChange('todo', t.id, null, true)
  await db.todos.where('projectId').equals(id).delete()

  await db.projects.delete(id)
  enqueueChange('project', id, null, true)
  await loadAllData()
}

async function handleSaveSchedule(scheduleData: Partial<ScheduleItem>) {
  const now = Date.now()
  if (scheduleData.id) {
    const existing = await db.schedules.get(scheduleData.id)
    if (existing) {
      const merged: ScheduleItem = {
        ...existing,
        ...scheduleData,
        updatedAt: now,
      }
      if (scheduleData.recurringType === 'none') {
        delete (merged as any).recurringDayOfWeek
        delete (merged as any).recurringDayOfMonth
      } else if (scheduleData.recurringType === 'weekly') {
        delete (merged as any).date
        delete (merged as any).recurringDayOfMonth
      } else if (scheduleData.recurringType === 'monthly') {
        delete (merged as any).date
        delete (merged as any).recurringDayOfWeek
      }
      await db.schedules.put(merged)
      const saved = await db.schedules.get(scheduleData.id)
      if (saved) enqueueChange('schedule', saved.id, saved)
    }
  } else {
    const newSchedule: ScheduleItem = {
      id: 'sch-' + Date.now(),
      projectId: scheduleData.projectId,
      title: scheduleData.title || '新日程',
      date: scheduleData.date,
      time: scheduleData.time,
      recurringType: scheduleData.recurringType || 'none',
      recurringDayOfWeek: scheduleData.recurringDayOfWeek,
      recurringDayOfMonth: scheduleData.recurringDayOfMonth,
      createdAt: new Date().toISOString(),
      updatedAt: now,
    }
    await db.schedules.add(newSchedule)
    enqueueChange('schedule', newSchedule.id, newSchedule)
  }
  schedules.value = await db.schedules.toArray()
}

async function handleDeleteSchedule(id: string) {
  await db.schedules.delete(id)
  enqueueChange('schedule', id, null, true)
  schedules.value = await db.schedules.toArray()
}

async function handleSaveTodo(itemData: Partial<TodoItem>) {
  const now = Date.now()
  const { children, ...cleanData } = itemData
  if (itemData.id) {
    const importanceVal = itemData.importance !== undefined ? Number(itemData.importance) : 5
    const updated = {
      ...cleanData,
      importance: importanceVal,
      updatedAt: now,
    }
    await db.todos.update(itemData.id, updated)
    const saved = await db.todos.get(itemData.id)
    if (saved) enqueueChange('todo', saved.id, saved)
  } else {
    const newItem: TodoItem = {
      id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      projectId: itemData.projectId ?? null,
      parentId: itemData.parentId ?? null,
      title: itemData.title || '新待办',
      completed: itemData.completed || false,
      importance: itemData.importance !== undefined ? Number(itemData.importance) : 5,
      startDate: itemData.startDate,
      dueDate: itemData.dueDate,
      notes: itemData.notes || '',
      order: itemData.order || 0,
      collapsed: false,
      createdAt: new Date().toISOString(),
      updatedAt: now,
    }
    await db.todos.add(newItem)
    enqueueChange('todo', newItem.id, newItem)
  }
  todos.value = await db.todos.toArray()
}

async function handleToggleTodoComplete(id: string) {
  const item = todos.value.find((t) => t.id === id)
  if (!item) return
  const willBeCompleted = !item.completed
  const { changedTodos } = calculateLinkedTodoCompletion(todos.value, id, willBeCompleted)
  if (changedTodos.length > 0) {
    await handleBatchUpdateTodos(changedTodos)
  }
}

async function handleDeleteTodo(id: string) {
  const idsToDelete = getDescendantTodoIds(todos.value, id)
  await db.todos.bulkDelete(idsToDelete)
  for (const delId of idsToDelete) {
    enqueueChange('todo', delId, null, true)
  }
  todos.value = await db.todos.toArray()
}

async function handleBatchUpdateTodos(items: TodoItem[]) {
  const now = Date.now()
  const withTime = items.map((it) => ({ ...it, updatedAt: now }))
  await db.todos.bulkPut(withTime)
  for (const it of withTime) {
    enqueueChange('todo', it.id, it)
  }
  todos.value = await db.todos.toArray()
}

function handleOpenTodo(todo: TodoItem) {
  targetTodoId.value = todo.id
  activeTab.value = 'todos'
}

function handleOpenSchedule(schedule: ScheduleItem) {
  targetScheduleId.value = schedule.id
  activeTab.value = 'schedules'
}

function handleQuickCreateTodo(payload: string | { date: string; title?: string }) {
  const dateStr = typeof payload === 'string' ? payload : payload.date
  let title = typeof payload === 'object' && payload.title ? payload.title.trim() : ''
  if (!title) {
    const input = prompt(`添加 ${dateStr} 的待办事项：`)
    if (!input || !input.trim()) return
    title = input.trim()
  }

  handleSaveTodo({
    title,
    dueDate: dateStr,
    startDate: dateStr,
    importance: 5,
  })
}

async function handleToggleHabitLog({ habitId, date }: { habitId: string; date: string }) {
  const existing = await db.habitLogs
    .where(['habitId', 'date'])
    .equals([habitId, date])
    .first()

  const now = Date.now()
  if (existing) {
    const updated = {
      completed: !existing.completed,
      completedAt: new Date().toISOString(),
      updatedAt: now,
    }
    await db.habitLogs.update(existing.id, updated)
    const saved = await db.habitLogs.get(existing.id)
    if (saved) enqueueChange('habitLog', saved.id, saved)
  } else {
    const newLog: HabitLog = {
      id: `hl-${habitId}-${date}-${Date.now()}`,
      habitId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: now,
    }
    await db.habitLogs.add(newLog)
    enqueueChange('habitLog', newLog.id, newLog)
  }
  habitLogs.value = await db.habitLogs.toArray()
}

async function handleSaveHabit(habitData: Partial<Habit>) {
  const now = Date.now()
  if (habitData.id) {
    const existing = await db.habits.get(habitData.id)
    if (existing) {
      const updated: Habit = {
        ...existing,
        ...habitData,
        updatedAt: now,
      }
      await db.habits.update(habitData.id, updated)
      const saved = await db.habits.get(habitData.id)
      if (saved) enqueueChange('habit', saved.id, saved)
    }
  } else {
    const newHabit: Habit = {
      id: 'h-' + Date.now(),
      projectId: habitData.projectId,
      title: habitData.title || '新习惯',
      frequency: habitData.frequency || 'daily',
      timeSlot: habitData.timeSlot || 'morning',
      timingType: habitData.timingType || 'anytime',
      targetCount: habitData.targetCount || 1,
      targetDaysOfWeek: habitData.targetDaysOfWeek,
      anchorDate: habitData.anchorDate || formatDate(new Date()),
      cycleWeeks: habitData.cycleWeeks,
      weekPatterns: habitData.weekPatterns,
      showOnCalendar: habitData.showOnCalendar ?? false,
      color: habitData.color || '#2563eb',
      createdAt: new Date().toISOString(),
      updatedAt: now,
    }
    await db.habits.add(newHabit)
    enqueueChange('habit', newHabit.id, newHabit)
  }
  habits.value = await db.habits.toArray()
}
const handleCreateHabit = handleSaveHabit

async function handleDeleteHabit(id: string) {
  const logs = await db.habitLogs.where('habitId').equals(id).toArray()
  for (const l of logs) enqueueChange('habitLog', l.id, null, true)
  await db.habitLogs.where('habitId').equals(id).delete()

  await db.habits.delete(id)
  enqueueChange('habit', id, null, true)
  habits.value = await db.habits.toArray()
  habitLogs.value = await db.habitLogs.toArray()
}

function handleOpenJournalDate(dateStr: string) {
  targetJournalDate.value = dateStr
  activeTab.value = 'journal'
}

async function handleSaveJournal(entryData: Partial<JournalEntry>) {
  const now = Date.now()
  if (entryData.id) {
    await db.journals.update(entryData.id, {
      ...entryData,
      updatedAt: new Date().toISOString(),
    })
    const saved = await db.journals.get(entryData.id)
    if (saved) enqueueChange('journal', saved.id, saved)
  } else {
    const existing = await db.journals.where('date').equals(entryData.date || '').first()
    if (existing) {
      await db.journals.update(existing.id, {
        ...entryData,
        updatedAt: new Date().toISOString(),
      })
      const saved = await db.journals.get(existing.id)
      if (saved) enqueueChange('journal', saved.id, saved)
    } else {
      const newEntry: JournalEntry = {
        id: 'j-' + Date.now(),
        date: entryData.date || formatDate(new Date()),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mood: entryData.mood || '😊',
        content: entryData.content || '',
        tags: entryData.tags || [],
      }
      await db.journals.add(newEntry)
      enqueueChange('journal', newEntry.id, newEntry)
    }
  }
  journals.value = await db.journals.toArray()
}

async function handleDeleteJournal(id: string) {
  await db.journals.delete(id)
  enqueueChange('journal', id, null, true)
  journals.value = await db.journals.toArray()
}

async function handleExportData() {
  const payload = {
    version: '3.0',
    exportTime: new Date().toISOString(),
    areas: await db.areas.toArray(),
    projects: await db.projects.toArray(),
    schedules: await db.schedules.toArray(),
    todos: await db.todos.toArray(),
    habits: await db.habits.toArray(),
    habitLogs: await db.habitLogs.toArray(),
    journals: await db.journals.toArray(),
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Personal_System_Backup_${formatDate(new Date())}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function handleImportData(jsonStr: string) {
  try {
    let data: any
    try {
      data = JSON.parse(jsonStr)
    } catch (_e) {
      throw new Error('无效的 JSON 格式文件')
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('备份文件根节点必须为合法数据对象')
    }

    const validCollections = ['areas', 'projects', 'schedules', 'todos', 'habits', 'habitLogs', 'journals']
    const hasAnyCollection = validCollections.some((key) => key in data)
    if (!hasAnyCollection) {
      throw new Error('备份文件中未包含任何可识别的数据集（areas/projects/schedules/todos/habits/habitLogs/journals）')
    }

    for (const key of validCollections) {
      if (data[key] !== undefined && !Array.isArray(data[key])) {
        throw new Error(`数据集 [${key}] 格式错误，必须为数组`)
      }
    }

    // Atomic transaction across all local tables
    await db.transaction('rw', [db.areas, db.projects, db.schedules, db.todos, db.habits, db.habitLogs, db.journals], async () => {
      if (data.areas) {
        await db.areas.clear()
        if (data.areas.length > 0) await db.areas.bulkAdd(data.areas)
      }
      if (data.projects) {
        await db.projects.clear()
        if (data.projects.length > 0) await db.projects.bulkAdd(data.projects)
      }
      if (data.schedules) {
        await db.schedules.clear()
        if (data.schedules.length > 0) await db.schedules.bulkAdd(data.schedules)
      }
      if (data.todos) {
        await db.todos.clear()
        if (data.todos.length > 0) await db.todos.bulkAdd(data.todos)
      }
      if (data.habits) {
        await db.habits.clear()
        if (data.habits.length > 0) await db.habits.bulkAdd(data.habits)
      }
      if (data.habitLogs) {
        await db.habitLogs.clear()
        if (data.habitLogs.length > 0) await db.habitLogs.bulkAdd(data.habitLogs)
      }
      if (data.journals) {
        await db.journals.clear()
        if (data.journals.length > 0) await db.journals.bulkAdd(data.journals)
      }
    })

    // Cloud sync handling: apply to cloud or reset queue
    if (isAuthenticated.value) {
      await applyBackupToCloud(data)
    } else {
      resetSyncOutbox()
    }

    await loadAllData()
    alert('数据导入成功！' + (isAuthenticated.value ? '已同步覆盖至云端。' : ''))
    isSettingsOpen.value = false
  } catch (err: any) {
    alert('导入失败，已有数据未受任何修改：\n' + (err.message || err))
  }
}

async function handleClearAll() {
  if (confirm('确认清空所有数据（项目、日程、待办、习惯、日记）吗？操作不可恢复。')) {
    await clearAllDatabaseData()
    if (isAuthenticated.value) {
      await applyBackupToCloud({
        areas: [],
        projects: [],
        schedules: [],
        todos: [],
        habits: [],
        habitLogs: [],
        journals: [],
      })
    } else {
      resetSyncOutbox()
    }
    await loadAllData()
    alert('所有数据已成功清空！' + (isAuthenticated.value ? '云端数据已同步清空。' : ''))
    isSettingsOpen.value = false
  }
}
</script>
