<template>
  <div class="space-y-2.5 sm:space-y-3">
    <!-- Calendar Top Control Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs shrink-0">
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

        <!-- 条目类型过滤小工具 -->
        <div class="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 select-none shrink-0">
          <!-- 日程过滤 -->
          <button
            @click="toggleTypeFilter('schedules')"
            class="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
            :class="[
              typeFilters.schedules
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 line-through opacity-60'
            ]"
            :title="typeFilters.schedules ? '点击隐藏固定日程' : '点击显示固定日程'"
          >
            <CalendarDays class="w-3.5 h-3.5" :class="typeFilters.schedules ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'" />
            <span class="hidden sm:inline">日程</span>
            <span v-if="schedules.length > 0" class="text-[10px] opacity-75 font-mono">({{ schedules.length }})</span>
          </button>

          <!-- 待办过滤 -->
          <button
            @click="toggleTypeFilter('todos')"
            class="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
            :class="[
              typeFilters.todos
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 line-through opacity-60'
            ]"
            :title="typeFilters.todos ? '点击隐藏待办事项' : '点击显示待办事项'"
          >
            <CheckSquare class="w-3.5 h-3.5" :class="typeFilters.todos ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'" />
            <span class="hidden sm:inline">待办</span>
            <span v-if="datedTodos.length > 0" class="text-[10px] opacity-75 font-mono">({{ datedTodos.length }})</span>
          </button>

          <!-- 习惯过滤 -->
          <button
            @click="toggleTypeFilter('habits')"
            class="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
            :class="[
              typeFilters.habits
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-2xs font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 line-through opacity-60'
            ]"
            :title="typeFilters.habits ? '点击隐藏习惯打卡' : '点击显示习惯打卡'"
          >
            <Sparkles class="w-3.5 h-3.5" :class="typeFilters.habits ? 'text-amber-500' : 'text-slate-400'" />
            <span class="hidden sm:inline">习惯</span>
          </button>
        </div>
      </div>
    </div>

    <!-- VIEW 1: Month View & Two-Week View (7 columns grid) -->
    <div
      v-if="viewMode === 'month' || viewMode === '2weeks'"
      class="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
    >
      <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-1.5 sm:py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
        <div>周一</div>
        <div>周二</div>
        <div>周三</div>
        <div>周四</div>
        <div>周五</div>
        <div class="text-blue-600 dark:text-blue-400">周六</div>
        <div class="text-blue-600 dark:text-blue-400">周日</div>
      </div>

      <div
        class="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-800"
      >
        <div
          v-for="day in displayDays"
          :key="day.dateStr"
          @click="handleDayCellClick(day.dateStr)"
          :class="[
            'p-1 sm:p-1.5 flex flex-col justify-start transition-all duration-150 group relative cursor-pointer select-none overflow-hidden',
            viewMode === '2weeks'
              ? 'min-h-[60px] sm:min-h-[130px]'
              : (monthRowCount === 6 ? 'min-h-[46px] sm:min-h-[82px]' : 'min-h-[46px] sm:min-h-[90px]'),
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
          <div class="flex items-center justify-between mb-0.5 sm:mb-1 shrink-0">
            <div class="flex items-center gap-1 sm:gap-1.5">
              <span
                :class="[
                  'text-xs font-semibold w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center rounded-md',
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
              <BookOpen
                v-if="hasJournalOnDate(day.dateStr)"
                @click.stop="$emit('open-journal', day.dateStr)"
                class="w-3 h-3 text-amber-500 hover:text-amber-600 cursor-pointer hidden sm:inline transition-colors"
                title="查看当日随笔"
              />
            </div>

            <button
              @click.stop="quickAddTodo(day.dateStr)"
              class="hidden sm:inline-block opacity-0 group-hover:opacity-100 p-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] transition-opacity"
              title="添加待办"
            >
              <Plus class="w-3 h-3" />
            </button>
          </div>

          <!-- Mobile Only: Category Dots -->
          <div class="sm:hidden flex items-center justify-center gap-1 mt-auto py-1">
            <span
              v-if="typeFilters.schedules && getSchedulesForDay(day.dateStr).length > 0"
              class="w-1.5 h-1.5 rounded-full bg-indigo-500"
              :title="`${getSchedulesForDay(day.dateStr).length} 个日程`"
            ></span>
            <span
              v-if="typeFilters.todos && getTodosForDay(day.dateStr).length > 0"
              :class="[
                'w-1.5 h-1.5 rounded-full',
                hasIncompleteTodos(day.dateStr) ? 'bg-rose-500' : 'bg-emerald-500'
              ]"
              :title="`${getTodosForDay(day.dateStr).length} 个待办`"
            ></span>
            <span
              v-if="typeFilters.habits && getHabitsForDay(day.dateStr).length > 0"
              class="w-1.5 h-1.5 rounded-full bg-amber-400"
              :title="`${getHabitsForDay(day.dateStr).length} 个习惯排期`"
            ></span>
            <span
              v-if="hasJournalOnDate(day.dateStr)"
              class="w-1.5 h-1.5 rounded-full bg-amber-500"
              title="已写随笔"
            ></span>
          </div>

          <!-- Desktop Only: Detailed Pills (Capped at 3 items, delicate space-y-0.5 sm:space-y-1) -->
          <div class="hidden sm:flex flex-col space-y-0.5 sm:space-y-1">
            <template v-for="item in getDayCellItems(day.dateStr).visible" :key="item.type + item.id">
              <!-- Schedule Pill -->
              <div
                v-if="item.type === 'schedule'"
                @click.stop="handleOpenSchedule(item.data)"
                class="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 hover:border-indigo-400 dark:hover:border-indigo-600 text-indigo-900 dark:text-indigo-200 text-[11px] leading-tight flex items-center justify-between gap-1 select-none truncate shadow-2xs cursor-pointer transition-colors"
                :title="`${item.title} (${getProjectName(item.data.projectId)})`"
              >
                <div class="flex items-center gap-1 min-w-0 truncate">
                  <CalendarDays class="w-3 h-3 text-indigo-600 shrink-0" />
                  <span v-if="item.data.time" class="font-mono text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">{{ item.data.time }}</span>
                  <span class="truncate font-medium">{{ item.title }}</span>
                </div>
                <span
                  v-if="getProjectColor(item.data.projectId)"
                  class="w-1.5 h-1.5 rounded-full shrink-0"
                  :style="{ backgroundColor: getProjectColor(item.data.projectId) }"
                ></span>
              </div>

              <!-- Habit Pill -->
              <div
                v-else-if="item.type === 'habit'"
                @click.stop="$emit('toggle-habit', { habitId: item.id, date: day.dateStr })"
                :class="[
                  'px-1.5 py-0.5 rounded border text-[11px] leading-tight flex items-center justify-between gap-1 select-none truncate shadow-2xs cursor-pointer transition-colors',
                  isHabitDoneOnDate(item.id, day.dateStr)
                    ? 'opacity-60 line-through bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 hover:border-amber-400 text-amber-900 dark:text-amber-200'
                ]"
                :title="`习惯: ${item.title}`"
              >
                <div class="flex items-center gap-1 min-w-0 truncate">
                  <button
                    type="button"
                    class="w-3 h-3 rounded flex items-center justify-center shrink-0 border transition-colors"
                    :class="[
                      isHabitDoneOnDate(item.id, day.dateStr)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-amber-400 dark:border-amber-600 bg-white/50 dark:bg-slate-900/50'
                    ]"
                  >
                    <Check v-if="isHabitDoneOnDate(item.id, day.dateStr)" class="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                  <span class="truncate font-medium">{{ item.title }}</span>
                </div>
                <Sparkles class="w-3 h-3 text-amber-500 shrink-0" />
              </div>

              <!-- Todo Pill -->
              <div
                v-else-if="item.type === 'todo'"
                @click.stop="$emit('open-todo', item.data)"
                :class="[
                  'px-1.5 py-0.5 rounded border text-[11px] leading-tight transition-all cursor-pointer select-none truncate flex items-center justify-between gap-1',
                  item.completed
                    ? 'opacity-50 line-through bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
                    : item.importance && item.importance >= 8
                    ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                ]"
                :title="`${item.title} (${getProjectName(item.data.projectId)})`"
              >
                <div class="flex items-center gap-1 min-w-0 truncate">
                  <button
                    @click.stop="$emit('toggle-todo', item.id)"
                    class="w-3 h-3 rounded border border-slate-400 flex items-center justify-center shrink-0 hover:bg-slate-200"
                  >
                    <Check v-if="item.completed" class="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                  <span class="truncate font-medium">{{ item.title }}</span>
                </div>
                <span
                  v-if="item.data.dueDate === day.dateStr"
                  class="text-[9px] px-1 rounded bg-white/80 dark:bg-slate-700 font-bold shrink-0"
                >
                  截止
                </span>
              </div>
            </template>

            <!-- Folding +N badge -->
            <button
              v-if="getDayCellItems(day.dateStr).extraCount > 0"
              @click.stop="openDayOverview(day.dateStr)"
              class="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-0.5 text-center hover:underline cursor-pointer select-none"
              title="查看本日全部条目"
            >
              +{{ getDayCellItems(day.dateStr).extraCount }} 项
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 2: Week View (7 Days Desktop Grid / Mobile Horizontal Swipeable Cards) -->
    <div
      v-else-if="viewMode === 'week'"
      class="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs min-h-[480px] sm:min-h-[580px] lg:min-h-[calc(100vh-14rem)]"
    >
      <!-- Desktop Weekday Header Bar -->
      <div class="hidden sm:grid sm:grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 divide-x divide-slate-200 dark:divide-slate-800 shrink-0">
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
      <div class="flex-1 flex sm:grid sm:grid-cols-7 overflow-x-auto no-scrollbar sm:divide-x divide-slate-200 dark:divide-slate-800 p-2.5 sm:p-0 gap-2.5 sm:gap-0 min-h-0">
        <div
          v-for="day in displayDays"
          :key="day.dateStr"
          :class="[
            'w-[78vw] max-w-[280px] sm:w-auto shrink-0 sm:shrink flex flex-col h-full p-2.5 transition-colors overflow-hidden',
            'bg-slate-50/50 sm:bg-white dark:bg-slate-800/30 sm:dark:bg-slate-900 rounded-xl sm:rounded-none border sm:border-0 border-slate-200 dark:border-slate-800',
            day.isToday ? 'ring-1 ring-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20' : ''
          ]"
        >
          <!-- Mobile Column Header -->
          <div class="sm:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
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
          <div class="hidden sm:flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-slate-800 shrink-0">
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
          <div class="flex-1 space-y-2.5 overflow-y-auto min-h-0 pr-0.5 no-scrollbar">
            <!-- Schedules -->
            <div v-if="typeFilters.schedules && getSchedulesForDay(day.dateStr).length > 0" class="space-y-1">
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
            <div v-if="typeFilters.habits && getHabitsForDay(day.dateStr).length > 0" class="space-y-1">
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
            <div v-if="typeFilters.todos && getTodosForDay(day.dateStr).length > 0" class="space-y-1">
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
            class="mt-auto pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer truncate shrink-0"
          >
            <BookOpen class="w-3 h-3 shrink-0" />
            <span class="truncate">已写随笔</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 3: Single Day Dedicated Vertical Timeline -->
    <div
      v-else-if="viewMode === 'day'"
      class="flex-1 min-h-0 max-w-4xl mx-auto w-full space-y-4 pb-6"
    >
      <template v-if="displayDays.length > 0">
        <!-- Day Card: All-day & Overview -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xs space-y-4">
          <!-- Day Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'text-lg font-bold w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs',
                  displayDays[0].isToday
                    ? 'bg-blue-600 text-white'
                    : displayDays[0].isWeekend
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                ]"
              >
                {{ displayDays[0].dayNumber }}
              </span>
              <div>
                <div class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{{ displayDays[0].weekdayName }}</span>
                  <span
                    v-if="displayDays[0].isToday"
                    class="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    今日聚焦
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">
                  {{ displayDays[0].dateStr }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="quickAddTodo(displayDays[0].dateStr)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>新建待办</span>
              </button>
              <button
                @click="$emit('open-journal', displayDays[0].dateStr)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <BookOpen class="w-3.5 h-3.5" />
                <span>{{ hasJournalOnDate(displayDays[0].dateStr) ? '随笔' : '记随笔' }}</span>
              </button>
            </div>
          </div>

          <!-- Metrics Overview Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <!-- 待办完成率 -->
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div class="space-y-0.5 min-w-0">
                <div class="text-[11px] text-slate-400 font-medium">当日待办事项</div>
                <div class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{{ getDayTodosCompleted(displayDays[0].dateStr) }}/{{ getTodosForDay(displayDays[0].dateStr).length }}</span>
                  <span class="text-[11px] text-slate-400 font-normal">({{ getDayTodosRate(displayDays[0].dateStr) }}%)</span>
                </div>
              </div>
              <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckSquare class="w-4 h-4" />
              </div>
            </div>

            <!-- 习惯打卡 -->
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div class="space-y-0.5 min-w-0">
                <div class="text-[11px] text-slate-400 font-medium">打卡习惯</div>
                <div class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{{ getDayHabitsCompleted(displayDays[0].dateStr) }}/{{ getHabitsForDay(displayDays[0].dateStr).length }}</span>
                  <span class="text-[11px] text-slate-400 font-normal">已打卡</span>
                </div>
              </div>
              <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles class="w-4 h-4" />
              </div>
            </div>

            <!-- 固定日程 -->
            <div class="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div class="space-y-0.5 min-w-0">
                <div class="text-[11px] text-slate-400 font-medium">固定日程排期</div>
                <div class="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {{ getSchedulesForDay(displayDays[0].dateStr).length }} 个事项
                </div>
              </div>
              <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <CalendarDays class="w-4 h-4" />
              </div>
            </div>
          </div>

          <!-- 当日随笔卡片 -->
          <div
            v-if="getJournalForDay(displayDays[0].dateStr)"
            @click="$emit('open-journal', displayDays[0].dateStr)"
            class="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 transition-all cursor-pointer space-y-1.5 group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <BookOpen class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span class="text-xs font-bold text-amber-900 dark:text-amber-200">当日随笔心得</span>
                <span v-if="getJournalForDay(displayDays[0].dateStr)?.mood" class="text-xs">
                  {{ getJournalForDay(displayDays[0].dateStr)?.mood }}
                </span>
              </div>
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium group-hover:underline flex items-center gap-0.5">
                编辑随笔
                <ChevronRight class="w-3 h-3" />
              </span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {{ getJournalForDay(displayDays[0].dateStr)?.content }}
            </p>
            <div v-if="getJournalForDay(displayDays[0].dateStr)?.tags?.length" class="flex flex-wrap gap-1 pt-0.5">
              <span
                v-for="tag in getJournalForDay(displayDays[0].dateStr)?.tags"
                :key="tag"
                class="text-[10px] px-1.5 py-0.2 rounded bg-amber-100/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-mono"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
          <div
            v-else
            @click="$emit('open-journal', displayDays[0].dateStr)"
            class="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/60 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-300">
              <BookOpen class="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
              <span>记录今日复盘心得、灵感或生活随笔...</span>
            </div>
            <span class="text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-0.5 shrink-0">
              + 记随笔
            </span>
          </div>

          <!-- 全天待办事项列表 -->
          <div v-if="typeFilters.todos" class="space-y-2 pt-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <CheckSquare class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                  全天待办事项 ({{ getTodosForDay(displayDays[0].dateStr).length }})
                </span>
              </div>
              <button
                @click="quickAddTodo(displayDays[0].dateStr)"
                class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>快速添加</span>
              </button>
            </div>

            <div v-if="getTodosForDay(displayDays[0].dateStr).length > 0" class="space-y-1.5">
              <div
                v-for="todo in getTodosForDay(displayDays[0].dateStr)"
                :key="todo.id"
                @click="$emit('open-todo', todo)"
                :class="[
                  'flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer active:scale-[0.99] transition-all',
                  todo.completed
                    ? 'opacity-60 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                    : todo.importance && todo.importance >= 8
                    ? 'bg-rose-50/60 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    @click.stop="$emit('toggle-todo', todo.id)"
                    class="w-4 h-4 rounded border border-slate-400 dark:border-slate-600 flex items-center justify-center shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    :class="todo.completed ? 'bg-emerald-600 border-emerald-600 text-white' : ''"
                  >
                    <Check v-if="todo.completed" class="w-3 h-3 stroke-[3]" />
                  </button>
                  <span :class="['font-medium truncate', todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100']">
                    {{ todo.title }}
                  </span>
                  <span
                    v-if="todo.importance"
                    :class="['text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0', getPriorityStyle(todo.importance).badgeClass]"
                  >
                    {{ getPriorityStyle(todo.importance).shortLabel ? `P${todo.importance} · ${getPriorityStyle(todo.importance).shortLabel}` : `P${todo.importance}` }}
                  </span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span v-if="getProjectName(todo.projectId)" class="text-[11px] text-slate-400">
                    {{ getProjectName(todo.projectId) }}
                  </span>
                  <span
                    v-if="todo.dueDate === displayDays[0].dateStr"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold"
                  >
                    今日截止
                  </span>
                </div>
              </div>
            </div>
            <div
              v-else
              class="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl"
            >
              本日暂无待办事项，点击右上角快速添加
            </div>
          </div>
        </div>

        <!-- Day Card: Core Vertical Timeline Track -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xs space-y-4">
          <!-- Timeline Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span class="text-sm font-bold text-slate-800 dark:text-slate-100">当日时段排期</span>
              <span class="text-xs text-slate-400 font-normal">
                (固定日程、习惯打卡与重要里程碑)
              </span>
            </div>

            <div
              v-if="displayDays[0].isToday"
              class="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold"
            >
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>实时时间线</span>
            </div>
          </div>

          <!-- Timeline Flow Container -->
          <div class="relative pt-2 pb-2">
            <!-- Continuous Vertical Track Line -->
            <div class="absolute left-[3.25rem] sm:left-[3.75rem] -translate-x-1/2 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

            <!-- Timeline Items -->
            <div class="space-y-4 sm:space-y-5">
              <template
                v-for="(item, idx) in getDayTimelineItems(displayDays[0].dateStr, displayDays[0].isToday)"
                :key="item.id"
              >
                <!-- Soft Gap Indicator (if long interval between events) -->
                <div
                  v-if="shouldShowGap(item, getDayTimelineItems(displayDays[0].dateStr, displayDays[0].isToday)[idx + 1])"
                  class="relative flex items-center py-2 my-1"
                >
                  <div class="w-[3rem] sm:w-[3.5rem] pr-2 text-right shrink-0">
                    <span class="text-[10px] text-slate-300 dark:text-slate-600 font-mono">···</span>
                  </div>
                  <div class="relative flex items-center justify-center shrink-0 w-3.5 h-3.5 -ml-[7px] z-10">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  </div>
                  <div class="ml-3 sm:ml-4 text-[11px] text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                    自由专注时段 (间隔约 {{ getGapHours(item, getDayTimelineItems(displayDays[0].dateStr, displayDays[0].isToday)[idx + 1]) }} 小时)
                  </div>
                </div>

                <!-- Item Row -->
                <div class="relative flex items-start group">
                  <!-- Left Timestamp -->
                  <div class="w-[3rem] sm:w-[3.5rem] pr-2 pt-1 text-right shrink-0">
                    <span
                      :class="[
                        'text-xs font-mono select-none',
                        item.type === 'now'
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400 font-semibold'
                      ]"
                    >
                      {{ item.time }}
                    </span>
                  </div>

                  <!-- Node Dot (Precisely centered on track line) -->
                  <div class="relative flex items-center justify-center shrink-0 w-3.5 h-3.5 mt-1.5 -ml-[7px] z-10">
                    <!-- Now indicator dot -->
                    <div
                      v-if="item.type === 'now'"
                      class="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/80 animate-pulse"
                    ></div>
                    <!-- Schedule dot -->
                    <div
                      v-else-if="item.type === 'schedule'"
                      class="w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-2xs"
                      :style="{ backgroundColor: item.projectColor || '#4f46e5' }"
                    ></div>
                    <!-- Habit dot -->
                    <div
                      v-else-if="item.type === 'habit'"
                      class="w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-2xs"
                      :class="item.completed ? 'bg-emerald-500' : 'bg-amber-500'"
                    ></div>
                    <!-- Todo / Milestone dot -->
                    <div
                      v-else
                      class="w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-2xs"
                      :class="item.completed ? 'bg-emerald-500' : 'bg-rose-500'"
                    ></div>
                  </div>

                  <!-- Right Card / Content -->
                  <div class="flex-1 ml-3 sm:ml-4 min-w-0">
                    <!-- 1. Real-time Now Line -->
                    <div v-if="item.type === 'now'" class="flex items-center gap-2 py-1">
                      <div class="h-[2px] bg-rose-500/80 dark:bg-rose-500/70 flex-1 rounded-full relative">
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500"></div>
                      </div>
                      <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs shrink-0 select-none">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        现在 {{ item.time }}
                      </span>
                    </div>

                    <!-- 2. Schedule Card -->
                    <div
                      v-else-if="item.type === 'schedule'"
                      @click="handleOpenSchedule(item.data)"
                      class="p-3 sm:p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/70 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer shadow-2xs group-hover:shadow-xs"
                    >
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                          <CalendarDays class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span class="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                            {{ item.title }}
                          </span>
                          <span
                            v-if="item.data.recurringType !== 'none'"
                            class="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0"
                          >
                            {{ item.data.recurringType === 'weekly' ? '每周' : '每月' }}
                          </span>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <span v-if="item.projectName" class="text-[11px] text-slate-500 dark:text-slate-400">
                            {{ item.projectName }}
                          </span>
                          <span
                            v-if="item.projectColor"
                            class="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                            :style="{ backgroundColor: item.projectColor }"
                          ></span>
                        </div>
                      </div>
                    </div>

                    <!-- 3. Habit Card -->
                    <div
                      v-else-if="item.type === 'habit'"
                      @click="$emit('toggle-habit', { habitId: item.data.id, date: displayDays[0].dateStr })"
                      :class="[
                        'p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs group-hover:shadow-xs flex items-center justify-between gap-3',
                        item.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-300'
                      ]"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                          :class="[
                            item.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-amber-400 dark:border-amber-600'
                          ]"
                        >
                          <Check v-if="item.completed" class="w-3 h-3 stroke-[3]" />
                        </button>
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span
                              :class="[
                                'font-semibold text-xs sm:text-sm truncate',
                                item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                              ]"
                            >
                              {{ item.title }}
                            </span>
                            <span
                              class="text-[10px] px-1.5 py-0.2 rounded bg-amber-100/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0 font-medium"
                            >
                              {{ item.timeSlotLabel }}
                            </span>
                          </div>
                          <div v-if="item.projectName" class="text-[11px] text-slate-400 mt-0.5">
                            {{ item.projectName }}
                          </div>
                        </div>
                      </div>

                      <span
                        :class="[
                          'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0',
                          item.completed
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                        ]"
                      >
                        {{ item.completed ? '已打卡' : '打卡' }}
                      </span>
                    </div>

                    <!-- 4. Due / High Priority Todo Milestone Card -->
                    <div
                      v-else-if="item.type === 'todo'"
                      @click="$emit('open-todo', item.data)"
                      :class="[
                        'p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs group-hover:shadow-xs flex items-center justify-between gap-3',
                        item.completed
                          ? 'opacity-60 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
                      ]"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          @click.stop="$emit('toggle-todo', item.data.id)"
                          class="w-4 h-4 rounded border border-slate-400 dark:border-slate-600 flex items-center justify-center shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          :class="item.completed ? 'bg-emerald-600 border-emerald-600 text-white' : ''"
                        >
                          <Check v-if="item.completed" class="w-3 h-3 stroke-[3]" />
                        </button>
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span :class="['font-semibold text-xs sm:text-sm truncate', item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100']">
                              {{ item.title }}
                            </span>
                            <span class="text-[10px] px-1.5 py-0.2 rounded bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold shrink-0">
                              {{ item.timeSlotLabel }}
                            </span>
                            <span
                              v-if="item.data.importance"
                              :class="['text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0', getPriorityStyle(item.data.importance).badgeClass]"
                            >
                              P{{ item.data.importance }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span v-if="item.projectName" class="text-[11px] text-slate-400 shrink-0">
                        {{ item.projectName }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Empty State when no timeline events -->
            <div
              v-if="!hasTimelineEvents(displayDays[0].dateStr)"
              class="py-8 text-center space-y-3"
            >
              <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Clock class="w-6 h-6" />
              </div>
              <div class="space-y-1">
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  今日暂无时段排期
                </div>
                <div class="text-xs text-slate-400 max-w-sm mx-auto">
                  没有固定日程或打卡习惯，享受自由专注的一天。
                </div>
              </div>
              <div class="flex items-center justify-center gap-2 pt-1">
                <button
                  @click="quickAddTodo(displayDays[0].dateStr)"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>新建待办事项</span>
                </button>
                <button
                  @click="$emit('open-journal', displayDays[0].dateStr)"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <BookOpen class="w-3.5 h-3.5" />
                  <span>记录心得随笔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- VIEW 4: 2-Days / 3-Days Multi-Column Executive Boards -->
    <div
      v-else
      :class="[
        'flex-1 min-h-0 min-h-[480px] sm:min-h-[580px] lg:min-h-[calc(100vh-14rem)]',
        viewMode === '2days' ? 'grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full' :
        'flex sm:grid sm:grid-cols-3 overflow-x-auto no-scrollbar snap-x gap-3 pb-2 sm:pb-0 w-full'
      ]"
    >
      <div
        v-for="day in displayDays"
        :key="day.dateStr"
        :class="[
          viewMode === '3days' ? 'w-[84vw] sm:w-auto shrink-0 snap-start' : 'w-full',
          'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col h-full shadow-2xs overflow-hidden'
        ]"
      >
        <!-- Day Card Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
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
        <div class="flex-1 space-y-4 overflow-y-auto min-h-0 pr-0.5 no-scrollbar pt-1">
          <!-- 固定日程 -->
          <div v-if="typeFilters.schedules" class="space-y-2">
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
          <div v-if="typeFilters.habits" class="space-y-2">
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
          <div v-if="typeFilters.todos" class="space-y-2">
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

    <!-- Day Overview Modal (for clicking +N items or exploring all items of a day) -->
    <div
      v-if="selectedDayOverview"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeDayOverview"
    >
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4 text-blue-600" />
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              {{ formatDisplayDate(selectedDayOverview) }} · 当日所有事项
            </h3>
          </div>
          <button @click="closeDayOverview" class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Content list with scroll -->
        <div class="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-0.5 text-xs">
          <!-- 固定日程 -->
          <div v-if="getSchedulesForDay(selectedDayOverview).length > 0" class="space-y-1.5">
            <div class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <CalendarDays class="w-3.5 h-3.5" />
              <span>固定日程 ({{ getSchedulesForDay(selectedDayOverview).length }})</span>
            </div>
            <div
              v-for="s in getSchedulesForDay(selectedDayOverview)"
              :key="s.id"
              @click="handleOpenSchedule(s)"
              class="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 hover:border-indigo-300 flex items-center justify-between gap-2 cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-2 min-w-0 truncate">
                <span v-if="s.time" class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{{ s.time }}</span>
                <span class="font-medium text-slate-800 dark:text-slate-200 truncate">{{ s.title }}</span>
              </div>
              <span class="text-[10px] text-slate-400 shrink-0">{{ getProjectName(s.projectId) }}</span>
            </div>
          </div>

          <!-- 待办事项 -->
          <div v-if="getTodosForDay(selectedDayOverview).length > 0" class="space-y-1.5">
            <div class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckSquare class="w-3.5 h-3.5" />
              <span>待办事项 ({{ getTodosForDay(selectedDayOverview).length }})</span>
            </div>
            <div
              v-for="todo in getTodosForDay(selectedDayOverview)"
              :key="todo.id"
              @click="$emit('open-todo', todo)"
              class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-2 min-w-0 truncate">
                <button
                  @click.stop="$emit('toggle-todo', todo.id)"
                  class="w-4 h-4 rounded border border-slate-400 flex items-center justify-center shrink-0 hover:bg-slate-200 cursor-pointer"
                >
                  <Check v-if="todo.completed" class="w-3 h-3 stroke-[3]" />
                </button>
                <span :class="['font-medium truncate', todo.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200']">
                  {{ todo.title }}
                </span>
                <span
                  v-if="todo.importance"
                  :class="['text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0', getPriorityStyle(todo.importance).badgeClass]"
                >
                  P{{ todo.importance }}
                </span>
              </div>
              <span v-if="todo.dueDate === selectedDayOverview" class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold shrink-0">
                截止
              </span>
            </div>
          </div>

          <!-- 习惯打卡 -->
          <div v-if="getHabitsForDay(selectedDayOverview).length > 0" class="space-y-1.5">
            <div class="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5" />
              <span>习惯排期 ({{ getHabitsForDay(selectedDayOverview).length }})</span>
            </div>
            <div
              v-for="h in getHabitsForDay(selectedDayOverview)"
              :key="h.id"
              @click="$emit('toggle-habit', { habitId: h.id, date: selectedDayOverview })"
              :class="[
                'p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-colors',
                isHabitDoneOnDate(h.id, selectedDayOverview)
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 text-amber-900 dark:text-amber-200'
              ]"
            >
              <div class="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                  :class="[
                    isHabitDoneOnDate(h.id, selectedDayOverview)
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-amber-400 dark:border-amber-600'
                  ]"
                >
                  <Check v-if="isHabitDoneOnDate(h.id, selectedDayOverview)" class="w-3 h-3 stroke-[3]" />
                </button>
                <span :class="['font-medium truncate', isHabitDoneOnDate(h.id, selectedDayOverview) ? 'line-through text-slate-400' : '']">
                  {{ h.title }}
                </span>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-medium shrink-0">
                {{ isHabitDoneOnDate(h.id, selectedDayOverview) ? '已打卡' : '未打卡' }}
              </span>
            </div>
          </div>

          <div
            v-if="getSchedulesForDay(selectedDayOverview).length === 0 && getTodosForDay(selectedDayOverview).length === 0 && getHabitsForDay(selectedDayOverview).length === 0"
            class="py-6 text-center text-slate-400"
          >
            本日暂无日程、待办或习惯排期
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div class="flex items-center gap-2">
            <button
              @click="quickAddTodo(selectedDayOverview); closeDayOverview()"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>新建待办</span>
            </button>
            <button
              @click="$emit('open-journal', selectedDayOverview); closeDayOverview()"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <BookOpen class="w-3.5 h-3.5 text-amber-500" />
              <span>当日随笔</span>
            </button>
          </div>
          <button
            @click="closeDayOverview"
            class="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
  Clock,
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
  if (typeof window === 'undefined') return 'day'
  const saved = localStorage.getItem(VIEW_STORAGE_KEY) as CalendarViewMode
  const valid: CalendarViewMode[] = ['day', '2days', '3days', 'week', '2weeks', 'month']
  return valid.includes(saved) ? saved : 'day'
}

const viewMode = ref<CalendarViewMode>(getInitialViewMode())

const currentViewOption = computed(() => {
  return viewOptions.find((o) => o.mode === viewMode.value) || viewOptions[0]
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

// 条目类型过滤配置
interface CalendarTypeFilters {
  schedules: boolean
  todos: boolean
  habits: boolean
}

const FILTER_STORAGE_KEY = 'akasha_calendar_type_filters'

function getInitialFilters(): CalendarTypeFilters {
  if (typeof window === 'undefined') return { schedules: true, todos: true, habits: true }
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        schedules: parsed.schedules ?? true,
        todos: parsed.todos ?? true,
        habits: parsed.habits ?? true
      }
    }
  } catch {
    // ignore
  }
  return { schedules: true, todos: true, habits: true }
}

const typeFilters = ref<CalendarTypeFilters>(getInitialFilters())

function toggleTypeFilter(type: keyof CalendarTypeFilters) {
  typeFilters.value[type] = !typeFilters.value[type]
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(typeFilters.value))
  } catch {
    // ignore
  }
}

// 单日全部条目弹窗查看
const selectedDayOverview = ref<string | null>(null)

function openDayOverview(dateStr: string) {
  selectedDayOverview.value = dateStr
}

function closeDayOverview() {
  selectedDayOverview.value = null
}

interface DayCellItem {
  type: 'schedule' | 'habit' | 'todo'
  id: string
  title: string
  completed?: boolean
  importance?: number
  data: any
}

function getDayCellItems(dateStr: string): { visible: DayCellItem[]; extraCount: number; totalCount: number } {
  const items: DayCellItem[] = []

  if (typeFilters.value.schedules) {
    for (const s of getSchedulesForDay(dateStr)) {
      items.push({ type: 'schedule', id: s.id, title: s.title, data: s })
    }
  }

  if (typeFilters.value.habits) {
    for (const h of getHabitsForDay(dateStr)) {
      items.push({ type: 'habit', id: h.id, title: h.title, data: h })
    }
  }

  if (typeFilters.value.todos) {
    for (const t of getTodosForDay(dateStr)) {
      items.push({
        type: 'todo',
        id: t.id,
        title: t.title,
        completed: t.completed,
        importance: t.importance,
        data: t
      })
    }
  }

  const maxVisible = viewMode.value === '2weeks' ? 6 : 3
  const visible = items.slice(0, maxVisible)
  const extraCount = Math.max(0, items.length - maxVisible)

  return { visible, extraCount, totalCount: items.length }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

// 实时时间计时器（用于单日视图 Now 指示红线，每30秒更新一次）
const currentNowTime = ref(new Date())
let nowIntervalTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside)
  nowIntervalTimer = setInterval(() => {
    currentNowTime.value = new Date()
  }, 30000)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
  if (nowIntervalTimer) {
    clearInterval(nowIntervalTimer)
    nowIntervalTimer = null
  }
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

const monthRowCount = computed(() => {
  return Math.max(1, Math.ceil(displayDays.value.length / 7))
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

// --- 单日视角时间轴辅助函数 ---
interface TimelineItem {
  id: string
  type: 'schedule' | 'habit' | 'todo' | 'now'
  time: string
  timeLabel: string
  timeSlotLabel?: string
  sortMinutes: number
  title?: string
  completed?: boolean
  projectColor?: string
  projectName?: string
  data?: any
}

function getDayTimelineItems(dateStr: string, isToday: boolean): TimelineItem[] {
  const items: TimelineItem[] = []

  // 1. 固定日程
  if (typeFilters.value.schedules) {
    const schedulesList = getSchedulesForDay(dateStr)
    for (const s of schedulesList) {
      let sortMinutes = 9 * 60
      let timeStr = s.time || '09:00'
      if (s.time) {
        const parts = s.time.split(':').map(Number)
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          sortMinutes = parts[0] * 60 + parts[1]
          timeStr = s.time
        }
      }
      items.push({
        id: `schedule-${s.id}`,
        type: 'schedule',
        time: timeStr,
        timeLabel: timeStr,
        sortMinutes,
        title: s.title,
        projectColor: getProjectColor(s.projectId),
        projectName: getProjectName(s.projectId),
        data: s,
      })
    }
  }

  // 2. 习惯打卡
  if (typeFilters.value.habits) {
    const habitsList = getHabitsForDay(dateStr)
    for (const h of habitsList) {
      let sortMinutes = 10 * 60
      let timeStr = '10:00'
      let slotLabel = '习惯打卡'

      if (h.timeSlot === 'morning') {
        sortMinutes = 8 * 60
        timeStr = '08:00'
        slotLabel = '晨间习惯'
      } else if (h.timeSlot === 'afternoon') {
        sortMinutes = 13 * 60 + 30
        timeStr = '13:30'
        slotLabel = '午后习惯'
      } else if (h.timeSlot === 'evening') {
        sortMinutes = 20 * 60
        timeStr = '20:00'
        slotLabel = '晚间习惯'
      } else {
        sortMinutes = 9 * 60 + 30
        timeStr = '09:30'
        slotLabel = '全天习惯'
      }

      items.push({
        id: `habit-${h.id}`,
        type: 'habit',
        time: timeStr,
        timeLabel: timeStr,
        timeSlotLabel: slotLabel,
        sortMinutes,
        title: h.title,
        completed: isHabitDoneOnDate(h.id, dateStr),
        projectColor: getProjectColor(h.projectId),
        projectName: getProjectName(h.projectId),
        data: h,
      })
    }
  }

  // 3. 高优截止待办 (截止今日或重要程度>=8)
  if (typeFilters.value.todos) {
    const dueTodos = getTodosForDay(dateStr).filter((t) => t.dueDate === dateStr || (t.importance && t.importance >= 8))
    for (const t of dueTodos) {
      items.push({
        id: `todo-${t.id}`,
        type: 'todo',
        time: '18:00',
        timeLabel: '18:00',
        timeSlotLabel: t.dueDate === dateStr ? '截止里程碑' : '高优待办',
        sortMinutes: 18 * 60,
        title: t.title,
        completed: t.completed,
        projectColor: getProjectColor(t.projectId),
        projectName: getProjectName(t.projectId),
        data: t,
      })
    }
  }

  // 4. Now 实时时间红线指示器（仅在所看日期为“今日”时注入）
  if (isToday) {
    const nowHours = currentNowTime.value.getHours()
    const nowMinutes = currentNowTime.value.getMinutes()
    const currentMins = nowHours * 60 + nowMinutes
    const timeFormatted = `${String(nowHours).padStart(2, '0')}:${String(nowMinutes).padStart(2, '0')}`

    items.push({
      id: '__timeline_now_indicator__',
      type: 'now',
      time: timeFormatted,
      timeLabel: `${timeFormatted} 现在`,
      sortMinutes: currentMins,
    })
  }

  // 按时间先后升序排序
  items.sort((a, b) => {
    if (a.sortMinutes !== b.sortMinutes) {
      return a.sortMinutes - b.sortMinutes
    }
    const typeOrder = { schedule: 1, habit: 2, todo: 3, now: 4 }
    return (typeOrder[a.type] || 0) - (typeOrder[b.type] || 0)
  })

  return items
}

function hasTimelineEvents(dateStr: string): boolean {
  const hasSched = typeFilters.value.schedules && getSchedulesForDay(dateStr).length > 0
  const hasHabit = typeFilters.value.habits && getHabitsForDay(dateStr).length > 0
  const hasDueTodo = typeFilters.value.todos && getTodosForDay(dateStr).some((t) => t.dueDate === dateStr || (t.importance && t.importance >= 8))
  return hasSched || hasHabit || hasDueTodo
}

function shouldShowGap(current: TimelineItem, next?: TimelineItem): boolean {
  if (!next) return false
  if (current.type === 'now' || next.type === 'now') return false
  const diff = next.sortMinutes - current.sortMinutes
  return diff >= 210
}

function getGapHours(current: TimelineItem, next: TimelineItem): number {
  return Math.round((next.sortMinutes - current.sortMinutes) / 60)
}

function getDayTodosCompleted(dateStr: string): number {
  return getTodosForDay(dateStr).filter((t) => t.completed).length
}

function getDayTodosRate(dateStr: string): number {
  const list = getTodosForDay(dateStr)
  if (!list.length) return 0
  return Math.round((list.filter((t) => t.completed).length / list.length) * 100)
}

function getDayHabitsCompleted(dateStr: string): number {
  const habits = getHabitsForDay(dateStr)
  if (!habits.length) return 0
  return habits.filter((h) => isHabitDoneOnDate(h.id, dateStr)).length
}

function getJournalForDay(dateStr: string): JournalEntry | undefined {
  return props.journals.find((j) => j.date === dateStr && !!j.content)
}
</script>
