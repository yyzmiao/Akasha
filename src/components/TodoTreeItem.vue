<template>
  <div class="space-y-1">
    <div
      :class="[
        'group flex items-start sm:items-center justify-between py-2 sm:py-1.5 px-2 rounded-lg transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-xs sm:text-sm',
        item.completed ? 'opacity-60' : '',
        depth > 0 ? 'border-l-2 border-slate-200/80 dark:border-slate-800 sm:border-l-0' : ''
      ]"
      :style="{ paddingLeft: paddingLeftStyle }"
    >
      <div class="flex items-start sm:items-center gap-2 flex-1 min-w-0 pt-0.5 sm:pt-0">
        <!-- Collapse/Expand Arrow -->
        <button
          v-if="item.children && item.children.length > 0"
          @click="$emit('toggle-collapse', item.id)"
          class="p-1 -ml-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
          aria-label="展开或折叠子任务"
        >
          <ChevronDown v-if="!item.collapsed" class="w-3.5 h-3.5" />
          <ChevronRight v-else class="w-3.5 h-3.5" />
        </button>
        <span v-else class="w-3 sm:w-3.5 inline-block shrink-0"></span>

        <!-- Checkbox with comfortable touch area -->
        <label class="flex items-center justify-center p-0.5 cursor-pointer shrink-0">
          <input
            type="checkbox"
            :checked="item.completed"
            @change="$emit('toggle-complete', item.id)"
            class="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-0 cursor-pointer"
          />
        </label>

        <!-- Title and Badges Area -->
        <div class="flex-1 min-w-0 flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1">
          <input
            v-if="isEditing"
            ref="editInputRef"
            v-model="editingTitle"
            @blur="saveTitle"
            @keyup.enter="saveTitle"
            class="w-full px-2 py-1 text-xs sm:text-sm rounded border border-blue-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
          />
          <span
            v-else
            @dblclick="startEdit"
            :class="[
              'font-medium cursor-text select-text break-words sm:truncate max-w-full',
              item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100',
              depth === 0 ? 'font-semibold text-sm' : ''
            ]"
            :title="item.title"
          >
            {{ item.title }}
          </span>

          <!-- Meta Badges (Project, Importance, Due Date) -->
          <div class="flex items-center gap-1.5 flex-wrap shrink-0">
            <span
              v-if="project"
              class="px-1.5 py-0.2 rounded text-[10px] font-medium shrink-0"
              :style="{
                backgroundColor: (project.color || '#3b82f6') + '20',
                color: project.color || '#3b82f6'
              }"
            >
              {{ project.title }}
            </span>

            <span
              v-if="item.importance"
              :class="[
                'px-1.5 py-0.2 rounded text-[10px] font-mono font-bold shrink-0',
                item.importance >= 8
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                  : item.importance >= 5
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              ]"
              :title="`重要度: ${item.importance}/10`"
            >
              P{{ item.importance }}
            </span>

            <span
              v-if="item.dueDate"
              class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 shrink-0"
              :title="`截止日期: ${item.dueDate}`"
            >
              📅 {{ item.dueDate.slice(5) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons: Accessible on mobile, hover-reveal on desktop -->
      <div class="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-1">
        <button
          @click="$emit('add-child', item.id)"
          class="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs flex items-center gap-0.5 transition-colors"
          title="添加子任务"
        >
          <Plus class="w-3.5 h-3.5" />
          <span class="text-[11px] hidden sm:inline">子任务</span>
        </button>

        <button
          @click="$emit('edit-details', item)"
          class="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="属性设置"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
        </button>

        <button
          @click="$emit('delete-item', item.id)"
          class="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="删除"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div v-if="!item.collapsed && item.children && item.children.length > 0" class="space-y-1">
      <TodoTreeItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :depth="depth + 1"
        :projects="projects"
        @toggle-complete="$emit('toggle-complete', $event)"
        @toggle-collapse="$emit('toggle-collapse', $event)"
        @add-child="$emit('add-child', $event)"
        @edit-title="handleChildEditTitle"
        @edit-details="$emit('edit-details', $event)"
        @delete-item="$emit('delete-item', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Trash2,
} from 'lucide-vue-next'
import type { TodoItem, Project } from '@/types'

const props = defineProps<{
  item: TodoItem
  depth: number
  projects?: Project[]
}>()

const isMobile = ref(false)

function checkMobile() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const paddingLeftStyle = computed(() => {
  if (props.depth === 0) return '0.5rem'
  if (isMobile.value) {
    return `${Math.min(props.depth * 10, 30) + 4}px`
  }
  return `${props.depth * 20 + 8}px`
})

const project = computed(() => {
  if (!props.projects || !props.item.projectId) return null
  return props.projects.find((p) => p.id === props.item.projectId) || null
})

const emit = defineEmits<{
  (e: 'toggle-complete', id: string): void
  (e: 'toggle-collapse', id: string): void
  (e: 'add-child', parentId: string): void
  (e: 'edit-title', payload: { id: string; title: string }): void
  (e: 'edit-details', item: TodoItem): void
  (e: 'delete-item', id: string): void
}>()

const isEditing = ref(false)
const editingTitle = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  editingTitle.value = props.item.title
  isEditing.value = true
  nextTick(() => {
    editInputRef.value?.focus()
  })
}

function saveTitle() {
  if (isEditing.value) {
    isEditing.value = false
    if (editingTitle.value.trim() && editingTitle.value !== props.item.title) {
      emit('edit-title', { id: props.item.id, title: editingTitle.value.trim() })
    }
  }
}

function handleChildEditTitle(payload: { id: string; title: string }) {
  emit('edit-title', payload)
}
</script>
