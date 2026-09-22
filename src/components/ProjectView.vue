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

      <div class="flex items-center gap-2">
        <button
          @click="openNewProjectModal()"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>新建项目</span>
        </button>

        <button
          @click="showAddAreaModal = true"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
        >
          <FolderPlus class="w-3.5 h-3.5" />
          <span>新建领域</span>
        </button>
      </div>
    </div>

    <div v-if="areas.length === 0" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3 shadow-sm">
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

    <div v-else class="space-y-6">
      <div
        v-for="area in sortedAreas"
        :key="area.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm"
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ area.title }}</span>
            <span class="text-xs text-slate-400">({{ getProjectsByArea(area.id).length }})</span>
          </div>

          <div class="flex items-center gap-1">
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
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <div class="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div class="flex items-center gap-3 flex-1 min-w-0">
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

          <div class="flex items-center gap-2">
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

        <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
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
              <div class="flex items-center gap-2">
                <select
                  v-model="newHabitFrequency"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                >
                  <option value="daily">每日习惯</option>
                  <option value="weekly">每周习惯</option>
                  <option value="biweekly">每两周 (双周)</option>
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
              >
                <div class="flex items-center gap-2.5">
                  <div
                    :class="[
                      'w-4 h-4 rounded border flex items-center justify-center transition-all',
                      isHabitDoneToday(h.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    ]"
                  >
                    <Check v-if="isHabitDoneToday(h.id)" class="w-3 h-3 stroke-[3]" />
                  </div>
                  <span :class="['font-medium', isHabitDoneToday(h.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200']">
                    {{ h.title }}
                  </span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {{ formatFrequency(h.frequency) }}
                  </span>
                </div>

                <button
                  @click.stop="$emit('delete-habit', h.id)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
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

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  v-model="newScheduleRecurringType"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                >
                  <option value="none">特定日期</option>
                  <option value="weekly">每周重复</option>
                  <option value="monthly">每月重复</option>
                </select>

                <input
                  v-if="newScheduleRecurringType === 'none'"
                  v-model="newScheduleDate"
                  type="date"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />

                <select
                  v-if="newScheduleRecurringType === 'weekly'"
                  v-model.number="newScheduleDayOfWeek"
                  class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                >
                  <option :value="1">周一</option>
                  <option :value="2">周二</option>
                  <option :value="3">周三</option>
                  <option :value="4">周四</option>
                  <option :value="5">周五</option>
                  <option :value="6">周六</option>
                  <option :value="0">周日</option>
                </select>

                <div v-if="newScheduleRecurringType === 'monthly'" class="flex items-center gap-1">
                  <span class="text-slate-400">每月</span>
                  <input
                    v-model.number="newScheduleDayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    class="w-14 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center"
                  />
                  <span class="text-slate-400">日</span>
                </div>

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
                  @click="$emit('delete-schedule', s.id)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600"
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showNewProjectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">新建项目</h3>
          <button @click="showNewProjectModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">所属领域</label>
            <select
              v-model="modalAreaId"
              class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
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
              class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              @keyup.enter="handleSaveNewProject"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">主题颜色</label>
            <div class="flex items-center gap-2">
              <button
                v-for="c in colorOptions"
                :key="c"
                type="button"
                @click="modalProjectColor = c"
                class="w-6 h-6 rounded-full border-2 transition-transform"
                :class="modalProjectColor === c ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent'"
                :style="{ backgroundColor: c }"
              ></button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="showNewProjectModal = false"
            class="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700"
          >
            取消
          </button>
          <button
            @click="handleSaveNewProject"
            class="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddAreaModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">新建领域</h3>
          <button @click="showAddAreaModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <input
          v-model="newAreaTitle"
          type="text"
          placeholder="领域名称..."
          class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          @keyup.enter="handleSaveNewArea"
        />

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="showAddAreaModal = false"
            class="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700"
          >
            取消
          </button>
          <button
            @click="handleSaveNewArea"
            class="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="editingProjectTodo" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">设置待办属性</h3>
          <button @click="editingProjectTodo = null" class="text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">待办名称</label>
            <input
              v-model="editingProjectTodo.title"
              type="text"
              class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300">重要程度 (1 - 10)</label>
              <span class="text-xs font-mono font-bold text-blue-600">P{{ editingProjectTodo.importance || 5 }}</span>
            </div>
            <input
              v-model.number="editingProjectTodo.importance"
              type="range"
              min="1"
              max="10"
              class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">开始日期</label>
              <input
                v-model="editingProjectTodo.startDate"
                type="date"
                class="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">截止日期</label>
              <input
                v-model="editingProjectTodo.dueDate"
                type="date"
                class="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">备注信息</label>
            <textarea
              v-model="editingProjectTodo.notes"
              rows="2"
              placeholder="补充说明..."
              class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="editingProjectTodo = null"
            class="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700"
          >
            取消
          </button>
          <button
            @click="saveProjectTodoDetails"
            class="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            保存
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
  Trash2,
  X,
  ChevronRight,
  Sparkles,
  CalendarDays,
  Calendar,
  CheckSquare,
  Check,
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
  ScheduleRecurringType,
} from '@/types'
import { buildTodoTree } from '@/utils/tree'
import { formatDate } from '@/utils/date'

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
  (e: 'save-project', project: Partial<Project>): void
  (e: 'delete-project', id: string): void
  (e: 'save-schedule', schedule: Partial<ScheduleItem>): void
  (e: 'delete-schedule', id: string): void
  (e: 'save-habit', habit: Partial<Habit>): void
  (e: 'delete-habit', id: string): void
  (e: 'toggle-habit', payload: { habitId: string; date: string }): void
  (e: 'save-todo', item: Partial<TodoItem>): void
  (e: 'delete-todo', id: string): void
}>()

const todayStr = formatDate(new Date())

const sortedAreas = computed(() => {
  return [...props.areas].sort((a, b) => a.order - b.order)
})

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
    biweekly: '双周',
    monthly: '每月',
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

function handleCreateProjectHabit() {
  if (!activeProject.value || !newHabitTitle.value.trim()) return
  emit('save-habit', {
    projectId: activeProject.value.id,
    title: newHabitTitle.value.trim(),
    frequency: newHabitFrequency.value,
    timeSlot: newHabitSlot.value,
    timingType: 'anytime',
  })
  newHabitTitle.value = ''
  showAddHabitInline.value = false
}

const showAddScheduleInline = ref(false)
const newScheduleTitle = ref('')
const newScheduleRecurringType = ref<ScheduleRecurringType>('none')
const newScheduleDate = ref('')
const newScheduleTime = ref('')
const newScheduleDayOfWeek = ref(3)
const newScheduleDayOfMonth = ref(10)

function handleCreateProjectSchedule() {
  if (!activeProject.value || !newScheduleTitle.value.trim()) return
  emit('save-schedule', {
    projectId: activeProject.value.id,
    title: newScheduleTitle.value.trim(),
    recurringType: newScheduleRecurringType.value,
    date: newScheduleRecurringType.value === 'none' ? newScheduleDate.value : undefined,
    time: newScheduleTime.value || undefined,
    recurringDayOfWeek: newScheduleRecurringType.value === 'weekly' ? newScheduleDayOfWeek.value : undefined,
    recurringDayOfMonth: newScheduleRecurringType.value === 'monthly' ? newScheduleDayOfMonth.value : undefined,
  })
  newScheduleTitle.value = ''
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
  if (item) {
    emit('save-todo', { ...item, completed: !item.completed })
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

function handleOpenTodoDetails(item: TodoItem) {
  editingProjectTodo.value = JSON.parse(JSON.stringify(item))
}

function saveProjectTodoDetails() {
  if (editingProjectTodo.value) {
    emit('save-todo', editingProjectTodo.value)
    editingProjectTodo.value = null
  }
}

function handleDeleteTodoItem(id: string) {
  if (confirm('确定删除该待办项？')) {
    emit('delete-todo', id)
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
