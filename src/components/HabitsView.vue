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
              <option value="rotating">多周轮换循环周期 (高级)</option>
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

          <div v-if="newFrequency === 'weekly'">
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

        <!-- 多周轮换配置与卡片选择器 -->
        <div v-if="newFrequency === 'rotating'" class="space-y-3 pt-1 border-t border-blue-200/60 dark:border-blue-800/60">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">轮换周期总周数</label>
              <select
                v-model.number="newCycleWeeks"
                class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                <option :value="2">2 周一轮 (双周轮换)</option>
                <option :value="3">3 周一轮 (三周循环)</option>
                <option :value="4">4 周一轮 (四周循环)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                基准起始周（锚点日期）
              </label>
              <input
                v-model="newAnchorDate"
                type="date"
                class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <!-- 第 1 周 / 第 2 周 ... 多选卡片 -->
          <div class="space-y-2">
            <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
              各周排期设定（点击切换周一至周日执行日）
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                v-for="w in newCycleWeeks"
                :key="w"
                :class="[
                  'p-3 rounded-xl border transition-all',
                  newRotatingPreview.currentWeek === w
                    ? 'border-blue-400 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                ]"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-xs text-slate-800 dark:text-slate-200">第 {{ w }} 周</span>
                    <span
                      v-if="newRotatingPreview.currentWeek === w"
                      class="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold"
                    >
                      当前生效周
                    </span>
                  </div>

                  <div class="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      @click="setNewPatternPreset(w, 'weekdays')"
                      class="px-1.5 py-0.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      工作日
                    </button>
                    <button
                      type="button"
                      @click="setNewPatternPreset(w, 'weekend')"
                      class="px-1.5 py-0.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      周末
                    </button>
                    <button
                      type="button"
                      @click="setNewPatternPreset(w, 'clear')"
                      class="px-1.5 py-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      清空
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-7 gap-1">
                  <button
                    v-for="d in WEEKDAY_ORDER"
                    :key="d"
                    type="button"
                    @click="toggleNewPatternDay(w, d)"
                    :class="[
                      'py-1 rounded-md text-xs font-medium text-center transition-all',
                      (newWeekPatterns[w] || []).includes(d)
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    ]"
                  >
                    {{ WEEKDAY_SHORT_NAMES[d] }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 自然语言实时预览 -->
          <div class="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 space-y-1">
            <div class="flex items-center gap-1.5 font-semibold text-xs text-blue-700 dark:text-blue-300">
              <Sparkles class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>规则实时预览</span>
            </div>
            <p class="text-xs leading-relaxed font-medium">{{ newRotatingPreview.summary }}</p>
            <p class="text-[11px] text-blue-700 dark:text-blue-300 font-mono">{{ newRotatingPreview.currentWeekDesc }}</p>
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
        <!-- 每周习惯 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>每周习惯</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {{ weeklyHabits.length }}
              </span>
            </h3>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div v-if="weeklyHabits.length === 0" class="text-center py-3 text-xs text-slate-400">
              暂无每周习惯
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

        <!-- 多周轮换循环 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>多周轮换习惯</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-medium">
                {{ rotatingHabits.length }}
              </span>
            </h3>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div v-if="rotatingHabits.length === 0" class="text-center py-3 text-xs text-slate-400">
              暂无多周轮换习惯
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="h in rotatingHabits"
                :key="h.id"
                @click="toggleRotating(h)"
                :class="[
                  'group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none',
                  isDoneToday(h.id)
                    ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                    : isHabitScheduledForDay(h, todayStr)
                    ? 'border-blue-200 dark:border-blue-800/80 bg-blue-50/20 dark:bg-blue-950/10 hover:border-blue-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <!-- 打卡按钮 -->
                  <div
                    :class="[
                      'w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0',
                      isDoneToday(h.id)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isHabitScheduledForDay(h, todayStr)
                        ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-900'
                        : 'border-dashed border-slate-300 dark:border-slate-600 bg-slate-100/60 dark:bg-slate-800/60 text-slate-400'
                    ]"
                    :title="isHabitScheduledForDay(h, todayStr) ? '今日排期执行日' : '今日休息日（点击可自律打卡）'"
                  >
                    <Check v-if="isDoneToday(h.id)" class="w-3 h-3 stroke-[3]" />
                    <span v-else-if="!isHabitScheduledForDay(h, todayStr)" class="text-[9px] leading-none">🏖️</span>
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span :class="['text-xs font-medium truncate', isDoneToday(h.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200']">
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
                      <span class="px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-medium shrink-0">
                        {{ h.cycleWeeks || 2 }}周轮换 · 第{{ getCycleWeekNumber(todayStr, h.anchorDate, h.cycleWeeks || 2) }}周
                      </span>
                    </div>

                    <div class="text-[11px] mt-0.5 flex items-center gap-2 flex-wrap">
                      <span
                        :class="[
                          'font-medium',
                          isHabitScheduledForDay(h, todayStr)
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500'
                        ]"
                      >
                        {{ isHabitScheduledForDay(h, todayStr) ? '🎯 今日排期' : '🏖️ 今日休息' }}
                      </span>
                      <span class="text-slate-400 dark:text-slate-500">
                        本周：{{ formatDaysList(getHabitScheduledDaysThisWeek(h, todayStr)) }}
                      </span>
                      <span v-if="calculateHabitStreak(h, habitLogs, todayStr).currentStreak > 0" class="text-amber-600 dark:text-amber-400 font-mono font-semibold">
                        🔥 连胜 {{ calculateHabitStreak(h, habitLogs, todayStr).currentStreak }}
                      </span>
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
              <option value="rotating">多周轮换循环周期 (高级)</option>
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

          <div v-if="editingHabit.frequency === 'weekly'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
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

          <!-- 多周轮换配置与卡片选择器 (Edit Modal) -->
          <div v-if="editingHabit.frequency === 'rotating'" class="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">轮换周期总周数</label>
                <select
                  v-model.number="editingHabit.cycleWeeks"
                  class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                >
                  <option :value="2">2 周一轮 (双周轮换)</option>
                  <option :value="3">3 周一轮 (三周循环)</option>
                  <option :value="4">4 周一轮 (四周循环)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  基准起始周（锚点日期）
                </label>
                <input
                  v-model="editingHabit.anchorDate"
                  type="date"
                  class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <!-- 各周排期卡片 -->
            <div class="space-y-2">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                各周排期设定（点击切换周一至周日执行日）
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                <div
                  v-for="w in (editingHabit.cycleWeeks || 2)"
                  :key="w"
                  :class="[
                    'p-3 rounded-xl border transition-all',
                    editRotatingPreview.currentWeek === w
                      ? 'border-blue-400 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60'
                  ]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-xs text-slate-800 dark:text-slate-200">第 {{ w }} 周</span>
                      <span
                        v-if="editRotatingPreview.currentWeek === w"
                        class="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold"
                      >
                        当前生效周
                      </span>
                    </div>

                    <div class="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        @click="setEditPatternPreset(w, 'weekdays')"
                        class="px-1.5 py-0.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        工作日
                      </button>
                      <button
                        type="button"
                        @click="setEditPatternPreset(w, 'weekend')"
                        class="px-1.5 py-0.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        周末
                      </button>
                      <button
                        type="button"
                        @click="setEditPatternPreset(w, 'clear')"
                        class="px-1.5 py-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        清空
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-7 gap-1">
                    <button
                      v-for="d in WEEKDAY_ORDER"
                      :key="d"
                      type="button"
                      @click="toggleEditPatternDay(w, d)"
                      :class="[
                        'py-1 rounded-md text-xs font-medium text-center transition-all',
                        (editingHabit.weekPatterns[w] || []).includes(d)
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      ]"
                    >
                      {{ WEEKDAY_SHORT_NAMES[d] }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 自然语言实时预览 -->
            <div class="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 space-y-1">
              <div class="flex items-center gap-1.5 font-semibold text-xs text-blue-700 dark:text-blue-300">
                <Sparkles class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>规则实时预览</span>
              </div>
              <p class="text-xs leading-relaxed font-medium">{{ editRotatingPreview.summary }}</p>
              <p class="text-[11px] text-blue-700 dark:text-blue-300 font-mono">{{ editRotatingPreview.currentWeekDesc }}</p>
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
import { ref, computed, watch } from 'vue'
import { Sparkles, Plus, X, Check, Trash2, Pencil } from 'lucide-vue-next'
import type { Habit, HabitLog, HabitFrequency, TimeSlot, TimingType, Project } from '@/types'
import { formatDate, getWeekKey, getMonday } from '@/utils/date'
import {
  WEEKDAY_ORDER,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT_NAMES,
  sortDays,
  getCycleWeekNumber,
  isHabitScheduledForDay,
  getHabitScheduledDaysThisWeek,
  getRotatingHabitNaturalDescription,
  calculateHabitStreak,
} from '@/utils/habit'
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

// 多周轮换新建状态
const newCycleWeeks = ref<number>(2)
const newAnchorDate = ref<string>(formatDate(getMonday(new Date())))
const newWeekPatterns = ref<Record<number, number[]>>({
  1: [2, 3], // 默认第1周周二、周三
  2: [3, 4], // 默认第2周周三、周四
})

watch(newCycleWeeks, (weeks) => {
  const current = { ...newWeekPatterns.value }
  for (let w = 1; w <= weeks; w++) {
    if (!current[w]) current[w] = []
  }
  for (const k of Object.keys(current)) {
    if (Number(k) > weeks) {
      delete current[Number(k)]
    }
  }
  newWeekPatterns.value = current
})

function toggleNewPatternDay(weekNum: number, day: number) {
  const current = [...(newWeekPatterns.value[weekNum] || [])]
  const idx = current.indexOf(day)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(day)
  }
  newWeekPatterns.value = {
    ...newWeekPatterns.value,
    [weekNum]: sortDays(current),
  }
}

function setNewPatternPreset(weekNum: number, preset: 'weekdays' | 'weekend' | 'clear') {
  let days: number[] = []
  if (preset === 'weekdays') days = [1, 2, 3, 4, 5]
  else if (preset === 'weekend') days = [6, 0]
  newWeekPatterns.value = {
    ...newWeekPatterns.value,
    [weekNum]: days,
  }
}

const newRotatingPreview = computed(() => {
  return getRotatingHabitNaturalDescription(
    newCycleWeeks.value,
    newWeekPatterns.value,
    newAnchorDate.value,
    todayStr.value
  )
})

// 修改习惯状态
const isEditModalOpen = ref(false)
interface EditingHabitState {
  id: string
  title: string
  projectId: string | null
  frequency: HabitFrequency
  timeSlot: TimeSlot
  timingType: TimingType
  targetCount: number
  anchorDate: string
  cycleWeeks: number
  weekPatterns: Record<number, number[]>
}

const editingHabit = ref<EditingHabitState | null>(null)

function openEditHabit(habit: Habit) {
  const isRotating = habit.frequency === 'rotating' || habit.frequency === 'biweekly'
  const cycleWeeks = habit.cycleWeeks || 2
  const initialPatterns: Record<number, number[]> = habit.weekPatterns
    ? JSON.parse(JSON.stringify(habit.weekPatterns))
    : {
        1: habit.targetDaysOfWeek ? [...habit.targetDaysOfWeek] : [2, 3],
        2: [3, 4],
      }
  for (let w = 1; w <= cycleWeeks; w++) {
    if (!initialPatterns[w]) initialPatterns[w] = []
  }

  editingHabit.value = {
    id: habit.id,
    title: habit.title,
    projectId: habit.projectId || null,
    frequency: isRotating ? 'rotating' : habit.frequency,
    timeSlot: habit.timeSlot || 'morning',
    timingType: habit.timingType || 'anytime',
    targetCount: habit.targetCount || 1,
    anchorDate: habit.anchorDate || formatDate(getMonday(new Date())),
    cycleWeeks,
    weekPatterns: initialPatterns,
  }
  isEditModalOpen.value = true
}

watch(
  () => editingHabit.value?.cycleWeeks,
  (weeks) => {
    if (!editingHabit.value || !weeks) return
    const current = { ...(editingHabit.value.weekPatterns || {}) }
    for (let w = 1; w <= weeks; w++) {
      if (!current[w]) current[w] = []
    }
    for (const k of Object.keys(current)) {
      if (Number(k) > weeks) {
        delete current[Number(k)]
      }
    }
    editingHabit.value.weekPatterns = current
  }
)

function toggleEditPatternDay(weekNum: number, day: number) {
  if (!editingHabit.value) return
  const current = [...(editingHabit.value.weekPatterns[weekNum] || [])]
  const idx = current.indexOf(day)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(day)
  }
  editingHabit.value.weekPatterns = {
    ...editingHabit.value.weekPatterns,
    [weekNum]: sortDays(current),
  }
}

function setEditPatternPreset(weekNum: number, preset: 'weekdays' | 'weekend' | 'clear') {
  if (!editingHabit.value) return
  let days: number[] = []
  if (preset === 'weekdays') days = [1, 2, 3, 4, 5]
  else if (preset === 'weekend') days = [6, 0]
  editingHabit.value.weekPatterns = {
    ...editingHabit.value.weekPatterns,
    [weekNum]: days,
  }
}

const editRotatingPreview = computed(() => {
  if (!editingHabit.value) return { summary: '', currentWeekDesc: '', isTodayScheduled: false, currentWeek: 1 }
  return getRotatingHabitNaturalDescription(
    editingHabit.value.cycleWeeks || 2,
    editingHabit.value.weekPatterns || {},
    editingHabit.value.anchorDate,
    todayStr.value
  )
})

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
    anchorDate: editingHabit.value.anchorDate,
    cycleWeeks: editingHabit.value.frequency === 'rotating' ? (editingHabit.value.cycleWeeks || 2) : undefined,
    weekPatterns: editingHabit.value.frequency === 'rotating' ? editingHabit.value.weekPatterns : undefined,
  }
  emit('save-habit', payload)
  closeEditModal()
}

function formatDaysList(days: number[]): string {
  if (!days || days.length === 0) return '无'
  return sortDays(days).map((d) => WEEKDAY_NAMES[d]).join('、')
}

const timeSlotConfigs: { key: TimeSlot; title: string }[] = [
  { key: 'morning', title: '早晨' },
  { key: 'afternoon', title: '下午' },
  { key: 'evening', title: '晚上' },
  { key: 'anytime', title: '全天' },
]

const dailyHabits = computed(() => props.habits.filter((h) => h.frequency === 'daily'))
const weeklyHabits = computed(() => props.habits.filter((h) => h.frequency === 'weekly'))
const rotatingHabits = computed(() => props.habits.filter((h) => h.frequency === 'rotating' || h.frequency === 'biweekly'))
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

function toggleRotating(habit: Habit) {
  const done = isDoneToday(habit.id)
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
    anchorDate: newFrequency.value === 'rotating' ? newAnchorDate.value : todayStr.value,
    cycleWeeks: newFrequency.value === 'rotating' ? newCycleWeeks.value : undefined,
    weekPatterns: newFrequency.value === 'rotating' ? newWeekPatterns.value : undefined,
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
