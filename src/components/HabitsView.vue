<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-amber-500" />
            <span>日常习惯</span>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              今日已完成 {{ todayCompletedCount }}/{{ dailyHabits.length }}
            </span>
          </h2>
        </div>

        <button
          @click="showAddForm = !showAddForm"
          class="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all w-full sm:w-auto"
        >
          <Plus class="w-4 h-4" />
          <span>新建习惯</span>
        </button>
      </div>

      <div v-if="showAddForm" class="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 space-y-3 text-xs">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-semibold text-slate-800 dark:text-slate-200">新建习惯</h4>
          <button @click="showAddForm = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <input
          v-model="newTitle"
          type="text"
          placeholder="习惯名称..."
          class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
          @keyup.enter="handleCreate"
        />

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div v-if="projects && projects.length > 0">
            <label class="block text-[11px] text-slate-500 mb-1">所属项目</label>
            <select
              v-model="newProjectId"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            >
              <option :value="null">无项目 (独立习惯)</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] text-slate-500 mb-1">循环周期</label>
            <select
              v-model="newFrequency"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            >
              <option value="daily">每日习惯</option>
              <option value="weekly">每周习惯</option>
              <option value="biweekly">每两周 (双周)</option>
              <option value="monthly">每月习惯</option>
            </select>
          </div>

          <div v-if="newFrequency === 'daily'">
            <label class="block text-[11px] text-slate-500 mb-1">时段归集</label>
            <select
              v-model="newSlot"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            >
              <option value="morning">早晨</option>
              <option value="afternoon">下午</option>
              <option value="evening">晚上</option>
              <option value="anytime">全天</option>
            </select>
          </div>

          <div v-if="newFrequency === 'weekly' || newFrequency === 'biweekly'">
            <label class="block text-[11px] text-slate-500 mb-1">触发时机</label>
            <select
              v-model="newTiming"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            >
              <option value="anytime">任意一天</option>
              <option value="weekend">仅限周末</option>
            </select>
          </div>

          <div v-if="newFrequency === 'weekly'">
            <label class="block text-[11px] text-slate-500 mb-1">目标频次</label>
            <div class="flex items-center gap-1.5">
              <input
                v-model.number="newTargetCount"
                type="number"
                min="1"
                max="7"
                class="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500"
              />
              <span class="text-slate-500">次 / 周</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <button
            @click="showAddForm = false"
            class="px-3 py-1 rounded text-slate-500 hover:text-slate-700"
          >
            取消
          </button>
          <button
            @click="handleCreate"
            class="px-4 py-1.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="habits.length === 0"
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-2 shadow-sm"
    >
      <div class="w-10 h-10 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
        <Sparkles class="w-5 h-5" />
      </div>
      <p class="text-xs text-slate-400">暂无习惯</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">
          每日习惯
        </h3>

        <div
          v-for="slot in timeSlotConfigs"
          :key="slot.key"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm"
        >
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">{{ slot.title }}</span>
            <span class="text-[11px] font-mono text-slate-400">
              {{ getSlotCompleted(slot.key) }}/{{ getSlotHabits(slot.key).length }} 完成
            </span>
          </div>

          <div v-if="getSlotHabits(slot.key).length === 0" class="text-center py-2 text-xs text-slate-400">
            此时间段暂无习惯
          </div>

          <div class="space-y-1.5">
            <div
              v-for="h in getSlotHabits(slot.key)"
              :key="h.id"
              @click="toggleHabitLog(h.id, todayStr)"
              :class="[
                'group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none',
                isDoneToday(h.id)
                  ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              ]"
            >
              <div class="flex items-center gap-2.5">
                <div
                  :class="[
                    'w-4 h-4 rounded border flex items-center justify-center transition-all',
                    isDoneToday(h.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                  ]"
                >
                  <Check v-if="isDoneToday(h.id)" class="w-3 h-3 stroke-[3]" />
                </div>
                <span :class="['text-xs font-medium', isDoneToday(h.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200']">
                  {{ h.title }}
                </span>
                <span
                  v-if="getProject(h.projectId)"
                  class="px-1.5 py-0.2 rounded text-[10px] font-medium shrink-0"
                  :style="{
                    backgroundColor: (getProject(h.projectId)?.color || '#3b82f6') + '20',
                    color: getProject(h.projectId)?.color || '#3b82f6'
                  }"
                >
                  {{ getProject(h.projectId)?.title }}
                </span>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button
                  @click.stop="openEditHabit(h)"
                  class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                  title="修改习惯"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  @click.stop="handleDelete(h.id)"
                  class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  title="删除习惯"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">
            周度与双周习惯
          </h3>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div v-if="weeklyHabits.length === 0" class="text-center py-4 text-xs text-slate-400">
              暂无周度习惯
            </div>

            <div class="space-y-2">
              <div
                v-for="h in weeklyHabits"
                :key="h.id"
                @click="toggleWeekly(h)"
                :class="[
                  'group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none',
                  isWeeklyDone(h)
                    ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    :class="[
                      'w-4 h-4 rounded border flex items-center justify-center transition-all',
                      isWeeklyDone(h) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    ]"
                  >
                    <Check v-if="isWeeklyDone(h)" class="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span :class="['text-xs font-medium', isWeeklyDone(h) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200']">
                        {{ h.title }}
                      </span>
                      <span
                        v-if="getProject(h.projectId)"
                        class="px-1.5 py-0.2 rounded text-[10px] font-medium shrink-0"
                        :style="{
                          backgroundColor: (getProject(h.projectId)?.color || '#3b82f6') + '20',
                          color: getProject(h.projectId)?.color || '#3b82f6'
                        }"
                      >
                        {{ getProject(h.projectId)?.title }}
                      </span>
                      <span
                        v-if="h.frequency === 'biweekly'"
                        class="px-1.5 py-0.2 rounded text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-medium"
                      >
                        双周
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-400 mt-0.5">
                      本周进度：{{ getWeeklyCount(h) }}/{{ h.targetCount || 1 }} 次
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button
                    @click.stop="openEditHabit(h)"
                    class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                    title="修改习惯"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click.stop="handleDelete(h.id)"
                    class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    title="删除习惯"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">
            每月习惯
          </h3>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div v-if="monthlyHabits.length === 0" class="text-center py-4 text-xs text-slate-400">
              暂无每月习惯
            </div>

            <div class="space-y-2">
              <div
                v-for="h in monthlyHabits"
                :key="h.id"
                @click="toggleMonthly(h.id)"
                :class="[
                  'group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none',
                  isMonthlyDone(h.id)
                    ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    :class="[
                      'w-4 h-4 rounded border flex items-center justify-center transition-all',
                      isMonthlyDone(h.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    ]"
                  >
                    <Check v-if="isMonthlyDone(h.id)" class="w-3 h-3 stroke-[3]" />
                  </div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span :class="['text-xs font-medium', isMonthlyDone(h.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200']">
                      {{ h.title }}
                    </span>
                    <span
                      v-if="getProject(h.projectId)"
                      class="px-1.5 py-0.2 rounded text-[10px] font-medium shrink-0"
                      :style="{
                        backgroundColor: (getProject(h.projectId)?.color || '#3b82f6') + '20',
                        color: getProject(h.projectId)?.color || '#3b82f6'
                      }"
                    >
                      {{ getProject(h.projectId)?.title }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button
                    @click.stop="openEditHabit(h)"
                    class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                    title="修改习惯"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click.stop="handleDelete(h.id)"
                    class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    title="删除习惯"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 习惯修改弹窗 (Edit Habit Modal) -->
    <div
      v-if="isEditModalOpen && editingHabit"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      @click.self="closeEditModal"
      @keydown.esc="closeEditModal"
    >
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-xl space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Pencil class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">修改习惯</h3>
              <p class="text-[11px] text-slate-400">调整习惯属性与循环规则</p>
            </div>
          </div>
          <button
            @click="closeEditModal"
            class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              习惯名称 <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="editingHabit.title"
              type="text"
              placeholder="习惯名称..."
              class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              @keyup.enter="handleSaveEdit"
            />
          </div>

          <div v-if="projects && projects.length > 0">
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">所属项目</label>
            <select
              v-model="editingHabit.projectId"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            >
              <option :value="null">无项目 (独立习惯)</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">循环周期</label>
            <select
              v-model="editingHabit.frequency"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            >
              <option value="daily">每日习惯</option>
              <option value="weekly">每周习惯</option>
              <option value="biweekly">每两周 (双周)</option>
              <option value="monthly">每月习惯</option>
            </select>
          </div>

          <div v-if="editingHabit.frequency === 'daily'">
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">时段归集</label>
            <select
              v-model="editingHabit.timeSlot"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            >
              <option value="morning">早晨</option>
              <option value="afternoon">下午</option>
              <option value="evening">晚上</option>
              <option value="anytime">全天</option>
            </select>
          </div>

          <div v-if="editingHabit.frequency === 'weekly' || editingHabit.frequency === 'biweekly'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">触发时机</label>
              <select
                v-model="editingHabit.timingType"
                class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              >
                <option value="anytime">任意一天</option>
                <option value="weekend">仅限周末</option>
              </select>
            </div>
            <div v-if="editingHabit.frequency === 'weekly'">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">目标频次</label>
              <div class="flex items-center gap-1.5">
                <input
                  v-model.number="editingHabit.targetCount"
                  type="number"
                  min="1"
                  max="7"
                  class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                />
                <span class="text-xs text-slate-500 shrink-0">次 / 周</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="closeEditModal"
            class="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleSaveEdit"
            class="px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Plus, X, Check, Trash2, Pencil } from 'lucide-vue-next'
import type { Habit, HabitLog, HabitFrequency, TimeSlot, TimingType, Project } from '@/types'
import { formatDate, getWeekKey } from '@/utils/date'
import confetti from 'canvas-confetti'

const props = defineProps<{
  habits: Habit[]
  habitLogs: HabitLog[]
  projects?: Project[]
}>()

const emit = defineEmits<{
  (e: 'toggle-log', payload: { habitId: string; date: string }): void
  (e: 'create-habit', habit: Partial<Habit>): void
  (e: 'save-habit', habit: Partial<Habit>): void
  (e: 'delete-habit', id: string): void
}>()

const todayStr = computed(() => formatDate(new Date()))
const currentWeek = computed(() => getWeekKey(todayStr.value))

const showAddForm = ref(false)
const newTitle = ref('')
const newProjectId = ref<string | null>(null)
const newFrequency = ref<HabitFrequency>('daily')
const newSlot = ref<TimeSlot>('morning')
const newTiming = ref<TimingType>('anytime')
const newTargetCount = ref(1)

// 修改习惯状态
const isEditModalOpen = ref(false)
const editingHabit = ref<{
  id: string
  title: string
  projectId: string | null
  frequency: HabitFrequency
  timeSlot: TimeSlot
  timingType: TimingType
  targetCount: number
} | null>(null)

function openEditHabit(habit: Habit) {
  editingHabit.value = {
    id: habit.id,
    title: habit.title,
    projectId: habit.projectId || null,
    frequency: habit.frequency || 'daily',
    timeSlot: habit.timeSlot || 'morning',
    timingType: habit.timingType || 'anytime',
    targetCount: habit.targetCount || 1,
  }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingHabit.value = null
}

function handleSaveEdit() {
  if (!editingHabit.value || !editingHabit.value.title.trim()) return
  const payload: Partial<Habit> = {
    id: editingHabit.value.id,
    title: editingHabit.value.title.trim(),
    projectId: editingHabit.value.projectId || null,
    frequency: editingHabit.value.frequency,
    timeSlot: editingHabit.value.timeSlot,
    timingType: editingHabit.value.timingType,
    targetCount: editingHabit.value.targetCount,
  }
  emit('save-habit', payload)
  closeEditModal()
}

const timeSlotConfigs: { key: TimeSlot; title: string }[] = [
  { key: 'morning', title: '早晨' },
  { key: 'afternoon', title: '下午' },
  { key: 'evening', title: '晚上' },
  { key: 'anytime', title: '全天' },
]

const dailyHabits = computed(() => props.habits.filter((h) => h.frequency === 'daily'))
const weeklyHabits = computed(() => props.habits.filter((h) => h.frequency === 'weekly' || h.frequency === 'biweekly'))
const monthlyHabits = computed(() => props.habits.filter((h) => h.frequency === 'monthly'))

function getProject(projectId?: string | null): Project | null {
  if (!props.projects || !projectId) return null
  return props.projects.find((p) => p.id === projectId) || null
}

function getSlotHabits(slot: TimeSlot) {
  return dailyHabits.value.filter((h) => h.timeSlot === slot)
}

function isDoneToday(habitId: string): boolean {
  return props.habitLogs.some((l) => l.habitId === habitId && l.date === todayStr.value && l.completed)
}

function getSlotCompleted(slot: TimeSlot): number {
  return getSlotHabits(slot).filter((h) => isDoneToday(h.id)).length
}

const todayCompletedCount = computed(() => {
  return dailyHabits.value.filter((h) => isDoneToday(h.id)).length
})

function getWeeklyCount(habit: Habit): number {
  return props.habitLogs.filter(
    (l) => l.habitId === habit.id && l.completed && getWeekKey(l.date) === currentWeek.value
  ).length
}

function isWeeklyDone(habit: Habit): boolean {
  return getWeeklyCount(habit) >= (habit.targetCount || 1)
}

function isMonthlyDone(habitId: string): boolean {
  const month = todayStr.value.slice(0, 7)
  return props.habitLogs.some((l) => l.habitId === habitId && l.completed && l.date.startsWith(month))
}

function toggleHabitLog(habitId: string, date: string) {
  const done = isDoneToday(habitId)
  emit('toggle-log', { habitId, date })
  if (!done) {
    confetti({ particleCount: 20, spread: 35, origin: { y: 0.8 } })
  }
}

function toggleWeekly(habit: Habit) {
  const done = isWeeklyDone(habit)
  emit('toggle-log', { habitId: habit.id, date: todayStr.value })
  if (!done) {
    confetti({ particleCount: 20, spread: 35, origin: { y: 0.8 } })
  }
}

function toggleMonthly(habitId: string) {
  const done = isMonthlyDone(habitId)
  emit('toggle-log', { habitId, date: todayStr.value })
  if (!done) {
    confetti({ particleCount: 20, spread: 35, origin: { y: 0.8 } })
  }
}

function handleCreate() {
  if (!newTitle.value.trim()) return
  const payload: Partial<Habit> = {
    title: newTitle.value.trim(),
    projectId: newProjectId.value || null,
    frequency: newFrequency.value,
    timeSlot: newSlot.value,
    timingType: newTiming.value,
    targetCount: newTargetCount.value,
    anchorDate: todayStr.value,
  }
  emit('save-habit', payload)
  emit('create-habit', payload)
  newTitle.value = ''
  newProjectId.value = null
  showAddForm.value = false
}

function handleDelete(id: string) {
  if (confirm('确定删除该习惯吗？')) {
    emit('delete-habit', id)
  }
}
</script>
