<template>
  <div class="space-y-3.5 sm:space-y-4">
    <!-- Calendar Top Control Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
      <!-- Left: Period Navigation & Today Button -->
      <div class="flex items-center justify-between sm:justify-start gap-2.5">
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700">
          <button
            @click="prevPeriod"
            class="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="上个周期"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 min-w-[130px] sm:min-w-[180px] text-center select-none truncate">
            {{ currentPeriodTitle }}
          </span>
          <button
            @click="nextPeriod"
            class="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="下个周期"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <button
          @click="goToToday"
          class="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shrink-0"
        >
          今天
        </button>
      </div>

      <!-- Right: View Mode Dropdown + Quick Navigation Buttons -->
      <div class="flex items-center justify-between md:justify-end gap-2 overflow-visible">
        <!-- View Mode Dropdown -->
        <div ref="dropdownRef" class="relative shrink-0">
          <button
            @click="toggleDropdown"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 select-none shadow-2xs"
            :aria-expanded="isDropdownOpen"
            title="选择日历视角"
          >
            <Calendar class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span class="font-semibold">{{ currentViewOption.label }}</span>
            <ChevronDown
              class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0"
              :class="isDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''"
            />
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-1"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-1"
          >
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 top-full mt-1.5 w-48 sm:w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-40 space-y-0.5"
            >
              <button
                v-for="opt in viewOptions"
                :key="opt.mode"
                @click="selectViewMode(opt.mode)"
                :class="[
                  'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors select-none text-left',
                  viewMode === opt.mode
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                ]"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="truncate">{{ opt.label }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal shrink-0">({{ opt.desc }})</span>
                </div>
                <Check v-if="viewMode === opt.mode" class="w-3.5 h-3.5 stroke-[2.5] text-blue-600 dark:text-blue-400 shrink-0 ml-1.5" />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Quick Filter Tabs -->
        <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            @click="$emit('switch-tab', 'projects')"
            class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shrink-0"
          >
            <FolderKanban class="w-3.5 h-3.5 text-blue-600" />
            <span class="hidden sm:inline">项目</span>
            <span>({{ projects.length }})</span>
          </button>

          <button
            @click="$emit('switch-tab', 'todos')"
            class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shrink-0"
          >
            <CheckSquare class="w-3.5 h-3.5 text-emerald-600" />
            <span class="hidden sm:inline">待办</span>
            <span>({{ datedTodos.length }})</span>
          </button>

          <button
            @click="$emit('switch-tab', 'habits')"
            class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shrink-0"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span class="hidden sm:inline">习惯</span>
          </button>
        </div>
      </div>
    </div>

    <!-- VIEW 1: Month View & Two-Week View (7 columns grid) -->
    <div
      v-if="viewMode === 'month' || viewMode === '2weeks'"
      class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
    >
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
          v-for="day in displayDays"
          :key="day.dateStr"
          @click="handleDayCellClick(day.dateStr)"
          :class="[
            viewMode === '2weeks' ? 'min-h-[64px] sm:min-h-[96px]' : 'min-h-[50px] sm:min-h-[68px]',
            'p-1 sm:p-2 flex flex-col transition-all duration-200 group relative cursor-pointer select-none',
            viewMode === 'month' && !day.isCurrentMonth
              ? 'bg-slate-50/60 dark:bg-slate-950/40 text-slate-400 opacity-60'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40',
            selectedMobileDate === day.dateStr ? 'ring-2 ring-blue-500 bg-blue-50/40 dark:bg-blue-950/40 z-10' : '',
            day.isToday && isTodayPulsing
              ? 'bg-blue-100/70 dark:bg-blue-900/50 ring-2 ring-blue-500 shadow-md scale-[1.01] z-10'
              : day.isToday
              ? 'bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500 ring-inset'
              : ''
          ]"
        >
          <div class="flex items-center justify-between mb-0.5 sm:mb-1">
            <div class="flex items-center gap-1 sm:gap-1.5">
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
              class="hidden sm:inline-block opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] transition-opacity"
              title="添加代办"
            >
              <Plus class="w-3 h-3" />
            </button>
          </div>

          <!-- Mobile Only: Category Dots -->
          <div class="sm:hidden flex items-center justify-center gap-1 mt-auto py-1">
            <span
              v-if="getSchedulesForDay(day.dateStr).length > 0"
              class="w-1.5 h-1.5 rounded-full bg-indigo-500"
              :title="`${getSchedulesForDay(day.dateStr).length} 个日程`"
            ></span>
            <span
              v-if="getTodosForDay(day.dateStr).length > 0"
              :class="[
                'w-1.5 h-1.5 rounded-full',
                hasIncompleteTodos(day.dateStr) ? 'bg-rose-500' : 'bg-emerald-500'
              ]"
              :title="`${getTodosForDay(day.dateStr).length} 个待办`"
            ></span>
            <span
              v-if="getHabitsForDay(day.dateStr).length > 0"
              class="w-1.5 h-1.5 rounded-full bg-amber-400"
              :title="`${getHabitsForDay(day.dateStr).length} 个习惯排期`"
            ></span>
            <span
              v-if="hasJournalOnDate(day.dateStr)"
              class="w-1.5 h-1.5 rounded-full bg-amber-500"
              title="已写随笔"
            ></span>
          </div>

          <!-- Desktop Only: Detailed Pills Container -->
          <div class="hidden sm:block flex-1 space-y-1">
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

            <!-- Habits scheduled for this day with showOnCalendar -->
            <div
              v-for="h in getHabitsForDay(day.dateStr)"
              :key="h.id"
              @click.stop="$emit('toggle-habit', { habitId: h.id, date: day.dateStr })"
              :class="[
                'px-1.5 py-0.5 sm:py-1 rounded border text-[11px] leading-tight flex items-center justify-between gap-1 select-none truncate shadow-2xs cursor-pointer transition-colors',
                isHabitDoneOnDate(h.id, day.dateStr)
                  ? 'opacity-60 line-through bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 hover:border-amber-400 text-amber-900 dark:text-amber-200'
              ]"
              :title="`习惯: ${h.title}`"
            >
              <div class="flex items-center gap-1 min-w-0 truncate">
                <button
                  type="button"
                  class="w-3 h-3 rounded flex items-center justify-center shrink-0 border transition-colors"
                  :class="[
                    isHabitDoneOnDate(h.id, day.dateStr)
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-amber-400 dark:border-amber-600 bg-white/50 dark:bg-slate-900/50'
                  ]"
                >
                  <Check v-if="isHabitDoneOnDate(h.id, day.dateStr)" class="w-2.5 h-2.5 stroke-[3]" />
                </button>
                <span class="truncate font-medium">{{ h.title }}</span>
              </div>
              <Sparkles class="w-3 h-3 text-amber-500 shrink-0" />
            </div>

            <div
              v-for="todo in getTodosForDay(day.dateStr, 5)"
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
              v-if="getExtraCount(day.dateStr, 5) > 0"
              class="text-[10px] text-slate-400 text-center font-medium"
            >
              +{{ getExtraCount(day.dateStr, 5) }} 项
            </div>
          </div>

          <div
            v-if="hasJournalOnDate(day.dateStr)"
            @click.stop="$emit('open-journal', day.dateStr)"
            class="hidden sm:flex mt-1 items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 truncate"
            title="查看此日记"
          >
            <BookOpen class="w-3 h-3 shrink-0" />
            <span class="truncate">日记</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 2: Week View (7 Days Desktop Grid / Mobile Horizontal Swipeable Cards) -->
    <div
      v-else-if="viewMode === 'week'"
      class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
    >
      <!-- Desktop Weekday Header Bar -->
      <div class="hidden sm:grid sm:grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 divide-x divide-slate-200 dark:divide-slate-800">
        <div
          v-for="day in displayDays"
          :key="day.dateStr"
          :class="[
            'px-2 flex items-center justify-center gap-1.5',
            day.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : day.isWeekend ? 'text-blue-600/80 dark:text-blue-400/80' : ''
          ]"
        >
          <span>{{ day.weekdayName }}</span>
          <span
            :class="[
              'text-xs w-5 h-5 flex items-center justify-center rounded-full',
              day.isToday ? 'bg-blue-600 text-white font-bold' : ''
            ]"
          >
            {{ day.dayNumber }}
          </span>
        </div>
      </div>

      <!-- Week Columns: Horizontal swipe cards on mobile, 7 columns on desktop -->
      <div class="flex sm:grid sm:grid-cols-7 overflow-x-auto no-scrollbar sm:divide-x divide-slate-200 dark:divide-slate-800 p-2.5 sm:p-0 gap-2.5 sm:gap-0 min-h-[460px]">
        <div
          v-for="day in displayDays"
          :key="day.dateStr"
          :class="[
            'w-[78vw] max-w-[280px] sm:w-auto shrink-0 sm:shrink flex flex-col p-2.5 sm:p-2.5 transition-colors',
            'bg-slate-50/50 sm:bg-white dark:bg-slate-800/30 sm:dark:bg-slate-900 rounded-xl sm:rounded-none border sm:border-0 border-slate-200 dark:border-slate-800',
            day.isToday ? 'ring-1 ring-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20' : ''
          ]"
        >
          <!-- Mobile Column Header -->
          <div class="sm:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div class="flex items-center gap-1.5">
              <span
                :class="[
                  'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-md',
                  day.isToday ? 'bg-blue-600 text-white' : day.isWeekend ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                ]"
              >
                {{ day.dayNumber }}
              </span>
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {{ day.weekdayName }}
              </span>
              <span v-if="day.isToday" class="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                今日
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="quickAddTodo(day.dateStr)"
                class="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="添加代办"
              >
                <Plus class="w-3.5 h-3.5" />
              </button>
              <button
                @click="$emit('open-journal', day.dateStr)"
                class="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="随笔日记"
              >
                <BookOpen class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Desktop Column Subheader with Quick Actions -->
          <div class="hidden sm:flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {{ day.date.getMonth() + 1 }}月{{ day.dayNumber }}日
            </span>
            <button
              @click.stop="quickAddTodo(day.dateStr)"
              class="opacity-60 hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-blue-600 transition-opacity"
              title="添加代办"
            >
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Column Content Sections -->
          <div class="flex-1 space-y-2.5 overflow-y-auto max-h-[560px] pr-0.5 no-scrollbar">
            <!-- Schedules -->
            <div v-if="getSchedulesForDay(day.dateStr).length > 0" class="space-y-1">
              <div class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">固定日程</div>
              <div
                v-for="s in getSchedulesForDay(day.dateStr)"
                :key="s.id"
                @click="handleOpenSchedule(s)"
                class="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 hover:border-indigo-400 text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between gap-1 cursor-pointer transition-colors shadow-2xs"
                :title="`${s.title} (${getProjectName(s.projectId)})`"
              >
                <div class="flex items-center gap-1.5 min-w-0 truncate">
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
            </div>

            <!-- Habits -->
            <div v-if="getHabitsForDay(day.dateStr).length > 0" class="space-y-1">
              <div class="text-[10px] font-semibold text-amber-600 dark:text-amber-400">打卡习惯</div>
              <div
                v-for="h in getHabitsForDay(day.dateStr)"
                :key="h.id"
                @click.stop="$emit('toggle-habit', { habitId: h.id, date: day.dateStr })"
                :class="[
                  'px-2 py-1 rounded border text-xs flex items-center justify-between gap-1 select-none cursor-pointer transition-colors shadow-2xs',
                  isHabitDoneOnDate(h.id, day.dateStr)
                    ? 'opacity-60 line-through bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 hover:border-amber-400 text-amber-900 dark:text-amber-200'
                ]"
                :title="`习惯: ${h.title}`"
              >
                <div class="flex items-center gap-1.5 min-w-0 truncate">
                  <button
                    type="button"
                    class="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-colors"
                    :class="[
                      isHabitDoneOnDate(h.id, day.dateStr)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-amber-400 dark:border-amber-600 bg-white/50 dark:bg-slate-900/50'
                    ]"
                  >
                    <Check v-if="isHabitDoneOnDate(h.id, day.dateStr)" class="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                  <span class="truncate font-medium">{{ h.title }}</span>
                </div>
                <Sparkles class="w-3 h-3 text-amber-500 shrink-0" />
              </div>
            </div>

            <!-- Todos -->
            <div v-if="getTodosForDay(day.dateStr).length > 0" class="space-y-1">
              <div class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">待办事项</div>
              <div
                v-for="todo in getTodosForDay(day.dateStr)"
                :key="todo.id"
                @click.stop="$emit('open-todo', todo)"
                :class="[
                  'px-2 py-1 rounded border text-xs transition-all cursor-pointer select-none flex items-center justify-between gap-1 shadow-2xs',
                  todo.completed
                    ? 'opacity-50 line-through bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
                    : todo.importance && todo.importance >= 8
                    ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                ]"
                :title="`${todo.title} (${getProjectName(todo.projectId)})`"
              >
                <div class="flex items-center gap-1.5 min-w-0 truncate">
                  <button
                    @click.stop="$emit('toggle-todo', todo.id)"
                    class="w-3.5 h-3.5 rounded border border-slate-400 flex items-center justify-center shrink-0 hover:bg-slate-200"
                  >
                    <Check v-if="todo.completed" class="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                  <span class="truncate font-medium">{{ todo.title }}</span>
                </div>
                <span
                  v-if="todo.dueDate === day.dateStr"
                  class="text-[9px] px-1 rounded bg-white/80 dark:bg-slate-700 font-bold shrink-0 text-blue-600"
                >
                  截止
                </span>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-if="getSchedulesForDay(day.dateStr).length === 0 && getHabitsForDay(day.dateStr).length === 0 && getTodosForDay(day.dateStr).length === 0"
              class="py-8 text-center text-slate-300 dark:text-slate-600 text-xs"
            >
              暂无事项
            </div>
          </div>

          <!-- Journal footer link -->
          <div
            v-if="hasJournalOnDate(day.dateStr)"
            @click.stop="$emit('open-journal', day.dateStr)"
            class="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer truncate"
          >
            <BookOpen class="w-3 h-3 shrink-0" />
            <span class="truncate">已写随笔</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 3: Day / 2-Days / 3-Days Multi-Column Executive Boards -->
    <div
      v-else
      :class="[
        viewMode === 'day' ? 'grid grid-cols-1 max-w-3xl mx-auto' :
        viewMode === '2days' ? 'grid grid-cols-1 md:grid-cols-2 gap-3.5' :
        'flex sm:grid sm:grid-cols-3 overflow-x-auto no-scrollbar snap-x gap-3 pb-2 sm:pb-0'
      ]"
    >
      <div
        v-for="day in displayDays"
        :key="day.dateStr"
        :class="[
          viewMode === '3days' ? 'w-[84vw] sm:w-auto shrink-0 snap-start' : 'w-full',
          'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-2xs'
        ]"
      >
        <!-- Day Card Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <span
              :class="[
                'text-base font-bold px-2 py-0.5 rounded-lg flex items-center justify-center',
                day.isToday
                  ? 'bg-blue-600 text-white'
                  : day.isWeekend
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
              ]"
            >
              {{ day.dayNumber }}
            </span>
            <div>
              <div class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{{ day.weekdayName }}</span>
                <span v-if="day.isToday" class="text-xs font-medium text-blue-600 dark:text-blue-400">
                  (今日)
                </span>
              </div>
              <div class="text-xs text-slate-400 font-mono">
                {{ day.dateStr }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              @click="quickAddTodo(day.dateStr)"
              class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 active:scale-95 transition-all"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>加待办</span>
            </button>
            <button
              @click="$emit('open-journal', day.dateStr)"
              class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 active:scale-95 transition-all"
            >
              <BookOpen class="w-3.5 h-3.5" />
              <span>{{ hasJournalOnDate(day.dateStr) ? '随笔' : '记随笔' }}</span>
            </button>
          </div>
        </div>

        <!-- Day Card Sections -->
        <div class="space-y-4">
          <!-- 固定日程 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div class="flex items-center gap-1.5">
                <CalendarDays class="w-3.5 h-3.5 text-indigo-600" />
                <span>固定日程 ({{ getSchedulesForDay(day.dateStr).length }})</span>
              </div>
            </div>

            <div v-if="getSchedulesForDay(day.dateStr).length > 0" class="space-y-1.5">
              <div
                v-for="s in getSchedulesForDay(day.dateStr)"
                :key="s.id"
                @click="handleOpenSchedule(s)"
                class="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 text-xs hover:border-indigo-400 active:scale-[0.99] cursor-pointer transition-all"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span v-if="s.time" class="font-mono font-semibold text-indigo-700 dark:text-indigo-300 text-xs shrink-0">{{ s.time }}</span>
                  <span class="font-medium text-slate-800 dark:text-slate-100 truncate">{{ s.title }}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[11px] text-slate-400">{{ getProjectName(s.projectId) }}</span>
                  <span
                    v-if="getProjectColor(s.projectId)"
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: getProjectColor(s.projectId) }"
                  ></span>
                </div>
              </div>
            </div>
            <div v-else class="text-xs text-slate-400 py-1.5 pl-1">
              暂无固定日程
            </div>
          </div>

          <!-- 打卡习惯 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div class="flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 text-amber-500" />
                <span>打卡习惯 ({{ getHabitsForDay(day.dateStr).length }})</span>
              </div>
            </div>

            <div v-if="getHabitsForDay(day.dateStr).length > 0" class="space-y-1.5">
              <div
                v-for="h in getHabitsForDay(day.dateStr)"
                :key="h.id"
                @click="$emit('toggle-habit', { habitId: h.id, date: day.dateStr })"
                :class="[
                  'flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all active:scale-[0.99]',
                  isHabitDoneOnDate(h.id, day.dateStr)
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                ]"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                    :class="[
                      isHabitDoneOnDate(h.id, day.dateStr)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-amber-400 dark:border-amber-600'
                    ]"
                  >
                    <Check v-if="isHabitDoneOnDate(h.id, day.dateStr)" class="w-3 h-3 stroke-[3]" />
                  </button>
                  <span :class="['font-medium truncate', isHabitDoneOnDate(h.id, day.dateStr) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100']">
                    {{ h.title }}
                  </span>
                </div>
                <span
                  :class="[
                    'text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0',
                    isHabitDoneOnDate(h.id, day.dateStr)
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  ]"
                >
                  {{ isHabitDoneOnDate(h.id, day.dateStr) ? '已打卡' : '打卡' }}
                </span>
              </div>
            </div>
            <div v-else class="text-xs text-slate-400 py-1.5 pl-1">
              暂无习惯排期
            </div>
          </div>

          <!-- 待办事项 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div class="flex items-center gap-1.5">
                <CheckSquare class="w-3.5 h-3.5 text-emerald-600" />
                <span>待办事项 ({{ getTodosForDay(day.dateStr).length }})</span>
              </div>
            </div>

            <div v-if="getTodosForDay(day.dateStr).length > 0" class="space-y-1.5">
              <div
                v-for="todo in getTodosForDay(day.dateStr)"
                :key="todo.id"
                @click="$emit('open-todo', todo)"
                :class="[
                  'flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer active:scale-[0.99] transition-all',
                  todo.completed
                    ? 'opacity-60 line-through bg-slate-50 dark:bg-slate-800/40 border-slate-200 text-slate-500'
                    : todo.importance && todo.importance >= 8
                    ? 'bg-rose-50/60 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                ]"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <button
                    @click.stop="$emit('toggle-todo', todo.id)"
                    class="w-4 h-4 rounded border border-slate-400 flex items-center justify-center shrink-0 hover:bg-slate-200"
                  >
                    <Check v-if="todo.completed" class="w-3 h-3 stroke-[3]" />
                  </button>
                  <span class="font-medium truncate">{{ todo.title }}</span>
                  <span
                    v-if="todo.importance"
                    :class="['text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0', getPriorityStyle(todo.importance).badgeClass]"
                  >
                    P{{ todo.importance }}
                  </span>
                </div>
                <span
                  v-if="todo.dueDate === day.dateStr"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold shrink-0"
                >
                  截止
                </span>
              </div>
            </div>
            <div v-else class="text-xs text-slate-400 py-1.5 pl-1">
              暂无待办事项
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Only: Selected Day Agenda Details Card (Active in Month and 2Weeks views) -->
    <div
      v-if="(viewMode === 'month' || viewMode === '2weeks') && selectedMobileDate"
      class="sm:hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 shadow-xs"
    >
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-blue-600" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">
            {{ formatDisplayDate(selectedMobileDate) }}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            @click="quickAddTodo(selectedMobileDate)"
            class="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] font-medium active:scale-95"
          >
            <Plus class="w-3 h-3" />
            <span>加待办</span>
          </button>

          <button
            @click="$emit('open-journal', selectedMobileDate)"
            class="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[11px] font-medium active:scale-95"
          >
            <BookOpen class="w-3 h-3" />
            <span>{{ hasJournalOnDate(selectedMobileDate) ? '读随笔' : '写随笔' }}</span>
          </button>
        </div>
      </div>

      <!-- Schedules List -->
      <div v-if="getSchedulesForDay(selectedMobileDate).length > 0" class="space-y-1.5">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">固定日程</div>
        <div
          v-for="s in getSchedulesForDay(selectedMobileDate)"
          :key="s.id"
          @click="handleOpenSchedule(s)"
          class="flex items-center justify-between p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 text-xs active:bg-indigo-100 transition-colors"
        >
          <div class="flex items-center gap-2 min-w-0">
            <CalendarDays class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span v-if="s.time" class="font-mono font-semibold text-indigo-700 dark:text-indigo-300 text-[11px] shrink-0">{{ s.time }}</span>
            <span class="font-medium text-slate-800 dark:text-slate-100 truncate">{{ s.title }}</span>
          </div>
          <span
            v-if="getProjectColor(s.projectId)"
            class="w-2 h-2 rounded-full shrink-0"
            :style="{ backgroundColor: getProjectColor(s.projectId) }"
          ></span>
        </div>
      </div>

      <!-- Todos List -->
      <div v-if="getTodosForDay(selectedMobileDate).length > 0" class="space-y-1.5">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">截止待办</div>
        <div
          v-for="todo in getTodosForDay(selectedMobileDate)"
          :key="todo.id"
          @click="$emit('open-todo', todo)"
          :class="[
            'flex items-center justify-between p-2 rounded-lg border text-xs active:bg-slate-100 dark:active:bg-slate-800 transition-colors',
            todo.completed
              ? 'opacity-60 line-through bg-slate-50 dark:bg-slate-800/40 border-slate-200 text-slate-500'
              : todo.importance && todo.importance >= 8
              ? 'bg-rose-50/60 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
          ]"
        >
          <div class="flex items-center gap-2 min-w-0">
            <button
              @click.stop="$emit('toggle-todo', todo.id)"
              class="w-4 h-4 rounded border border-slate-400 flex items-center justify-center shrink-0"
            >
              <Check v-if="todo.completed" class="w-3 h-3 stroke-[3]" />
            </button>
            <span class="font-medium truncate">{{ todo.title }}</span>
            <span
              v-if="todo.importance"
              :class="['text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0', getPriorityStyle(todo.importance).badgeClass]"
            >
              P{{ todo.importance }}
            </span>
          </div>
          <span
            v-if="todo.dueDate === selectedMobileDate"
            class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold shrink-0"
          >
            截止
          </span>
        </div>
      </div>

      <!-- Habits List -->
      <div v-if="getHabitsForDay(selectedMobileDate).length > 0" class="space-y-1.5">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">打卡习惯</div>
        <div
          v-for="h in getHabitsForDay(selectedMobileDate)"
          :key="h.id"
          @click="$emit('toggle-habit', { habitId: h.id, date: selectedMobileDate })"
          :class="[
            'flex items-center justify-between p-2 rounded-lg border text-xs active:bg-amber-100 dark:active:bg-amber-950/50 transition-colors cursor-pointer',
            isHabitDoneOnDate(h.id, selectedMobileDate)
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
          ]"
        >
          <div class="flex items-center gap-2 min-w-0">
            <button
              type="button"
              class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
              :class="[
                isHabitDoneOnDate(h.id, selectedMobileDate)
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-amber-400 dark:border-amber-600'
              ]"
            >
              <Check v-if="isHabitDoneOnDate(h.id, selectedMobileDate)" class="w-3 h-3 stroke-[3]" />
            </button>
            <span :class="['font-medium truncate', isHabitDoneOnDate(h.id, selectedMobileDate) ? 'line-through text-slate-400' : '']">
              {{ h.title }}
            </span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 font-medium">
            习惯
          </span>
        </div>
      </div>

      <div
        v-if="getSchedulesForDay(selectedMobileDate).length === 0 && getTodosForDay(selectedMobileDate).length === 0 && getHabitsForDay(selectedMobileDate).length === 0"
        class="py-3 text-center text-xs text-slate-400"
      >
        <span>本日暂无固定日程、截止待办或习惯排期</span>
      </div>
    </div>

    <!-- Schedule Details Modal: Center on desktop, Bottom Sheet on mobile -->
    <div
      v-if="selectedSchedule"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      @click.self="selectedSchedule = null"
    >
      <div class="w-full sm:max-w-sm bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-xl p-5 space-y-4 shadow-xl pb-safe">
        <div class="sm:hidden w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2"></div>

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <CalendarDays class="w-4 h-4 text-indigo-600" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">日程详情</h3>
          </div>
          <button @click="selectedSchedule = null" class="p-1 rounded-md text-slate-400 hover:text-slate-600">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Plus,
  BookOpen,
  CalendarDays,
  Calendar,
  Check,
  X,
  Trash2,
} from 'lucide-vue-next'
import type { TodoItem, JournalEntry, ScheduleItem, Project, Habit, HabitLog, CalendarViewMode } from '@/types'
import {
  getViewDays,
  formatPeriodTitle,
  addDays,
  parseDate,
  isDateInRange,
  formatDate,
  formatDisplayDate,
} from '@/utils/date'
import { getPriorityStyle } from '@/utils/priority'
import { isHabitScheduledForDay } from '@/utils/habit'

const props = defineProps<{
  todos: TodoItem[]
  schedules: ScheduleItem[]
  projects: Project[]
  journals: JournalEntry[]
  habits?: Habit[]
  habitLogs?: HabitLog[]
}>()

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void
  (e: 'open-todo', todo: TodoItem): void
  (e: 'quick-create-todo', date: string): void
  (e: 'open-journal', date: string): void
  (e: 'toggle-todo', id: string): void
  (e: 'delete-schedule', id: string): void
  (e: 'toggle-habit', payload: { habitId: string; date: string }): void
}>()

const VIEW_STORAGE_KEY = 'akasha_calendar_view_mode'

interface ViewOption {
  mode: CalendarViewMode
  label: string
  desc: string
}

const viewOptions: ViewOption[] = [
  { mode: 'day', label: '单日视图', desc: '1天' },
  { mode: '2days', label: '双日聚焦', desc: '2天' },
  { mode: '3days', label: '三日看板', desc: '3天' },
  { mode: 'week', label: '周视图', desc: '7天自然周' },
  { mode: '2weeks', label: '两周中程', desc: '14天' },
  { mode: 'month', label: '月历全景', desc: '完整月份' },
]

function getInitialViewMode(): CalendarViewMode {
  if (typeof window === 'undefined') return 'month'
  const saved = localStorage.getItem(VIEW_STORAGE_KEY) as CalendarViewMode
  const valid: CalendarViewMode[] = ['day', '2days', '3days', 'week', '2weeks', 'month']
  return valid.includes(saved) ? saved : 'month'
}

const viewMode = ref<CalendarViewMode>(getInitialViewMode())

const currentViewOption = computed(() => {
  return viewOptions.find((o) => o.mode === viewMode.value) || viewOptions[5]
})

const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function selectViewMode(mode: CalendarViewMode) {
  setViewMode(mode)
  isDropdownOpen.value = false
}

function setViewMode(mode: CalendarViewMode) {
  viewMode.value = mode
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode)
  } catch {
    // ignore
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
})

const today = new Date()
const currentBaseDate = ref<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
const isTodayPulsing = ref(false)
const selectedSchedule = ref<ScheduleItem | null>(null)
const selectedMobileDate = ref(formatDate(today))

const currentPeriodTitle = computed(() => {
  return formatPeriodTitle(viewMode.value, currentBaseDate.value)
})

const displayDays = computed(() => {
  return getViewDays(viewMode.value, currentBaseDate.value)
})

function prevPeriod() {
  const d = new Date(currentBaseDate.value)
  if (viewMode.value === 'day') {
    currentBaseDate.value = addDays(d, -1)
  } else if (viewMode.value === '2days') {
    currentBaseDate.value = addDays(d, -2)
  } else if (viewMode.value === '3days') {
    currentBaseDate.value = addDays(d, -3)
  } else if (viewMode.value === 'week') {
    currentBaseDate.value = addDays(d, -7)
  } else if (viewMode.value === '2weeks') {
    currentBaseDate.value = addDays(d, -14)
  } else if (viewMode.value === 'month') {
    d.setMonth(d.getMonth() - 1)
    currentBaseDate.value = d
  }
  selectedMobileDate.value = formatDate(currentBaseDate.value)
}

function nextPeriod() {
  const d = new Date(currentBaseDate.value)
  if (viewMode.value === 'day') {
    currentBaseDate.value = addDays(d, 1)
  } else if (viewMode.value === '2days') {
    currentBaseDate.value = addDays(d, 2)
  } else if (viewMode.value === '3days') {
    currentBaseDate.value = addDays(d, 3)
  } else if (viewMode.value === 'week') {
    currentBaseDate.value = addDays(d, 7)
  } else if (viewMode.value === '2weeks') {
    currentBaseDate.value = addDays(d, 14)
  } else if (viewMode.value === 'month') {
    d.setMonth(d.getMonth() + 1)
    currentBaseDate.value = d
  }
  selectedMobileDate.value = formatDate(currentBaseDate.value)
}

function goToToday() {
  const now = new Date()
  currentBaseDate.value = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  selectedMobileDate.value = formatDate(now)
  isTodayPulsing.value = true
  setTimeout(() => {
    isTodayPulsing.value = false
  }, 1600)
}

function handleDayCellClick(dateStr: string) {
  selectedMobileDate.value = dateStr
  currentBaseDate.value = parseDate(dateStr)
  if (typeof window !== 'undefined' && window.innerWidth >= 640) {
    emit('open-journal', dateStr)
  }
}

function getHabitsForDay(dateStr: string): Habit[] {
  if (!props.habits) return []
  return props.habits.filter((h) => {
    if (!h.showOnCalendar) return false
    return isHabitScheduledForDay(h, dateStr)
  })
}

function isHabitDoneOnDate(habitId: string, dateStr: string): boolean {
  if (!props.habitLogs) return false
  return props.habitLogs.some((l) => l.habitId === habitId && l.date === dateStr && l.completed)
}

function hasIncompleteTodos(dateStr: string): boolean {
  return getTodosForDay(dateStr).some((t) => !t.completed)
}

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
  } else if (s.recurringType === 'monthly' && s.recurringDayOfWeek !== undefined) {
    timing = `每月${s.recurringDayOfMonth}号`
  } else if (s.date) {
    timing = s.date
  }
  if (s.time) {
    timing += ` ${s.time}`
  }
  return timing || '无固定时间'
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

function getTodosForDay(dateStr: string, limit?: number): TodoItem[] {
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

  return typeof limit === 'number' ? list.slice(0, limit) : list
}

function getExtraCount(dateStr: string, limit = 5): number {
  const totalTodos = datedTodos.value.filter((t) => {
    if (t.startDate && t.dueDate) {
      return isDateInRange(dateStr, t.startDate, t.dueDate)
    }
    return t.dueDate === dateStr || t.startDate === dateStr
  }).length

  return Math.max(0, totalTodos - limit)
}

function hasJournalOnDate(dateStr: string): boolean {
  return props.journals.some((j) => j.date === dateStr && !!j.content)
}

function quickAddTodo(dateStr: string) {
  emit('quick-create-todo', dateStr)
}
</script>
