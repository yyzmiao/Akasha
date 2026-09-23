<template>
  <button
    @click="$emit('click')"
    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border"
    :class="statusBadgeClasses"
    :title="statusTooltip"
  >
    <!-- Syncing spinner -->
    <RefreshCw
      v-if="isAuthenticated && syncStatus === 'syncing'"
      class="w-3.5 h-3.5 animate-spin text-blue-500"
    />
    <!-- Synced check -->
    <Cloud
      v-else-if="isAuthenticated && syncStatus === 'synced'"
      class="w-3.5 h-3.5 text-emerald-500"
    />
    <!-- Error -->
    <AlertCircle
      v-else-if="isAuthenticated && syncStatus === 'error'"
      class="w-3.5 h-3.5 text-rose-500"
    />
    <!-- Offline or Not Logged In -->
    <CloudOff
      v-else
      class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"
    />

    <span class="hidden sm:inline">
      {{ statusLabel }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-vue-next'
import { isAuthenticated } from '@/sync/pocketbase'
import { syncStatus, syncError } from '@/sync/syncEngine'

defineEmits<{
  (e: 'click'): void
}>()

const statusLabel = computed(() => {
  if (!isAuthenticated.value) {
    return '本地模式'
  }
  switch (syncStatus.value) {
    case 'synced':
      return '云端已同步'
    case 'syncing':
      return '同步中...'
    case 'error':
      return '同步异常'
    case 'offline':
      return '离线模式'
    default:
      return '未同步'
  }
})

const statusTooltip = computed(() => {
  if (!isAuthenticated.value) {
    return '当前数据保存在本地，点击配置云端多端同步'
  }
  if (syncError.value) {
    return `同步提示: ${syncError.value}`
  }
  return `多端同步状态: ${statusLabel.value} (点击管理)`
})

const statusBadgeClasses = computed(() => {
  if (!isAuthenticated.value) {
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
  }
  switch (syncStatus.value) {
    case 'synced':
      return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40'
    case 'syncing':
      return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
    case 'error':
      return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
    case 'offline':
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  }
})
</script>
