<template>
  <div class="space-y-1">
    <div
      :class="[
        'group flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-xs sm:text-sm',
        item.completed ? 'opacity-60' : ''
      ]"
      :style="{ paddingLeft: `${depth * 20 + 8}px` }"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <button
          v-if="item.children && item.children.length > 0"
          @click="$emit('toggle-collapse', item.id)"
          class="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <ChevronDown v-if="!item.collapsed" class="w-3.5 h-3.5" />
          <ChevronRight v-else class="w-3.5 h-3.5" />
        </button>
        <span v-else class="w-3.5 h-3.5 inline-block shrink-0"></span>

        <input
          type="checkbox"
          :checked="item.completed"
          @change="$emit('toggle-complete', item.id)"
          class="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-0 cursor-pointer"
        />

        <div class="flex-1 min-w-0 flex items-center gap-2">
          <input
            v-if="isEditing"
            ref="editInputRef"
            v-model="editingTitle"
            @blur="saveTitle"
            @keyup.enter="saveTitle"
            class="w-full px-1.5 py-0.5 text-xs sm:text-sm rounded border border-blue-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
          />
          <span
            v-else
            @dblclick="startEdit"
            :class="[
              'truncate font-medium cursor-text select-text',
              item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100',
              depth === 0 ? 'font-semibold text-sm' : ''
            ]"
            :title="item.title"
          >
            {{ item.title }}
          </span>

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
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : item.importance >= 5
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600'
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

      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          @click="$emit('add-child', item.id)"
          class="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs flex items-center gap-0.5"
          title="添加子任务"
        >
          <Plus class="w-3.5 h-3.5" />
          <span class="text-[11px] hidden sm:inline">子任务</span>
        </button>

        <button
          @click="$emit('edit-details', item)"
          class="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          title="属性设置"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
        </button>

        <button
          @click="$emit('delete-item', item.id)"
          class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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
import { ref, computed, nextTick } from 'vue'
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
