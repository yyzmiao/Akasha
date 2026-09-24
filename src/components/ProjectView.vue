<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FolderKanban class="w-5 h-5 text-blue-600" />
          <span>我的项目</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            共 {{ projects.length }} 个项目
          </span>
        </h2>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <button
          @click="openNewProjectModal()"
          class="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>新建项目</span>
        </button>

        <button
          @click="showAddAreaModal = true"
          class="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
        >
          <FolderPlus class="w-3.5 h-3.5" />
          <span>新建领域</span>
        </button>
      </div>
    </div>

    <!-- 领域标签栏（可点击筛选、可拖动换排序） -->
    <div v-if="areas.length > 0" class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto no-scrollbar select-none">
      <button
        @click="selectedAreaId = 'all'"
        :class="[
          'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
          selectedAreaId === 'all'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <span>全部领域</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="selectedAreaId === 'all' ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ projects.length }}
        </span>
      </button>

      <div
        v-for="(area, index) in sortedAreas"
        :key="area.id"
        draggable="true"
        @dragstart="handleAreaTabDragStart($event, index)"
        @dragover.prevent="handleAreaTabDragOver($event, index)"
        @dragleave="handleAreaTabDragLeave($event, index)"
        @drop="handleAreaTabDrop($event, index)"
        @dragend="handleAreaTabDragEnd"
        :class="[
          'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-grab active:cursor-grabbing border border-transparent',
          selectedAreaId === area.id
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200',
          draggedTabAreaIndex === index ? 'opacity-40 scale-95 border-dashed border-blue-400' : '',
          dragOverTabAreaIndex === index && draggedTabAreaIndex !== index ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/40' : ''
        ]"
        @click="selectedAreaId = area.id"
        :title="`拖动此标签可调整领域顺序 (当前第 ${index + 1} 位)`"
      >
        <GripVertical class="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0" />
        <span>{{ area.title }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="selectedAreaId === area.id ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ getProjectsByArea(area.id).length }}
        </span>
      </div>
    </div>

    <div v-if="areas.length === 0" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 sm:p-12 text-center space-y-3 shadow-sm">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
        <FolderPlus class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">暂无项目与领域</h3>
        <p class="text-xs text-slate-400">请先创建一个领域，随后即可在领域中规划项目与待办。</p>
      </div>
      <div>
        <button
          @click="showAddAreaModal = true"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>新建第一个领域</span>
        </button>
      </div>
    </div>

    <div v-else class="space-y-4 sm:space-y-6">
      <div
        v-for="(area, index) in displayAreas"
        :key="area.id"
        draggable="true"
        @dragstart="handleAreaCardDragStart($event, index)"
        @dragover.prevent="handleAreaCardDragOver($event, index)"
        @dragleave="handleAreaCardDragLeave($event, index)"
        @drop="handleAreaCardDrop($event, index)"
        @dragend="handleAreaCardDragEnd"
        :class="[
          'bg-white dark:bg-slate-900 border rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all',
          draggedCardAreaIndex === index ? 'opacity-40 border-dashed border-blue-400' : 'border-slate-200 dark:border-slate-800',
          dragOverCardAreaIndex === index && draggedCardAreaIndex !== index ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20 dark:bg-blue-950/20' : ''
        ]"
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <div
              class="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              title="按住拖动调整领域次序"
            >
              <GripVertical class="w-4 h-4" />
            </div>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ area.title }}</span>
            <span class="text-xs text-slate-400">({{ getProjectsByArea(area.id).length }})</span>
          </div>

          <div class="flex items-center gap-1">
            <!-- 移动顺序按钮 (方便触屏微调) -->
            <button
              v-if="index > 0"
              @click.stop="moveArea(index, index - 1)"
              class="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="上移领域"
            >
              <ArrowUp class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="index < displayAreas.length - 1"
              @click.stop="moveArea(index, index + 1)"
              class="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="下移领域"
            >
              <ArrowDown class="w-3.5 h-3.5" />
            </button>
            <button
              @click="openNewProjectModal(area.id)"
              class="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="添加项目"
            >
              <Plus class="w-4 h-4" />
            </button>
            <button
              @click="handleEditArea(area)"
              class="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="重命名领域"
            >
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button
              @click.stop="handleDeleteAreaClick(area)"
              class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="删除领域"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="proj in getProjectsByArea(area.id)"
            :key="proj.id"
            @click="openProjectDetail(proj)"
            class="group p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-950 flex flex-col justify-between relative"
          >
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: proj.color || '#3b82f6' }"
                  ></span>
                  <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                    {{ proj.title }}
                  </h3>
                </div>

                <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </div>

              <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 my-3">
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                  习惯 {{ getHabitsForProject(proj.id).length }}
                </span>
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                  日程 {{ getSchedulesForProject(proj.id).length }}
                </span>
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                  待办 {{ getProjectTodosCount(proj.id).completed }}/{{ getProjectTodosCount(proj.id).total }}
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                <span>进度</span>
                <span>{{ getProjectProgress(proj.id) }}%</span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${getProjectProgress(proj.id)}%`,
                    backgroundColor: proj.color || '#3b82f6'
                  }"
                ></div>
              </div>
            </div>
          </div>

          <button
            @click="openNewProjectModal(area.id)"
            class="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-400 text-slate-400 hover:text-blue-600 flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[120px]"
          >
            <Plus class="w-5 h-5" />
            <span class="text-xs font-medium">新建项目</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="activeProject"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      @click.self="activeProject = null"
    >
      <div class="w-full max-w-4xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        <!-- Drag indicator on mobile -->
        <div class="sm:hidden w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-2 -mb-1"></div>

        <div class="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sm:gap-4 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <span
              class="w-3.5 h-3.5 rounded-full shrink-0"
              :style="{ backgroundColor: activeProject.color || '#3b82f6' }"
            ></span>
            <div class="min-w-0">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {{ activeProject.title }}
              </h3>
              <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{{ getAreaTitle(activeProject.areaId) }}</span>
                <span>•</span>
                <span>待办完成率 {{ getProjectProgress(activeProject.id) }}%</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 sm:gap-2">
            <button
              @click="handleDeleteProject(activeProject.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="删除项目"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <button
              @click="activeProject = null"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 text-amber-500" />
                <span>习惯打卡 ({{ activeProjectHabits.length }})</span>
              </h4>
              <button
                @click="showAddHabitInline = !showAddHabitInline"
                class="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>添加习惯</span>
              </button>
            </div>

            <div
              v-if="showAddHabitInline"
              class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
            >
              <input
                v-model="newHabitTitle"
                type="text"
                placeholder="习惯名称..."
                class="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                @keyup.enter="handleCreateProjectHabit"
              />
              <div class="flex flex-wrap items-center gap-2">
                <select
                  v-model="newHabitFrequency"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                >
                  <option value="daily">每日习惯</option>
                  <option value="weekly">每周习惯</option>
                  <option value="rotating">多周轮换循环</option>
                  <option value="monthly">每月习惯</option>
                </select>
                <select
                  v-if="newHabitFrequency === 'daily'"
                  v-model="newHabitSlot"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                >
                  <option value="morning">早晨</option>
                  <option value="afternoon">下午</option>
                  <option value="evening">晚上</option>
                  <option value="anytime">全天</option>
                </select>
                <input
                  v-model="newHabitTime"
                  type="time"
                  placeholder="留空按时段"
                  class="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  title="具体打卡时间点 (几点几分，可选)"
                />
                <button
                  @click="handleCreateProjectHabit"
                  class="ml-auto px-3 py-1 bg-blue-600 text-white rounded font-medium"
                >
                  保存
                </button>
              </div>
            </div>

            <div v-if="activeProjectHabits.length === 0" class="text-center py-3 text-xs text-slate-400">
              此项目暂无习惯
            </div>
            <div v-else class="space-y-1.5">
              <div
                v-for="h in activeProjectHabits"
                :key="h.id"
                @click="$emit('toggle-habit', { habitId: h.id, date: todayStr })"
                class="group flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-colors cursor-pointer select-none text-xs"
                :class="[
                  (h.frequency === 'rotating' || h.frequency === 'biweekly') && !isHabitScheduledForDay(h, todayStr)
                    ? 'opacity-80 hover:opacity-100 bg-slate-50/40 dark:bg-slate-900/20'
                    : ''
                ]"
              >
                <div class="flex items-center gap-2 flex-wrap min-w-0">
                  <div
                    :class="[
                      'w-4 h-4 rounded flex items-center justify-center transition-all shrink-0',
                      isHabitDoneToday(h.id)
                        ? 'bg-emerald-600 border border-emerald-600 text-white'
                        : (h.frequency === 'rotating' || h.frequency === 'biweekly') && !isHabitScheduledForDay(h, todayStr)
                          ? 'border border-dashed border-slate-300 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-800/50 text-slate-400'
                          : 'border border-slate-300 dark:border-slate-600'
                    ]"
                    :title="(h.frequency === 'rotating' || h.frequency === 'biweekly') && !isHabitScheduledForDay(h, todayStr) ? '今日非排期日，点击仍可记录' : ''"
                  >
                    <Check v-if="isHabitDoneToday(h.id)" class="w-3 h-3 stroke-[3]" />
                  </div>
                  <span :class="['font-medium truncate', isHabitDoneToday(h.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200']">
                    {{ h.title }}
                  </span>
                  <span
                    v-if="h.time"
                    class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0 font-semibold"
                  >
                    🕒 {{ h.time }}
                  </span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                    {{ formatFrequency(h.frequency) }}
                  </span>
                  <template v-if="h.frequency === 'rotating' || h.frequency === 'biweekly'">
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono shrink-0">
                      第{{ getCycleWeekNumber(todayStr, h.anchorDate, h.cycleWeeks || 2) }}/{{ h.cycleWeeks || 2 }}周
                    </span>
                    <span
                      v-if="isHabitScheduledForDay(h, todayStr)"
                      class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0"
                    >
                      🎯 今日排期
                    </span>
                    <span
                      v-else
                      class="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0"
                    >
                      🏖️ 今日休息
                    </span>
                  </template>
                </div>

                <div class="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    @click.stop="toggleProjectHabitShowOnCalendar(h)"
                    :class="[
                      'p-1.5 sm:p-1 rounded-md transition-all',
                      h.showOnCalendar
                        ? 'opacity-100 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                        : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                    ]"
                    :title="h.showOnCalendar ? '已在日历显示（点击隐藏）' : '在日历上显示（点击开启）'"
                  >
                    <Calendar v-if="h.showOnCalendar" class="w-3.5 h-3.5" />
                    <CalendarOff v-else class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click.stop="openEditHabit(h)"
                    class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                    title="修改习惯"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click.stop="handleDeleteHabitItem(h.id)"
                    class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    title="删除习惯"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CalendarDays class="w-3.5 h-3.5 text-blue-600" />
                <span>固定日程 ({{ activeProjectSchedules.length }})</span>
              </h4>
              <button
                @click="showAddScheduleInline = !showAddScheduleInline"
                class="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>添加日程</span>
              </button>
            </div>

            <div
              v-if="showAddScheduleInline"
              class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
            >
              <input
                v-model="newScheduleTitle"
                type="text"
                placeholder="日程标题..."
                class="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                @keyup.enter="handleCreateProjectSchedule"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  v-model="newScheduleDate"
                  type="date"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />

                <input
                  v-model="newScheduleTime"
                  type="time"
                  placeholder="时间（可选）"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div class="flex justify-end pt-1">
                <button
                  @click="handleCreateProjectSchedule"
                  class="px-3 py-1 bg-blue-600 text-white rounded font-medium"
                >
                  保存
                </button>
              </div>
            </div>

            <div v-if="activeProjectSchedules.length === 0" class="text-center py-3 text-xs text-slate-400">
              此项目暂无日程
            </div>
            <div v-else class="space-y-1.5">
              <div
                v-for="s in activeProjectSchedules"
                :key="s.id"
                class="group flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div class="flex items-center gap-2">
                  <Calendar class="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span class="font-medium text-slate-800 dark:text-slate-100">{{ s.title }}</span>
                  <span class="text-[11px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-mono">
                    {{ formatScheduleTiming(s) }}
                  </span>
                </div>

                <button
                  @click="handleDeleteScheduleItem(s.id)"
                  class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckSquare class="w-3.5 h-3.5 text-blue-600" />
                <span>待办清单 ({{ activeProjectTodos.length }})</span>
              </h4>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="newProjectTodoTitle"
                type="text"
                placeholder="新建项目待办..."
                class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                @keyup.enter="handleCreateProjectRootTodo"
              />
              <button
                @click="handleCreateProjectRootTodo"
                class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
              >
                添加
              </button>
            </div>

            <div v-if="projectTodoTree.length === 0" class="text-center py-4 text-xs text-slate-400">
              此项目暂无待办事项
            </div>
            <div v-else class="space-y-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <TodoTreeItem
                v-for="item in projectTodoTree"
                :key="item.id"
                :item="item"
                :depth="0"
                @toggle-complete="handleToggleTodoComplete"
                @toggle-collapse="handleToggleTodoCollapse"
                @add-child="handleAddTodoChild"
                @edit-title="handleEditTodoTitle"
                @edit-details="handleOpenTodoDetails"
                @delete-item="handleDeleteTodoItem"
                @update-importance="handleQuickUpdateProjectTodoImportance"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div
      v-if="showNewProjectModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      @click.self="showNewProjectModal = false"
    >
      <div class="w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-xl p-5 space-y-4 shadow-xl pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        <div class="sm:hidden w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2"></div>

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">新建项目</h3>
          <button @click="showNewProjectModal = false" class="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">所属领域</label>
            <select
              v-model="modalAreaId"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">项目名称</label>
            <input
              v-model="modalProjectTitle"
              type="text"
              placeholder="项目名称..."
              class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              @keyup.enter="handleSaveNewProject"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">主题颜色</label>
            <div class="flex items-center gap-2.5 flex-wrap">
              <button
                v-for="c in colorOptions"
                :key="c"
                type="button"
                @click="modalProjectColor = c"
                class="w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-transform active:scale-95"
                :class="modalProjectColor === c ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent'"
                :style="{ backgroundColor: c }"
              ></button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="showNewProjectModal = false"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            取消
          </button>
          <button
            @click="handleSaveNewProject"
            class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- Add Area Modal -->
    <div
      v-if="showAddAreaModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      @click.self="showAddAreaModal = false"
    >
      <div class="w-full sm:max-w-sm bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-xl p-5 space-y-4 shadow-xl pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        <div class="sm:hidden w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2"></div>

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">新建领域</h3>
          <button @click="showAddAreaModal = false" class="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <input
          v-model="newAreaTitle"
          type="text"
          placeholder="领域名称..."
          class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          @keyup.enter="handleSaveNewArea"
        />

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="showAddAreaModal = false"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            取消
          </button>
          <button
            @click="handleSaveNewArea"
            class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Project Todo Modal -->
    <div
      v-if="editingProjectTodo"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      @click.self="editingProjectTodo = null"
    >
      <div class="w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-xl p-5 space-y-4 shadow-xl max-h-[88vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        <div class="sm:hidden w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2"></div>

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">设置待办属性</h3>
          <button @click="editingProjectTodo = null" class="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">待办名称</label>
            <input
              v-model="editingProjectTodo.title"
              type="text"
              class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300">重要程度 (优先级)</label>
              <span
                v-if="editingProjectTodo"
                :class="['px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors', getPriorityStyle(editingProjectTodo.importance).badgeClass]"
              >
                {{ getPriorityStyle(editingProjectTodo.importance).label }}
              </span>
            </div>
            <!-- Range Slider -->
            <input
              v-if="editingProjectTodo"
              v-model.number="editingProjectTodo.importance"
              type="range"
              min="1"
              max="10"
              class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
            />
            <!-- Quick Chips P1 to P10 -->
            <div v-if="editingProjectTodo" class="grid grid-cols-5 gap-1.5 pt-1">
              <button
                v-for="p in 10"
                :key="p"
                type="button"
                @click="editingProjectTodo.importance = p"
                :class="[
                  'py-1 rounded text-xs font-mono transition-all border text-center',
                  getPriorityStyle(p).badgeClass,
                  normalizePriority(editingProjectTodo.importance) === p
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 font-bold scale-105 shadow-xs'
                    : 'opacity-70 hover:opacity-100 active:scale-95'
                ]"
              >
                P{{ p }}
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-blue-500" />
                <span>时间安排</span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="isProjectTodoAllDay"
                  @change="handleProjectTodoAllDayChange"
                  class="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20"
                />
                <span>全天任务</span>
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Box 1: 开始时间 -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {{ isProjectTodoAllDay ? '开始日期' : '开始时间' }}
                  </label>
                  <button
                    v-if="isProjectTodoAllDay ? projectTodoStartDateOnly : projectTodoStartDateTime"
                    type="button"
                    @click="clearProjectTodoStart"
                    class="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    清除
                  </button>
                </div>
                <input
                  v-if="!isProjectTodoAllDay"
                  v-model="projectTodoStartDateTime"
                  type="datetime-local"
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
                <input
                  v-else
                  v-model="projectTodoStartDateOnly"
                  type="date"
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <!-- Box 2: 结束时间 -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {{ isProjectTodoAllDay ? '截止日期' : '结束时间' }}
                  </label>
                  <button
                    v-if="isProjectTodoAllDay ? projectTodoEndDateOnly : projectTodoEndDateTime"
                    type="button"
                    @click="clearProjectTodoEnd"
                    class="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    清除
                  </button>
                </div>
                <input
                  v-if="!isProjectTodoAllDay"
                  v-model="projectTodoEndDateTime"
                  type="datetime-local"
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
                <input
                  v-else
                  v-model="projectTodoEndDateOnly"
                  type="date"
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">备注信息</label>
            <textarea
              v-model="editingProjectTodo.notes"
              rows="3"
              placeholder="补充说明..."
              class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="editingProjectTodo = null"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            取消
          </button>
          <button
            @click="saveProjectTodoDetails"
            class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 习惯修改弹窗 (Edit Habit Modal) -->
    <div
      v-if="editingProjectHabit"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      @click.self="editingProjectHabit = null"
      @keydown.esc="editingProjectHabit = null"
    >
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-xl space-y-4 max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150"
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
            @click="editingProjectHabit = null"
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
              v-model="editingProjectHabit.title"
              type="text"
              placeholder="习惯名称..."
              class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              @keyup.enter="saveProjectHabitEdit"
            />
          </div>

          <div v-if="projects && projects.length > 0">
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">所属项目</label>
            <select
              v-model="editingProjectHabit.projectId"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            >
              <option :value="null">无项目 (独立习惯)</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">循环周期</label>
            <select
              v-model="editingProjectHabit.frequency"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            >
              <option value="daily">每日习惯</option>
              <option value="weekly">每周习惯</option>
              <option value="rotating">多周轮换循环 (高级)</option>
              <option value="monthly">每月习惯</option>
            </select>
          </div>

          <div v-if="editingProjectHabit.frequency === 'daily'">
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">打卡时间段</label>
            <select
              v-model="editingProjectHabit.timeSlot"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            >
              <option value="morning">早晨</option>
              <option value="afternoon">下午</option>
              <option value="evening">晚上</option>
              <option value="anytime">全天</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">具体打卡时间 (可选，几点几分)</label>
              <button
                v-if="editingProjectHabit.time"
                type="button"
                @click="editingProjectHabit.time = ''"
                class="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                清除时间
              </button>
            </div>
            <input
              v-model="editingProjectHabit.time"
              type="time"
              placeholder="留空按时间段排期"
              class="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono"
            />
          </div>

          <div v-if="editingProjectHabit.frequency === 'weekly'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">触发时机</label>
              <select
                v-model="editingProjectHabit.timingType"
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
                  v-model.number="editingProjectHabit.targetCount"
                  type="number"
                  min="1"
                  max="7"
                  class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                />
                <span class="text-xs text-slate-500 shrink-0">次 / 周</span>
              </div>
            </div>
          </div>

          <!-- 多周轮换循环配置 -->
          <div v-if="editingProjectHabit.frequency === 'rotating' || editingProjectHabit.frequency === 'biweekly'" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">循环周期长度</label>
                <select
                  v-model.number="editingProjectHabit.cycleWeeks"
                  class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                >
                  <option :value="2">2 周轮换（隔周排期）</option>
                  <option :value="3">3 周轮换</option>
                  <option :value="4">4 周轮换</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  基准起始日 (Anchor)
                </label>
                <input
                  v-model="editingProjectHabit.anchorDate"
                  type="date"
                  class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <!-- 自然语言实时预览条 -->
            <div class="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-1">
              <div class="flex items-center justify-between font-medium text-indigo-900 dark:text-indigo-200">
                <span class="flex items-center gap-1.5">
                  <span>🔄 规则实时预览:</span>
                  <span>{{ editProjectRotatingPreview.summary }}</span>
                </span>
                <span class="text-[11px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                  当前处于第 {{ editProjectRotatingPreview.currentWeek }} 周
                </span>
              </div>
              <div class="text-[11px] flex items-center justify-between text-indigo-700 dark:text-indigo-300/80">
                <span>{{ editProjectRotatingPreview.currentWeekDesc }}</span>
                <span
                  :class="[
                    'font-medium px-1.5 py-0.5 rounded text-[10px]',
                    editProjectRotatingPreview.isTodayScheduled
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  ]"
                >
                  {{ editProjectRotatingPreview.isTodayScheduled ? '🎯 今日排期打卡' : '🏖️ 今日轮换休息' }}
                </span>
              </div>
            </div>

            <!-- 各周卡片选择 -->
            <div class="space-y-2">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">各周执行日排期配置</label>
              <div class="space-y-2">
                <div
                  v-for="w in (editingProjectHabit.cycleWeeks || 2)"
                  :key="w"
                  class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-[10px] font-mono">
                        {{ w }}
                      </span>
                      <span>第 {{ w }} 周</span>
                      <span
                        v-if="editProjectRotatingPreview.currentWeek === w"
                        class="text-[10px] px-1 py-0.2 rounded bg-blue-500 text-white font-normal"
                      >
                        本周生效
                      </span>
                    </span>

                    <div class="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        @click="setProjectEditPatternPreset(w, 'weekdays')"
                        class="px-1.5 py-0.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        工作日
                      </button>
                      <span class="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        @click="setProjectEditPatternPreset(w, 'weekend')"
                        class="px-1.5 py-0.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        周末
                      </button>
                      <span class="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        @click="setProjectEditPatternPreset(w, 'clear')"
                        class="px-1.5 py-0.5 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        清空
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-7 gap-1.5">
                    <button
                      v-for="d in WEEKDAY_ORDER"
                      :key="d"
                      type="button"
                      @click="toggleProjectEditPatternDay(w, d)"
                      :class="[
                        'h-7 rounded text-xs font-medium transition-all flex items-center justify-center',
                        editingProjectHabit.weekPatterns[w]?.includes(d)
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      ]"
                    >
                      {{ WEEKDAY_SHORT_NAMES[d] }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 是否在日历上显示 -->
          <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div class="space-y-0.5">
              <div class="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-blue-600" />
                <span>在日历中显示该习惯</span>
              </div>
              <div class="text-[11px] text-slate-400">开启后该习惯排期将在月历中作为卡片展示并支持打卡</div>
            </div>
            <input
              v-model="editingProjectHabit.showOnCalendar"
              type="checkbox"
              class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="editingProjectHabit = null"
            class="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            @click="saveProjectHabitEdit"
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
import {
  FolderKanban,
  FolderPlus,
  Plus,
  Edit2,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Sparkles,
  CalendarDays,
  Calendar,
  CalendarOff,
  CheckSquare,
  Check,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-vue-next'
import TodoTreeItem from '@/components/TodoTreeItem.vue'
import type {
  Area,
  Project,
  ScheduleItem,
  Habit,
  HabitLog,
  TodoItem,
  HabitFrequency,
  TimeSlot,
  TimingType,
  ScheduleRecurringType,
} from '@/types'
import { getPriorityStyle, normalizePriority } from '@/utils/priority'
import { buildTodoTree, calculateLinkedTodoCompletion, getDescendantTodoIds } from '@/utils/tree'
import { formatDate } from '@/utils/date'
import {
  WEEKDAY_ORDER,
  WEEKDAY_SHORT_NAMES,
  sortDays,
  getRotatingHabitNaturalDescription,
  isHabitScheduledForDay,
  getCycleWeekNumber,
} from '@/utils/habit'

const props = defineProps<{
  areas: Area[]
  projects: Project[]
  schedules: ScheduleItem[]
  habits: Habit[]
  habitLogs: HabitLog[]
  todos: TodoItem[]
  targetProjectId?: string | null
}>()

const emit = defineEmits<{
  (e: 'save-area', area: Partial<Area>): void
  (e: 'delete-area', id: string): void
  (e: 'reorder-areas', areas: Area[]): void
  (e: 'save-project', project: Partial<Project>): void
  (e: 'delete-project', id: string): void
  (e: 'save-schedule', schedule: Partial<ScheduleItem>): void
  (e: 'delete-schedule', id: string): void
  (e: 'save-habit', habit: Partial<Habit>): void
  (e: 'delete-habit', id: string): void
  (e: 'toggle-habit', payload: { habitId: string; date: string }): void
  (e: 'save-todo', item: Partial<TodoItem>): void
  (e: 'delete-todo', id: string): void
  (e: 'batch-update', items: TodoItem[]): void
}>()

const todayStr = formatDate(new Date())

const selectedAreaId = ref<string>('all')

const sortedAreas = computed(() => {
  return [...props.areas].sort((a, b) => a.order - b.order)
})

const displayAreas = computed(() => {
  if (selectedAreaId.value === 'all') return sortedAreas.value
  return sortedAreas.value.filter((a) => a.id === selectedAreaId.value)
})

// Drag & drop state for Area Tabs and Area Cards
const draggedTabAreaIndex = ref<number | null>(null)
const dragOverTabAreaIndex = ref<number | null>(null)
const draggedCardAreaIndex = ref<number | null>(null)
const dragOverCardAreaIndex = ref<number | null>(null)

function moveArea(fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
  if (fromIndex >= sortedAreas.value.length || toIndex >= sortedAreas.value.length) return

  const list = [...sortedAreas.value]
  const [moved] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, moved)

  const updated = list.map((a, idx) => ({
    ...a,
    order: idx,
  }))

  emit('reorder-areas', updated)
}

function handleAreaTabDragStart(e: DragEvent, index: number) {
  draggedTabAreaIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function handleAreaTabDragOver(e: DragEvent, index: number) {
  if (draggedTabAreaIndex.value === null) return
  dragOverTabAreaIndex.value = index
}

function handleAreaTabDragLeave(e: DragEvent, index: number) {
  if (dragOverTabAreaIndex.value === index) {
    dragOverTabAreaIndex.value = null
  }
}

function handleAreaTabDrop(e: DragEvent, toIndex: number) {
  if (draggedTabAreaIndex.value !== null) {
    moveArea(draggedTabAreaIndex.value, toIndex)
  }
  handleAreaTabDragEnd()
}

function handleAreaTabDragEnd() {
  draggedTabAreaIndex.value = null
  dragOverTabAreaIndex.value = null
}

function handleAreaCardDragStart(e: DragEvent, index: number) {
  draggedCardAreaIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function handleAreaCardDragOver(e: DragEvent, index: number) {
  if (draggedCardAreaIndex.value === null) return
  dragOverCardAreaIndex.value = index
}

function handleAreaCardDragLeave(e: DragEvent, index: number) {
  if (dragOverCardAreaIndex.value === index) {
    dragOverCardAreaIndex.value = null
  }
}

function handleAreaCardDrop(e: DragEvent, toIndex: number) {
  if (draggedCardAreaIndex.value !== null) {
    moveArea(draggedCardAreaIndex.value, toIndex)
  }
  handleAreaCardDragEnd()
}

function handleAreaCardDragEnd() {
  draggedCardAreaIndex.value = null
  dragOverCardAreaIndex.value = null
}

function getProjectsByArea(areaId: string): Project[] {
  return props.projects.filter((p) => p.areaId === areaId).sort((a, b) => a.order - b.order)
}

function getAreaTitle(areaId: string): string {
  return props.areas.find((a) => a.id === areaId)?.title || ''
}

function getHabitsForProject(projectId: string): Habit[] {
  return props.habits.filter((h) => h.projectId === projectId)
}

function getSchedulesForProject(projectId: string): ScheduleItem[] {
  return props.schedules.filter((s) => s.projectId === projectId)
}

function getProjectTodos(projectId: string): TodoItem[] {
  return props.todos.filter((t) => t.projectId === projectId)
}

function getProjectTodosCount(projectId: string) {
  const list = getProjectTodos(projectId)
  const completed = list.filter((t) => t.completed).length
  return { total: list.length, completed }
}

function getProjectProgress(projectId: string): number {
  const { total, completed } = getProjectTodosCount(projectId)
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

const activeProject = ref<Project | null>(null)

watch(
  () => props.targetProjectId,
  (newId) => {
    if (newId) {
      const p = props.projects.find((item) => item.id === newId)
      if (p) activeProject.value = p
    }
  },
  { immediate: true }
)

function openProjectDetail(project: Project) {
  activeProject.value = project
}

const activeProjectHabits = computed(() => {
  if (!activeProject.value) return []
  return getHabitsForProject(activeProject.value.id)
})

const activeProjectSchedules = computed(() => {
  if (!activeProject.value) return []
  return getSchedulesForProject(activeProject.value.id)
})

const activeProjectTodos = computed(() => {
  if (!activeProject.value) return []
  return getProjectTodos(activeProject.value.id)
})

const projectTodoTree = computed(() => {
  return buildTodoTree(activeProjectTodos.value)
})

function isHabitDoneToday(habitId: string): boolean {
  return props.habitLogs.some((l) => l.habitId === habitId && l.date === todayStr && l.completed)
}

function formatFrequency(freq: HabitFrequency): string {
  const map: Record<HabitFrequency, string> = {
    daily: '每日',
    weekly: '每周',
    biweekly: '多周轮换',
    monthly: '每月',
    rotating: '多周轮换',
  }
  return map[freq] || freq
}

function formatScheduleTiming(s: ScheduleItem): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  let timing = ''
  if (s.recurringType === 'weekly' && s.recurringDayOfWeek !== undefined) {
    timing = `每周${weekdays[s.recurringDayOfWeek]}`
  } else if (s.recurringType === 'monthly' && s.recurringDayOfMonth !== undefined) {
    timing = `每月${s.recurringDayOfMonth}号`
  } else if (s.date) {
    timing = s.date.slice(5)
  }
  if (s.time) {
    timing += ` ${s.time}`
  }
  return timing
}

const showAddHabitInline = ref(false)
const newHabitTitle = ref('')
const newHabitFrequency = ref<HabitFrequency>('daily')
const newHabitSlot = ref<TimeSlot>('anytime')
const newHabitTime = ref('')

function handleCreateProjectHabit() {
  if (!activeProject.value || !newHabitTitle.value.trim()) return
  emit('save-habit', {
    projectId: activeProject.value.id,
    title: newHabitTitle.value.trim(),
    frequency: newHabitFrequency.value,
    timeSlot: newHabitSlot.value,
    time: newHabitTime.value ? newHabitTime.value.trim() : undefined,
    timingType: 'anytime',
    cycleWeeks: newHabitFrequency.value === 'rotating' ? 2 : undefined,
    anchorDate: newHabitFrequency.value === 'rotating' ? todayStr : undefined,
    weekPatterns: newHabitFrequency.value === 'rotating' ? { 1: [1, 2, 3, 4, 5], 2: [1, 2, 3, 4, 5] } : undefined,
  })
  newHabitTitle.value = ''
  newHabitTime.value = ''
  showAddHabitInline.value = false
}

const editingProjectHabit = ref<{
  id: string
  title: string
  projectId: string | null
  frequency: HabitFrequency
  timeSlot: TimeSlot
  time?: string
  timingType: TimingType
  targetCount: number
  anchorDate?: string
  cycleWeeks?: number
  weekPatterns: Record<number, number[]>
  showOnCalendar?: boolean
} | null>(null)

function toggleProjectHabitShowOnCalendar(habit: Habit) {
  emit('save-habit', {
    ...habit,
    showOnCalendar: !habit.showOnCalendar,
  })
}

function openEditHabit(habit: Habit) {
  const cycle = habit.cycleWeeks || 2
  const initialPatterns: Record<number, number[]> = {}
  for (let w = 1; w <= cycle; w++) {
    initialPatterns[w] = habit.weekPatterns && habit.weekPatterns[w] ? [...habit.weekPatterns[w]] : [1, 2, 3, 4, 5]
  }

  editingProjectHabit.value = {
    id: habit.id,
    title: habit.title,
    projectId: habit.projectId || null,
    frequency: habit.frequency === 'biweekly' ? 'rotating' : (habit.frequency || 'daily'),
    timeSlot: habit.timeSlot || 'morning',
    time: habit.time || '',
    timingType: habit.timingType || 'anytime',
    targetCount: habit.targetCount || 1,
    anchorDate: habit.anchorDate || todayStr,
    cycleWeeks: cycle,
    weekPatterns: habit.weekPatterns ? JSON.parse(JSON.stringify(habit.weekPatterns)) : initialPatterns,
    showOnCalendar: habit.showOnCalendar ?? false,
  }
}

watch(
  () => editingProjectHabit.value?.cycleWeeks,
  (weeks) => {
    if (!editingProjectHabit.value || !weeks) return
    const current = { ...(editingProjectHabit.value.weekPatterns || {}) }
    for (let w = 1; w <= weeks; w++) {
      if (!current[w]) current[w] = []
    }
    for (const k of Object.keys(current)) {
      if (Number(k) > weeks) {
        delete current[Number(k)]
      }
    }
    editingProjectHabit.value.weekPatterns = current
  }
)

function toggleProjectEditPatternDay(weekNum: number, day: number) {
  if (!editingProjectHabit.value) return
  const current = [...(editingProjectHabit.value.weekPatterns[weekNum] || [])]
  const idx = current.indexOf(day)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(day)
  }
  editingProjectHabit.value.weekPatterns = {
    ...editingProjectHabit.value.weekPatterns,
    [weekNum]: sortDays(current),
  }
}

function setProjectEditPatternPreset(weekNum: number, preset: 'weekdays' | 'weekend' | 'clear') {
  if (!editingProjectHabit.value) return
  let days: number[] = []
  if (preset === 'weekdays') days = [1, 2, 3, 4, 5]
  else if (preset === 'weekend') days = [6, 0]
  editingProjectHabit.value.weekPatterns = {
    ...editingProjectHabit.value.weekPatterns,
    [weekNum]: days,
  }
}

const editProjectRotatingPreview = computed(() => {
  if (!editingProjectHabit.value) return { summary: '', currentWeekDesc: '', isTodayScheduled: false, currentWeek: 1 }
  return getRotatingHabitNaturalDescription(
    editingProjectHabit.value.cycleWeeks || 2,
    editingProjectHabit.value.weekPatterns || {},
    editingProjectHabit.value.anchorDate,
    todayStr
  )
})

function saveProjectHabitEdit() {
  if (!editingProjectHabit.value || !editingProjectHabit.value.title.trim()) return
  emit('save-habit', {
    id: editingProjectHabit.value.id,
    title: editingProjectHabit.value.title.trim(),
    projectId: editingProjectHabit.value.projectId || null,
    frequency: editingProjectHabit.value.frequency,
    timeSlot: editingProjectHabit.value.timeSlot,
    time: editingProjectHabit.value.time ? editingProjectHabit.value.time.trim() : undefined,
    timingType: editingProjectHabit.value.timingType,
    targetCount: editingProjectHabit.value.targetCount,
    anchorDate: editingProjectHabit.value.anchorDate,
    cycleWeeks: editingProjectHabit.value.frequency === 'rotating' ? (editingProjectHabit.value.cycleWeeks || 2) : undefined,
    weekPatterns: editingProjectHabit.value.frequency === 'rotating' ? editingProjectHabit.value.weekPatterns : undefined,
    showOnCalendar: editingProjectHabit.value.showOnCalendar,
  })
  editingProjectHabit.value = null
}

const showAddScheduleInline = ref(false)
const newScheduleTitle = ref('')
const newScheduleDate = ref(formatDate(new Date()))
const newScheduleTime = ref('')

function handleCreateProjectSchedule() {
  if (!activeProject.value || !newScheduleTitle.value.trim()) return
  emit('save-schedule', {
    projectId: activeProject.value.id,
    title: newScheduleTitle.value.trim(),
    recurringType: 'none',
    date: newScheduleDate.value || formatDate(new Date()),
    time: newScheduleTime.value || undefined,
  })
  newScheduleTitle.value = ''
  newScheduleDate.value = formatDate(new Date())
  newScheduleTime.value = ''
  showAddScheduleInline.value = false
}

const newProjectTodoTitle = ref('')
function handleCreateProjectRootTodo() {
  if (!activeProject.value || !newProjectTodoTitle.value.trim()) return
  emit('save-todo', {
    projectId: activeProject.value.id,
    parentId: null,
    title: newProjectTodoTitle.value.trim(),
    completed: false,
    order: activeProjectTodos.value.filter((t) => t.parentId === null).length,
    importance: 5,
  })
  newProjectTodoTitle.value = ''
}

function handleAddTodoChild(parentId: string) {
  if (!activeProject.value) return
  const childTitle = prompt('子代办名称：')
  if (!childTitle || !childTitle.trim()) return

  const parent = props.todos.find((t) => t.id === parentId)
  if (parent && parent.collapsed) {
    emit('save-todo', { ...parent, collapsed: false })
  }

  emit('save-todo', {
    projectId: activeProject.value.id,
    parentId,
    title: childTitle.trim(),
    completed: false,
    order: props.todos.filter((t) => t.parentId === parentId).length,
    importance: parent?.importance || 5,
  })
}

function handleToggleTodoComplete(id: string) {
  const item = props.todos.find((t) => t.id === id)
  if (!item) return
  const willBeCompleted = !item.completed

  const { changedTodos } = calculateLinkedTodoCompletion(props.todos, id, willBeCompleted)
  if (changedTodos.length > 0) {
    emit('batch-update', changedTodos)
  }
}

function handleToggleTodoCollapse(id: string) {
  const item = props.todos.find((t) => t.id === id)
  if (item) {
    emit('save-todo', { ...item, collapsed: !item.collapsed })
  }
}

function handleEditTodoTitle(payload: { id: string; title: string }) {
  const item = props.todos.find((t) => t.id === payload.id)
  if (item) {
    emit('save-todo', { ...item, title: payload.title })
  }
}

const editingProjectTodo = ref<TodoItem | null>(null)
const isProjectTodoAllDay = ref(false)
const projectTodoStartDateTime = ref('')
const projectTodoEndDateTime = ref('')
const projectTodoStartDateOnly = ref('')
const projectTodoEndDateOnly = ref('')

function initProjectTodoDateTimeState(item: TodoItem | null) {
  if (!item) {
    isProjectTodoAllDay.value = false
    projectTodoStartDateTime.value = ''
    projectTodoEndDateTime.value = ''
    projectTodoStartDateOnly.value = ''
    projectTodoEndDateOnly.value = ''
    return
  }

  if (item.startTime || item.dueTime) {
    isProjectTodoAllDay.value = false
  } else if (item.startDate || item.dueDate) {
    isProjectTodoAllDay.value = true
  } else {
    isProjectTodoAllDay.value = false
  }

  if (item.startDate) {
    projectTodoStartDateTime.value = item.startTime
      ? `${item.startDate}T${item.startTime}`
      : `${item.startDate}T09:00`
    projectTodoStartDateOnly.value = item.startDate
  } else {
    projectTodoStartDateTime.value = ''
    projectTodoStartDateOnly.value = ''
  }

  if (item.dueDate) {
    projectTodoEndDateTime.value = item.dueTime
      ? `${item.dueDate}T${item.dueTime}`
      : `${item.dueDate}T18:00`
    projectTodoEndDateOnly.value = item.dueDate
  } else {
    projectTodoEndDateTime.value = ''
    projectTodoEndDateOnly.value = ''
  }
}

function handleProjectTodoAllDayChange() {
  if (isProjectTodoAllDay.value) {
    if (projectTodoStartDateTime.value) {
      projectTodoStartDateOnly.value = projectTodoStartDateTime.value.split('T')[0]
    }
    if (projectTodoEndDateTime.value) {
      projectTodoEndDateOnly.value = projectTodoEndDateTime.value.split('T')[0]
    }
  } else {
    if (projectTodoStartDateOnly.value) {
      projectTodoStartDateTime.value = `${projectTodoStartDateOnly.value}T09:00`
    }
    if (projectTodoEndDateOnly.value) {
      projectTodoEndDateTime.value = `${projectTodoEndDateOnly.value}T18:00`
    }
  }
}

function clearProjectTodoStart() {
  projectTodoStartDateTime.value = ''
  projectTodoStartDateOnly.value = ''
}

function clearProjectTodoEnd() {
  projectTodoEndDateTime.value = ''
  projectTodoEndDateOnly.value = ''
}

function handleQuickUpdateProjectTodoImportance(payload: { id: string; importance: number }) {
  const item = props.todos.find((t) => t.id === payload.id)
  if (item) {
    const { children, ...cleanItem } = item
    emit('save-todo', {
      ...cleanItem,
      importance: normalizePriority(payload.importance),
    })
  }
}

function handleOpenTodoDetails(item: TodoItem) {
  const { children, ...cleanItem } = item
  editingProjectTodo.value = {
    ...JSON.parse(JSON.stringify(cleanItem)),
    importance: normalizePriority(item.importance),
  }
  initProjectTodoDateTimeState(item)
}

function saveProjectTodoDetails() {
  if (editingProjectTodo.value) {
    const { children, ...cleanItem } = editingProjectTodo.value
    let startDate: string | undefined
    let startTime: string | undefined
    let dueDate: string | undefined
    let dueTime: string | undefined

    if (isProjectTodoAllDay.value) {
      startDate = projectTodoStartDateOnly.value?.trim() || undefined
      startTime = undefined
      dueDate = projectTodoEndDateOnly.value?.trim() || undefined
      dueTime = undefined
    } else {
      if (projectTodoStartDateTime.value) {
        const [d, t] = projectTodoStartDateTime.value.split('T')
        startDate = d?.trim() || undefined
        startTime = t?.trim() || undefined
      }
      if (projectTodoEndDateTime.value) {
        const [d, t] = projectTodoEndDateTime.value.split('T')
        dueDate = d?.trim() || undefined
        dueTime = t?.trim() || undefined
      }
    }

    emit('save-todo', {
      ...cleanItem,
      startDate,
      startTime,
      dueDate,
      dueTime,
      importance: normalizePriority(cleanItem.importance),
    })
    editingProjectTodo.value = null
  }
}

function handleDeleteTodoItem(id: string) {
  const idsToDelete = getDescendantTodoIds(props.todos, id)
  const childCount = idsToDelete.length - 1
  const message = childCount > 0
    ? `确定删除该待办项及其 ${childCount} 个子项吗？`
    : '确定删除该待办项吗？'

  if (confirm(message)) {
    emit('delete-todo', id)
  }
}

function handleDeleteHabitItem(id: string) {
  if (confirm('确定删除该习惯吗？')) {
    emit('delete-habit', id)
  }
}

function handleDeleteScheduleItem(id: string) {
  if (confirm('确定删除此日程吗？删除后日历中该事项也将同步移除。')) {
    emit('delete-schedule', id)
  }
}

function handleDeleteProject(id: string) {
  if (confirm('确定删除此项目？项目内的日程、习惯和待办将一并清理。')) {
    emit('delete-project', id)
    activeProject.value = null
  }
}

const showNewProjectModal = ref(false)
const modalAreaId = ref('')
const modalProjectTitle = ref('')
const modalProjectColor = ref('#3b82f6')
const colorOptions = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b']

function openNewProjectModal(defaultAreaId?: string) {
  if (props.areas.length === 0) {
    showAddAreaModal.value = true
    return
  }
  modalAreaId.value = defaultAreaId || props.areas[0]?.id || ''
  modalProjectTitle.value = ''
  modalProjectColor.value = '#3b82f6'
  showNewProjectModal.value = true
}

function handleSaveNewProject() {
  if (!modalProjectTitle.value.trim() || !modalAreaId.value) return
  emit('save-project', {
    areaId: modalAreaId.value,
    title: modalProjectTitle.value.trim(),
    color: modalProjectColor.value,
    order: getProjectsByArea(modalAreaId.value).length,
  })
  showNewProjectModal.value = false
}

const showAddAreaModal = ref(false)
const newAreaTitle = ref('')

function handleSaveNewArea() {
  if (!newAreaTitle.value.trim()) return
  emit('save-area', {
    title: newAreaTitle.value.trim(),
    order: props.areas.length,
  })
  newAreaTitle.value = ''
  showAddAreaModal.value = false
}

function handleEditArea(area: Area) {
  const updated = prompt('重命名领域：', area.title)
  if (updated && updated.trim() && updated !== area.title) {
    emit('save-area', { ...area, title: updated.trim() })
  }
}

function handleDeleteAreaClick(area: Area) {
  const projectCount = getProjectsByArea(area.id).length
  const confirmMsg = projectCount > 0
    ? `确定删除领域「${area.title}」吗？该领域下的 ${projectCount} 个项目及关联内容将一并删除。`
    : `确定删除领域「${area.title}」吗？`
  if (confirm(confirmMsg)) {
    emit('delete-area', area.id)
  }
}
</script>
