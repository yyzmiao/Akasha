<template>
  <div>
    <!-- Top Header -->
    <header class="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-8 py-2.5 transition-colors">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="font-bold text-base sm:text-base tracking-tight text-slate-900 dark:text-white font-mono select-none">
            Akasha
          </span>

          <!-- Desktop Quick Actions -->
          <div class="hidden md:flex items-center gap-1">
            <div class="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

            <button
              @click="$emit('open-search')"
              class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="全局检索 (Ctrl+K)"
            >
              <Search class="w-4 h-4" />
            </button>

            <button
              @click="$emit('open-settings')"
              class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="设置"
            >
              <Settings class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Desktop Center Navigation Tabs -->
        <nav class="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs sm:text-sm">
          <button
            @click="$emit('update:activeTab', 'calendar')"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <Calendar class="w-4 h-4" />
            <span>日历</span>
          </button>

          <button
            @click="$emit('update:activeTab', 'projects')"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'projects'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <FolderKanban class="w-4 h-4" />
            <span>项目</span>
          </button>

          <button
            @click="$emit('update:activeTab', 'todos')"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'todos'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <CheckSquare class="w-4 h-4" />
            <span>待办</span>
          </button>

          <button
            @click="$emit('update:activeTab', 'habits')"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'habits'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <Sparkles class="w-4 h-4" />
            <span>习惯</span>
          </button>

          <button
            @click="$emit('update:activeTab', 'journal')"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'journal'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <BookOpen class="w-4 h-4" />
            <span>日记</span>
          </button>
        </nav>

        <!-- Right Side: Tools (Desktop theme toggle, Mobile full tools) -->
        <div class="flex items-center gap-1 sm:gap-2">
          <!-- Mobile Only Search Button -->
          <button
            @click="$emit('open-search')"
            class="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="全局检索"
            aria-label="全局检索"
          >
            <Search class="w-4 h-4" />
          </button>

          <!-- Theme Toggle (Both Mobile & Desktop) -->
          <button
            @click="$emit('toggle-theme')"
            :title="isDark ? '切换白天模式' : '切换暗色模式'"
            aria-label="切换主题"
            class="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Sun v-if="isDark" class="w-4 h-4" />
            <Moon v-else class="w-4 h-4" />
          </button>

          <!-- Mobile Only Settings Button -->
          <button
            @click="$emit('open-settings')"
            class="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="设置"
            aria-label="设置"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Fixed Bottom TabBar -->
    <nav
      class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] transition-colors"
    >
      <div class="grid grid-cols-5 h-13 sm:h-14 items-center px-1">
        <button
          @click="$emit('update:activeTab', 'calendar')"
          :class="[
            'flex flex-col items-center justify-center py-1 transition-all rounded-lg active:scale-95',
            activeTab === 'calendar'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <div :class="['p-1 rounded-md transition-colors', activeTab === 'calendar' ? 'bg-blue-50 dark:bg-blue-950/60' : '']">
            <Calendar class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] mt-0.5 leading-none">日历</span>
        </button>

        <button
          @click="$emit('update:activeTab', 'projects')"
          :class="[
            'flex flex-col items-center justify-center py-1 transition-all rounded-lg active:scale-95',
            activeTab === 'projects'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <div :class="['p-1 rounded-md transition-colors', activeTab === 'projects' ? 'bg-blue-50 dark:bg-blue-950/60' : '']">
            <FolderKanban class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] mt-0.5 leading-none">项目</span>
        </button>

        <button
          @click="$emit('update:activeTab', 'todos')"
          :class="[
            'flex flex-col items-center justify-center py-1 transition-all rounded-lg active:scale-95',
            activeTab === 'todos'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <div :class="['p-1 rounded-md transition-colors', activeTab === 'todos' ? 'bg-blue-50 dark:bg-blue-950/60' : '']">
            <CheckSquare class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] mt-0.5 leading-none">待办</span>
        </button>

        <button
          @click="$emit('update:activeTab', 'habits')"
          :class="[
            'flex flex-col items-center justify-center py-1 transition-all rounded-lg active:scale-95',
            activeTab === 'habits'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <div :class="['p-1 rounded-md transition-colors', activeTab === 'habits' ? 'bg-blue-50 dark:bg-blue-950/60' : '']">
            <Sparkles class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] mt-0.5 leading-none">习惯</span>
        </button>

        <button
          @click="$emit('update:activeTab', 'journal')"
          :class="[
            'flex flex-col items-center justify-center py-1 transition-all rounded-lg active:scale-95',
            activeTab === 'journal'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <div :class="['p-1 rounded-md transition-colors', activeTab === 'journal' ? 'bg-blue-50 dark:bg-blue-950/60' : '']">
            <BookOpen class="w-4.5 h-4.5" />
          </div>
          <span class="text-[10px] mt-0.5 leading-none">日记</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  Calendar,
  FolderKanban,
  CheckSquare,
  Sparkles,
  BookOpen,
  Search,
  Settings,
  Sun,
  Moon,
} from 'lucide-vue-next'
import type { ActiveTab } from '@/types'

defineProps<{
  activeTab: ActiveTab
  isDark: boolean
}>()

defineEmits<{
  (e: 'update:activeTab', tab: ActiveTab): void
  (e: 'open-settings'): void
  (e: 'open-search'): void
  (e: 'toggle-theme'): void
}>()
</script>
