<template>
  <div class="space-y-4 sm:space-y-5">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare class="w-5 h-5 text-blue-600" />
            <span>待办清单</span>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              共 {{ totalCount }} 项 (已完成 {{ completedCount }})
            </span>
          </h2>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <select
            v-if="projects && projects.length > 0"
            v-model="selectedProjectFilter"
            class="w-full sm:w-auto px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="">全部项目</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input
              v-model="newRootTitle"
              type="text"
              placeholder="新建待办事项..."
              class="flex-1 sm:w-64 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              @keyup.enter="handleAddRoot"
            />
            <button
              @click="handleAddRoot"
              class="shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
            >
              <Plus class="w-4 h-4" />
              <span>添加</span>
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="expandAll(true)"
            class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium"
          >
            全部展开
          </button>
          <button
            @click="expandAll(false)"
            class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium"
          >
            全部折叠
          </button>

          <label class="flex items-center gap-1.5 cursor-pointer select-none ml-1 text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              v-model="hideCompleted"
              class="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
            />
            <span>隐藏已完成</span>
          </label>
        </div>

        <!-- 排序方式 (支持优先级降序/升序实时排序联动) -->
        <div class="flex items-center gap-1.5">
          <ArrowDownUp class="w-3.5 h-3.5 text-slate-400" />
          <select
            v-model="sortBy"
            class="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="default">默认序号</option>
            <option value="importance-desc">优先级从高到低 (P10 ➔ P1)</option>
            <option value="importance-asc">优先级从低到高 (P1 ➔ P10)</option>
            <option value="dueDate">截止日期优先</option>
          </select>
        </div>
      </div>
    </div>

    <div
      v-if="treeData.length === 0"
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 sm:p-12 text-center space-y-2 shadow-sm"
    >
      <div class="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <CheckSquare class="w-5 h-5" />
      </div>
      <p class="text-xs text-slate-400">暂无待办事项</p>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 sm:p-4 space-y-1 shadow-sm overflow-hidden">
      <TodoTreeItem
        v-for="item in filteredTree"
        :key="item.id"
        :item="item"
        :depth="0"
        :projects="projects"
        @toggle-complete="handleToggleComplete"
        @toggle-collapse="handleToggleCollapse"
        @add-child="handleAddChild"
        @edit-title="handleEditTitle"
        @edit-details="handleOpenDetails"
        @delete-item="handleDeleteItem"
        @update-importance="handleQuickUpdateImportance"
      />
    </div>

    <!-- Task Attribute Modal: Center dialog on desktop, Bottom Sheet on mobile -->
    <div
      v-if="editingItem"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-all"
      @click.self="editingItem = null"
    >
      <div class="w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        <!-- Top drag indicator for mobile -->
        <div class="sm:hidden w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2"></div>

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">设置任务属性</h3>
          <button @click="editingItem = null" class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">任务名称</label>
            <input
              v-model="editingItem.title"
              type="text"
              class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div v-if="projects && projects.length > 0">
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">所属项目</label>
            <select
              v-model="editingItem.projectId"
              class="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option :value="null">无项目 (收件箱/杂项)</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300">重要程度 (优先级)</label>
              <span
                v-if="editingItem"
                :class="['px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors', getPriorityStyle(editingItem.importance).badgeClass]"
              >
                P{{ normalizePriority(editingItem.importance) }} · {{ getPriorityStyle(editingItem.importance).label }}
              </span>
            </div>
            <!-- Range Slider -->
            <input
              v-if="editingItem"
              v-model.number="editingItem.importance"
              type="range"
              min="1"
              max="10"
              class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
            />
            <!-- Quick Chips P1 to P10 -->
            <div v-if="editingItem" class="grid grid-cols-5 gap-1.5 pt-1">
              <button
                v-for="p in 10"
                :key="p"
                type="button"
                @click="editingItem.importance = p"
                :class="[
                  'py-1 rounded text-xs font-mono transition-all border text-center',
                  getPriorityStyle(p).badgeClass,
                  normalizePriority(editingItem.importance) === p
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 font-bold scale-105 shadow-xs'
                    : 'opacity-70 hover:opacity-100 active:scale-95'
                ]"
              >
                P{{ p }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">开始日期</label>
              <input
                v-model="editingItem.startDate"
                type="date"
                class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">截止日期 (日历显示)</label>
              <input
                v-model="editingItem.dueDate"
                type="date"
                class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">备注信息</label>
            <textarea
              v-model="editingItem.notes"
              rows="3"
              placeholder="补充说明..."
              class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="editingItem = null"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            取消
          </button>
          <button
            @click="saveDetails"
            class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
import { CheckSquare, Plus, X, ArrowDownUp } from 'lucide-vue-next'
import TodoTreeItem from '@/components/TodoTreeItem.vue'
import type { TodoItem, Project } from '@/types'
import { buildTodoTree } from '@/utils/tree'
import { getPriorityStyle, normalizePriority } from '@/utils/priority'
import confetti from 'canvas-confetti'

const props = defineProps<{
  todos: TodoItem[]
  projects?: Project[]
  targetTodoId?: string | null
}>()

const emit = defineEmits<{
  (e: 'save-todo', item: Partial<TodoItem>): void
  (e: 'delete-todo', id: string): void
  (e: 'batch-update', items: TodoItem[]): void
}>()

const newRootTitle = ref('')
const selectedProjectFilter = ref<string>('')
const hideCompleted = ref(false)
const sortBy = ref<'default' | 'importance-desc' | 'importance-asc' | 'dueDate'>('default')
const editingItem = ref<TodoItem | null>(null)

watch(
  () => props.targetTodoId,
  (newId) => {
    if (newId) {
      const target = props.todos.find((t) => t.id === newId)
      if (target) {
        if (target.projectId && selectedProjectFilter.value && selectedProjectFilter.value !== target.projectId) {
          selectedProjectFilter.value = target.projectId
        }
        const { children, ...cleanTarget } = target
        editingItem.value = {
          ...JSON.parse(JSON.stringify(cleanTarget)),
          importance: normalizePriority(target.importance),
        }
      }
    }
  },
  { immediate: true }
)

const activeTodos = computed(() => {
  if (!selectedProjectFilter.value) return props.todos
  return props.todos.filter((t) => t.projectId === selectedProjectFilter.value)
})

const treeData = computed(() => {
  const tree = buildTodoTree(activeTodos.value)
  if (sortBy.value === 'default') return tree

  const sortFn = (a: TodoItem, b: TodoItem): number => {
    if (sortBy.value === 'importance-desc') {
      const diff = normalizePriority(b.importance) - normalizePriority(a.importance)
      return diff !== 0 ? diff : a.order - b.order
    }
    if (sortBy.value === 'importance-asc') {
      const diff = normalizePriority(a.importance) - normalizePriority(b.importance)
      return diff !== 0 ? diff : a.order - b.order
    }
    if (sortBy.value === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return a.order - b.order
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    }
    return a.order - b.order
  }

  const applySort = (nodes: TodoItem[]): TodoItem[] => {
    const sorted = [...nodes].sort(sortFn)
    return sorted.map((n) => ({
      ...n,
      children: n.children ? applySort(n.children) : [],
    }))
  }

  return applySort(tree)
})

const totalCount = computed(() => activeTodos.value.length)
const completedCount = computed(() => activeTodos.value.filter((t) => t.completed).length)

function filterTreeCompleted(nodes: TodoItem[]): TodoItem[] {
  return nodes
    .filter((n) => !n.completed || (n.children && n.children.some((c) => !c.completed)))
    .map((n) => ({
      ...n,
      children: n.children ? filterTreeCompleted(n.children) : [],
    }))
}

const filteredTree = computed(() => {
  if (!hideCompleted.value) return treeData.value
  return filterTreeCompleted(treeData.value)
})

function handleAddRoot() {
  if (!newRootTitle.value.trim()) return
  emit('save-todo', {
    projectId: selectedProjectFilter.value || null,
    title: newRootTitle.value.trim(),
    parentId: null,
    completed: false,
    order: props.todos.filter((t) => t.parentId === null).length,
    importance: 5,
  })
  newRootTitle.value = ''
}

function handleAddChild(parentId: string) {
  const childTitle = prompt('请输入子代办名称：')
  if (!childTitle || !childTitle.trim()) return

  const parent = props.todos.find((t) => t.id === parentId)
  if (parent && parent.collapsed) {
    emit('save-todo', { ...parent, collapsed: false })
  }

  emit('save-todo', {
    projectId: parent?.projectId || null,
    title: childTitle.trim(),
    parentId,
    completed: false,
    order: props.todos.filter((t) => t.parentId === parentId).length,
    importance: parent?.importance || 5,
  })
}

function handleToggleComplete(id: string) {
  const item = props.todos.find((t) => t.id === id)
  if (!item) return
  const willBeCompleted = !item.completed

  emit('save-todo', {
    ...item,
    completed: willBeCompleted,
  })

  if (willBeCompleted) {
    confetti({ particleCount: 20, spread: 35, origin: { y: 0.8 } })
  }
}

function handleToggleCollapse(id: string) {
  const item = props.todos.find((t) => t.id === id)
  if (item) {
    emit('save-todo', {
      ...item,
      collapsed: !item.collapsed,
    })
  }
}

function handleEditTitle(payload: { id: string; title: string }) {
  const item = props.todos.find((t) => t.id === payload.id)
  if (item) {
    emit('save-todo', {
      ...item,
      title: payload.title,
    })
  }
}

function handleQuickUpdateImportance(payload: { id: string; importance: number }) {
  const item = props.todos.find((t) => t.id === payload.id)
  if (item) {
    const { children, ...cleanItem } = item
    emit('save-todo', {
      ...cleanItem,
      importance: normalizePriority(payload.importance),
    })
  }
}

function handleOpenDetails(item: TodoItem) {
  const { children, ...cleanItem } = item
  editingItem.value = {
    ...JSON.parse(JSON.stringify(cleanItem)),
    importance: normalizePriority(item.importance),
  }
}

function saveDetails() {
  if (editingItem.value) {
    const { children, ...cleanItem } = editingItem.value
    emit('save-todo', {
      ...cleanItem,
      importance: normalizePriority(cleanItem.importance),
    })
    editingItem.value = null
  }
}

function handleDeleteItem(id: string) {
  const idsToDelete: string[] = [id]
  const findChildren = (pid: string) => {
    props.todos
      .filter((t) => t.parentId === pid)
      .forEach((c) => {
        idsToDelete.push(c.id)
        findChildren(c.id)
      })
  }
  findChildren(id)

  if (confirm(`确定删除该项及其 ${idsToDelete.length - 1} 个子项吗？`)) {
    idsToDelete.forEach((delId) => {
      emit('delete-todo', delId)
    })
  }
}

function expandAll(expanded: boolean) {
  const updated = props.todos.map((t) => ({ ...t, collapsed: !expanded }))
  emit('batch-update', updated)
}
</script>
