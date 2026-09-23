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
              固定日程与时间规约
            </h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium">
              共 {{ filteredSchedules.length }} 项
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            结构化管理单次特定时点、每周固定例会与每月固定规约排期
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
        @click="activeCategory = 'weekly'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
          activeCategory === 'weekly'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>每周规律</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="activeCategory === 'weekly' ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ weeklySchedules.length }}
        </span>
      </button>

      <button
        @click="activeCategory = 'none'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
          activeCategory === 'none'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <Target class="w-3.5 h-3.5" />
        <span>单次特定</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="activeCategory === 'none' ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ onceSchedules.length }}
        </span>
      </button>

      <button
        @click="activeCategory = 'monthly'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
          activeCategory === 'monthly'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <CalendarRange class="w-3.5 h-3.5" />
        <span>每月固定</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="activeCategory === 'monthly' ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
          {{ monthlySchedules.length }}
        </span>
      </button>
    </div>

    <!-- Categorized Boards -->
    <div class="space-y-6">
      <!-- 1. 每周规律日程 (Weekly Recurring) -->
      <section
        v-if="activeCategory === 'all' || activeCategory === 'weekly'"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3.5"
      >
        <!-- Section Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <RotateCcw class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  每周规律日程
                </h3>
                <span class="text-[11px] px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                  {{ weeklySchedules.length }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400">
                按自然周周期循环，如周期例会、定期复盘与运动等
              </p>
            </div>
          </div>

          <button
            @click="openCreateModal('weekly')"
            class="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>加每周日程</span>
          </button>
        </div>

        <!-- Cards Grid -->
        <div v-if="weeklySchedules.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="s in weeklySchedules"
            :key="s.id"
            @click="openEditModal(s)"
            class="group p-3.5 rounded-xl border border-indigo-100/90 dark:border-indigo-950/70 bg-gradient-to-br from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between cursor-pointer"
          >
            <div>
              <!-- Timing & Project Badges -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                    {{ formatWeekday(s.recurringDayOfWeek) }}
                  </span>
                  <span v-if="s.time" class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                    <Clock class="w-3 h-3 text-slate-400" />
                    {{ s.time }}
                  </span>
                  <span v-else class="text-[11px] text-slate-400">
                    全天时段
                  </span>
                </div>

                <div v-if="getProject(s.projectId)" class="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: getProjectColor(s.projectId) }"
                  ></span>
                  <span class="truncate max-w-[90px]">{{ getProjectName(s.projectId) }}</span>
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
          class="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5"
        >
          <p class="text-xs text-slate-400">暂无每周规律日程，添加您的周期固定例会与事项</p>
          <button
            @click="openCreateModal('weekly')"
            class="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加每周规律日程</span>
          </button>
        </div>
      </section>

      <!-- 2. 单次特定日程 (Once) -->
      <section
        v-if="activeCategory === 'all' || activeCategory === 'none'"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3.5"
      >
        <!-- Section Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Target class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  单次特定日程
                </h3>
                <span class="text-[11px] px-2 py-0.2 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-mono font-medium">
                  {{ onceSchedules.length }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400">
                特定日期发生的单次重要预约、考试、面谈或里程碑节点
              </p>
            </div>
          </div>

          <button
            @click="openCreateModal('none')"
            class="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>加单次日程</span>
          </button>
        </div>

        <!-- Cards Grid -->
        <div v-if="onceSchedules.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="s in onceSchedules"
            :key="s.id"
            @click="openEditModal(s)"
            class="group p-3.5 rounded-xl border border-teal-100/90 dark:border-teal-950/70 bg-gradient-to-br from-teal-50/40 to-white dark:from-teal-950/20 dark:to-slate-900 hover:border-teal-300 dark:hover:border-teal-800 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between cursor-pointer"
          >
            <div>
              <!-- Timing & Project Badges -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-mono">
                    {{ formatDisplayDateOnly(s.date) }}
                  </span>
                  <span v-if="s.time" class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                    <Clock class="w-3 h-3 text-slate-400" />
                    {{ s.time }}
                  </span>
                  <span
                    v-if="s.date && formatDaysDiff(s.date)"
                    :class="[
                      'text-[10px] px-1.5 py-0.2 rounded font-medium',
                      formatDaysDiff(s.date)?.urgentClass
                    ]"
                  >
                    {{ formatDaysDiff(s.date)?.text }}
                  </span>
                </div>

                <div v-if="getProject(s.projectId)" class="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: getProjectColor(s.projectId) }"
                  ></span>
                  <span class="truncate max-w-[90px]">{{ getProjectName(s.projectId) }}</span>
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
          class="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5"
        >
          <p class="text-xs text-slate-400">暂无特定日期的单次日程</p>
          <button
            @click="openCreateModal('none')"
            class="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加单次特定日程</span>
          </button>
        </div>
      </section>

      <!-- 3. 每月规律日程 (Monthly Recurring) -->
      <section
        v-if="activeCategory === 'all' || activeCategory === 'monthly'"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3.5"
      >
        <!-- Section Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarRange class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  每月规律日程
                </h3>
                <span class="text-[11px] px-2 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-mono font-medium">
                  {{ monthlySchedules.length }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400">
                按月度固定日期循环，如每月发薪日、房租账单、月末资产盘点等
              </p>
            </div>
          </div>

          <button
            @click="openCreateModal('monthly')"
            class="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>加每月日程</span>
          </button>
        </div>

        <!-- Cards Grid -->
        <div v-if="monthlySchedules.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="s in monthlySchedules"
            :key="s.id"
            @click="openEditModal(s)"
            class="group p-3.5 rounded-xl border border-amber-100/90 dark:border-amber-950/70 bg-gradient-to-br from-amber-50/40 to-white dark:from-amber-950/20 dark:to-slate-900 hover:border-amber-300 dark:hover:border-amber-800 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between cursor-pointer"
          >
            <div>
              <!-- Timing & Project Badges -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-mono">
                    每月 {{ s.recurringDayOfMonth }} 号
                  </span>
                  <span v-if="s.time" class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                    <Clock class="w-3 h-3 text-slate-400" />
                    {{ s.time }}
                  </span>
                  <span v-else class="text-[11px] text-slate-400">
                    全天时段
                  </span>
                </div>

                <div v-if="getProject(s.projectId)" class="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: getProjectColor(s.projectId) }"
                  ></span>
                  <span class="truncate max-w-[90px]">{{ getProjectName(s.projectId) }}</span>
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
          class="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5"
        >
          <p class="text-xs text-slate-400">暂无每月规律日程</p>
          <button
            @click="openCreateModal('monthly')"
            class="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加每月规律日程</span>
          </button>
        </div>
      </section>
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
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              placeholder="例如：周一团队例会、发薪日、季度总结..."
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

          <!-- Recurring Type -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              周期规约类型
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="formRecurringType = 'weekly'"
                :class="[
                  'py-2 px-1 text-center rounded-xl border text-xs font-medium transition-all cursor-pointer',
                  formRecurringType === 'weekly'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                ]"
              >
                每周规律
              </button>

              <button
                type="button"
                @click="formRecurringType = 'none'"
                :class="[
                  'py-2 px-1 text-center rounded-xl border text-xs font-medium transition-all cursor-pointer',
                  formRecurringType === 'none'
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                ]"
              >
                单次特定
              </button>

              <button
                type="button"
                @click="formRecurringType = 'monthly'"
                :class="[
                  'py-2 px-1 text-center rounded-xl border text-xs font-medium transition-all cursor-pointer',
                  formRecurringType === 'monthly'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                ]"
              >
                每月固定
              </button>
            </div>
          </div>

          <!-- Dynamic Field: Weekly Day Picker -->
          <div v-if="formRecurringType === 'weekly'" class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              触发星期
            </label>
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="opt in weekdayOptions"
                :key="opt.value"
                type="button"
                @click="formDayOfWeek = opt.value"
                :class="[
                  'py-1.5 text-center rounded-lg border text-xs font-medium transition-all cursor-pointer',
                  formDayOfWeek === opt.value
                    ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                ]"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Dynamic Field: Specific Date Picker -->
          <div v-else-if="formRecurringType === 'none'" class="space-y-1">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              日程日期
            </label>
            <input
              v-model="formDate"
              type="date"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <!-- Dynamic Field: Monthly Day Picker -->
          <div v-else-if="formRecurringType === 'monthly'" class="space-y-1">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              每月几号 (1 - 31 日)
            </label>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">每月</span>
              <input
                v-model.number="formDayOfMonth"
                type="number"
                min="1"
                max="31"
                class="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span class="text-xs text-slate-500">日触发</span>
            </div>
          </div>

          <!-- Time Picker -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>开始时间点 (可选)</span>
              <span class="text-[10px] text-slate-400 font-normal">留空代表全天</span>
            </label>
            <input
              v-model="formTime"
              type="time"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
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
import { ref, computed } from 'vue'
import {
  CalendarDays,
  Plus,
  Clock,
  RotateCcw,
  Target,
  CalendarRange,
  ChevronDown,
  Pencil,
  Trash2,
  X,
} from 'lucide-vue-next'
import type { ScheduleItem, Project, ScheduleRecurringType } from '@/types'
import { formatDate, parseDate } from '@/utils/date'

const props = defineProps<{
  schedules: ScheduleItem[]
  projects: Project[]
}>()

const emit = defineEmits<{
  (e: 'save-schedule', data: Partial<ScheduleItem>): void
  (e: 'delete-schedule', id: string): void
}>()

const selectedProjectId = ref<string>('all')
const activeCategory = ref<'all' | 'weekly' | 'none' | 'monthly'>('all')

const filteredSchedules = computed(() => {
  if (selectedProjectId.value === 'all') {
    return props.schedules
  }
  return props.schedules.filter((s) => s.projectId === selectedProjectId.value)
})

// 周日（0）权重设为 7，确保按周一至周日顺序显示
const weekdayOrderWeight: Record<number, number> = {
  1: 1, // 周一
  2: 2, // 周二
  3: 3, // 周三
  4: 4, // 周四
  5: 5, // 周五
  6: 6, // 周六
  0: 7, // 周日
}

const weekdayOptions = [
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
  { value: 0, label: '日' },
]

// 1. 每周规律日程
const weeklySchedules = computed(() => {
  const list = filteredSchedules.value.filter((s) => s.recurringType === 'weekly')
  return [...list].sort((a, b) => {
    const wA = a.recurringDayOfWeek !== undefined ? (weekdayOrderWeight[a.recurringDayOfWeek] ?? 7) : 7
    const wB = b.recurringDayOfWeek !== undefined ? (weekdayOrderWeight[b.recurringDayOfWeek] ?? 7) : 7
    if (wA !== wB) return wA - wB
    return (a.time || '').localeCompare(b.time || '')
  })
})

// 2. 单次特定日程
const onceSchedules = computed(() => {
  const list = filteredSchedules.value.filter((s) => s.recurringType === 'none' || !s.recurringType)
  return [...list].sort((a, b) => {
    const dateComp = (a.date || '').localeCompare(b.date || '')
    if (dateComp !== 0) return dateComp
    return (a.time || '').localeCompare(b.time || '')
  })
})

// 3. 每月规律日程
const monthlySchedules = computed(() => {
  const list = filteredSchedules.value.filter((s) => s.recurringType === 'monthly')
  return [...list].sort((a, b) => {
    const mA = a.recurringDayOfMonth ?? 1
    const mB = b.recurringDayOfMonth ?? 1
    if (mA !== mB) return mA - mB
    return (a.time || '').localeCompare(b.time || '')
  })
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

function formatWeekday(dayOfWeek?: number): string {
  const names: Record<number, string> = {
    1: '每周一',
    2: '每周二',
    3: '每周三',
    4: '每周四',
    5: '每周五',
    6: '每周六',
    0: '每周日',
  }
  return dayOfWeek !== undefined && names[dayOfWeek] ? names[dayOfWeek] : '每周'
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
const formRecurringType = ref<ScheduleRecurringType>('weekly')
const formDate = ref(formatDate(new Date()))
const formDayOfWeek = ref<number>(1)
const formDayOfMonth = ref<number>(1)
const formTime = ref('')

function openCreateModal(defaultType: ScheduleRecurringType = 'weekly') {
  editingId.value = null
  formTitle.value = ''
  formProjectId.value = selectedProjectId.value === 'all' ? null : selectedProjectId.value
  formRecurringType.value = defaultType
  formDate.value = formatDate(new Date())
  formDayOfWeek.value = 1
  formDayOfMonth.value = 1
  formTime.value = ''
  showModal.value = true
}

function openEditModal(s: ScheduleItem) {
  editingId.value = s.id
  formTitle.value = s.title
  formProjectId.value = s.projectId || null
  formRecurringType.value = s.recurringType || 'none'
  formDate.value = s.date || formatDate(new Date())
  formDayOfWeek.value = s.recurringDayOfWeek !== undefined ? s.recurringDayOfWeek : 1
  formDayOfMonth.value = s.recurringDayOfMonth !== undefined ? s.recurringDayOfMonth : 1
  formTime.value = s.time || ''
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

  const payload: Partial<ScheduleItem> = {
    title: formTitle.value.trim(),
    projectId: formProjectId.value,
    recurringType: formRecurringType.value,
    time: formTime.value.trim() || undefined,
  }

  if (editingId.value) {
    payload.id = editingId.value
  }

  if (formRecurringType.value === 'none') {
    payload.date = formDate.value
    payload.recurringDayOfWeek = undefined
    payload.recurringDayOfMonth = undefined
  } else if (formRecurringType.value === 'weekly') {
    payload.date = undefined
    payload.recurringDayOfWeek = formDayOfWeek.value
    payload.recurringDayOfMonth = undefined
  } else if (formRecurringType.value === 'monthly') {
    payload.date = undefined
    payload.recurringDayOfWeek = undefined
    payload.recurringDayOfMonth = formDayOfMonth.value
  }

  emit('save-schedule', payload)
  closeModal()
}
</script>
