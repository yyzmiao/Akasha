import { ref, watch } from 'vue'
import { db } from '@/db'
import type { EntityType, SyncItemRecord, SyncStatus } from '@/types'
import { pb, currentUser, isAuthenticated, setServerUrl } from './pocketbase'

const LAST_SYNC_KEY = 'akasha_last_sync_timestamp'
const PENDING_CHANGES_KEY = 'akasha_pending_sync_queue'

export const syncStatus = ref<SyncStatus>('offline')
export const lastSyncTime = ref<number | null>(
  localStorage.getItem(LAST_SYNC_KEY) ? Number(localStorage.getItem(LAST_SYNC_KEY)) : null
)
export const syncError = ref<string | null>(null)
export const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

// In-memory queue of pending local changes: key = `${entityType}:${entityId}`
interface PendingItem {
  entityType: EntityType
  entityId: string
  payload: any
  clientUpdatedAt: number
  isDeleted: boolean
}

let pendingChanges: Map<string, PendingItem> = new Map()

// Load pending changes from localStorage on boot
function loadPendingQueue() {
  try {
    const raw = localStorage.getItem(PENDING_CHANGES_KEY)
    if (raw) {
      const arr: PendingItem[] = JSON.parse(raw)
      pendingChanges = new Map(arr.map((item) => [`${item.entityType}:${item.entityId}`, item]))
    }
  } catch (_e) {
    pendingChanges = new Map()
  }
}

function savePendingQueue() {
  try {
    const arr = Array.from(pendingChanges.values())
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(arr))
  } catch (_e) {}
}

loadPendingQueue()

// Callback when remote data is written to local Dexie to notify Vue components
let remoteChangeListeners: Array<() => void> = []

export function onRemoteDataChange(callback: () => void): () => void {
  remoteChangeListeners.push(callback)
  return () => {
    remoteChangeListeners = remoteChangeListeners.filter((fn) => fn !== callback)
  }
}

function notifyRemoteChange() {
  for (const fn of remoteChangeListeners) {
    try {
      fn()
    } catch (_e) {}
  }
}

function getTable(type: EntityType): any {
  switch (type) {
    case 'area':
      return db.areas
    case 'project':
      return db.projects
    case 'schedule':
      return db.schedules
    case 'habit':
      return db.habits
    case 'habitLog':
      return db.habitLogs
    case 'todo':
      return db.todos
    case 'journal':
      return db.journals
  }
}

function formatSyncErrorMessage(err: any): string {
  const msg = err?.message || String(err)
  if (err?.status === 404 || msg.includes('404') || msg.includes('not found')) {
    return '云端尚未找到 sync_items 数据表，请确保已启动 PocketBase 并在后台完成了初始化'
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return '网络连接失败，请检查服务器地址是否正确且服务已启动'
  }
  return msg
}

let pushDebounceTimer: any = null
let unsubscribeRealtime: (() => void) | null = null

/**
 * Enqueue a local change and trigger debounced sync
 */
export function enqueueChange(
  entityType: EntityType,
  entityId: string,
  payload: any,
  isDeleted = false
) {
  const timestamp = Date.now()
  const key = `${entityType}:${entityId}`
  pendingChanges.set(key, {
    entityType,
    entityId,
    payload: isDeleted ? null : payload,
    clientUpdatedAt: timestamp,
    isDeleted,
  })
  savePendingQueue()

  if (isAuthenticated.value && isOnline.value) {
    if (pushDebounceTimer) clearTimeout(pushDebounceTimer)
    pushDebounceTimer = setTimeout(() => {
      flushPendingChanges()
    }, 600)
  }
}

/**
 * Push all pending local changes to PocketBase
 */
export async function flushPendingChanges(): Promise<void> {
  if (!isAuthenticated.value || !isOnline.value) return
  if (pendingChanges.size === 0) {
    syncStatus.value = 'synced'
    return
  }

  syncStatus.value = 'syncing'
  syncError.value = null

  const items = Array.from(pendingChanges.values())
  const user = currentUser.value

  for (const item of items) {
    const key = `${item.entityType}:${item.entityId}`
    try {
      // Find existing sync record on server for this user and entity
      let existingRecord: any = null
      try {
        existingRecord = await pb.collection('sync_items').getFirstListItem(
          `entityType="${item.entityType}" && entityId="${item.entityId}"`
        )
      } catch (err: any) {
        if (err.status !== 404) {
          throw err
        }
      }

      if (existingRecord) {
        // If server's record is older than local, update it
        if ((existingRecord.clientUpdatedAt || 0) <= item.clientUpdatedAt) {
          await pb.collection('sync_items').update(existingRecord.id, {
            payload: item.payload,
            clientUpdatedAt: item.clientUpdatedAt,
            isDeleted: item.isDeleted,
          })
        }
      } else {
        // Create new record
        await pb.collection('sync_items').create({
          entityType: item.entityType,
          entityId: item.entityId,
          payload: item.payload,
          clientUpdatedAt: item.clientUpdatedAt,
          isDeleted: item.isDeleted,
          user: user.id,
        })
      }

      // Remove from pending queue on success
      pendingChanges.delete(key)
    } catch (err: any) {
      console.warn(`[SyncEngine] Push failed for ${key}:`, err)
      syncStatus.value = 'error'
      syncError.value = formatSyncErrorMessage(err)
      savePendingQueue()
      return
    }
  }

  savePendingQueue()
  syncStatus.value = 'synced'
}

/**
 * Pull incremental updates from PocketBase
 */
export async function pullUpdates(): Promise<void> {
  if (!isAuthenticated.value || !isOnline.value) return

  syncStatus.value = 'syncing'
  syncError.value = null

  try {
    const filter = lastSyncTime.value
      ? `clientUpdatedAt > ${lastSyncTime.value}`
      : ''

    const records = await pb.collection('sync_items').getFullList<SyncItemRecord>({
      filter: filter || undefined,
      sort: 'clientUpdatedAt',
    })

    let hasLocalUpdates = false

    for (const record of records) {
      const key = `${record.entityType}:${record.entityId}`
      const pending = pendingChanges.get(key)

      // If we have a newer local pending change, let our local change win
      if (pending && pending.clientUpdatedAt >= record.clientUpdatedAt) {
        continue
      }

      const table = getTable(record.entityType)
      if (!table) continue

      if (record.isDeleted) {
        await table.delete(record.entityId)
        hasLocalUpdates = true
      } else if (record.payload) {
        await table.put(record.payload)
        hasLocalUpdates = true
      }
    }

    lastSyncTime.value = Date.now()
    localStorage.setItem(LAST_SYNC_KEY, String(lastSyncTime.value))
    syncStatus.value = 'synced'

    if (hasLocalUpdates) {
      notifyRemoteChange()
    }
  } catch (err: any) {
    console.warn('[SyncEngine] Pull failed:', err)
    syncStatus.value = 'error'
    syncError.value = formatSyncErrorMessage(err)
  }
}

/**
 * Subscribe to PocketBase Realtime SSE events for instant cross-device updates
 */
export async function startRealtimeSubscription(): Promise<void> {
  if (!isAuthenticated.value || !isOnline.value) return
  if (unsubscribeRealtime) return

  try {
    unsubscribeRealtime = await pb.collection('sync_items').subscribe('*', async (e) => {
      const record = e.record as unknown as SyncItemRecord
      if (!record || !record.entityType || !record.entityId) return

      // Skip if event belongs to another user
      if (record.user && currentUser.value && record.user !== currentUser.value.id) {
        return
      }

      const key = `${record.entityType}:${record.entityId}`
      const pending = pendingChanges.get(key)
      if (pending && pending.clientUpdatedAt >= record.clientUpdatedAt) {
        return
      }

      const table = getTable(record.entityType)
      if (!table) return

      if (e.action === 'delete' || record.isDeleted) {
        await table.delete(record.entityId)
      } else if (record.payload) {
        await table.put(record.payload)
      }

      lastSyncTime.value = Math.max(lastSyncTime.value || 0, record.clientUpdatedAt || Date.now())
      localStorage.setItem(LAST_SYNC_KEY, String(lastSyncTime.value))
      notifyRemoteChange()
    })
  } catch (err: any) {
    console.warn('[SyncEngine] Realtime subscribe error:', err)
  }
}

export function stopRealtimeSubscription(): void {
  if (unsubscribeRealtime) {
    try {
      unsubscribeRealtime()
    } catch (_e) {}
    unsubscribeRealtime = null
  }
}

/**
 * Full bidirectional sync: flush outbox -> pull server -> start realtime
 */
export async function syncAll(): Promise<void> {
  if (!isAuthenticated.value) {
    syncStatus.value = 'offline'
    return
  }
  if (!isOnline.value) {
    syncStatus.value = 'offline'
    return
  }

  await flushPendingChanges()
  await pullUpdates()
  await startRealtimeSubscription()
}

/**
 * Upload all current local Dexie records to PocketBase (Useful for first-time cloud setup)
 */
export async function uploadAllLocalToCloud(): Promise<{ count: number }> {
  if (!isAuthenticated.value) throw new Error('请先登录云端账号')
  syncStatus.value = 'syncing'

  const user = currentUser.value
  let count = 0

  const allAreas = await db.areas.toArray()
  const allProjects = await db.projects.toArray()
  const allSchedules = await db.schedules.toArray()
  const allHabits = await db.habits.toArray()
  const allHabitLogs = await db.habitLogs.toArray()
  const allTodos = await db.todos.toArray()
  const allJournals = await db.journals.toArray()

  const batch: Array<{ entityType: EntityType; entityId: string; payload: any }> = [
    ...allAreas.map((item) => ({ entityType: 'area' as EntityType, entityId: item.id, payload: item })),
    ...allProjects.map((item) => ({ entityType: 'project' as EntityType, entityId: item.id, payload: item })),
    ...allSchedules.map((item) => ({ entityType: 'schedule' as EntityType, entityId: item.id, payload: item })),
    ...allHabits.map((item) => ({ entityType: 'habit' as EntityType, entityId: item.id, payload: item })),
    ...allHabitLogs.map((item) => ({ entityType: 'habitLog' as EntityType, entityId: item.id, payload: item })),
    ...allTodos.map((item) => ({ entityType: 'todo' as EntityType, entityId: item.id, payload: item })),
    ...allJournals.map((item) => ({ entityType: 'journal' as EntityType, entityId: item.id, payload: item })),
  ]

  const now = Date.now()
  for (const item of batch) {
    try {
      let existingRecord: any = null
      try {
        existingRecord = await pb.collection('sync_items').getFirstListItem(
          `entityType="${item.entityType}" && entityId="${item.entityId}"`
        )
      } catch (err: any) {
        if (err.status !== 404) throw err
      }

      if (existingRecord) {
        await pb.collection('sync_items').update(existingRecord.id, {
          payload: item.payload,
          clientUpdatedAt: now,
          isDeleted: false,
        })
      } else {
        await pb.collection('sync_items').create({
          entityType: item.entityType,
          entityId: item.entityId,
          payload: item.payload,
          clientUpdatedAt: now,
          isDeleted: false,
          user: user.id,
        })
      }
      count++
    } catch (err: any) {
      console.warn(`Failed to upload ${item.entityType}:${item.entityId}`, err)
    }
  }

  lastSyncTime.value = now
  localStorage.setItem(LAST_SYNC_KEY, String(now))
  syncStatus.value = 'synced'
  return { count }
}

/**
 * Wipe local Dexie and download all active records from PocketBase
 */
export async function downloadAllCloudToLocal(): Promise<{ count: number }> {
  if (!isAuthenticated.value) throw new Error('请先登录云端账号')
  syncStatus.value = 'syncing'

  const records = await pb.collection('sync_items').getFullList<SyncItemRecord>({
    filter: 'isDeleted != true',
  })

  // Clear local Dexie
  await db.areas.clear()
  await db.projects.clear()
  await db.schedules.clear()
  await db.habits.clear()
  await db.habitLogs.clear()
  await db.todos.clear()
  await db.journals.clear()

  const areas: any[] = []
  const projects: any[] = []
  const schedules: any[] = []
  const habits: any[] = []
  const habitLogs: any[] = []
  const todos: any[] = []
  const journals: any[] = []

  for (const rec of records) {
    if (!rec.payload) continue
    switch (rec.entityType) {
      case 'area':
        areas.push(rec.payload)
        break
      case 'project':
        projects.push(rec.payload)
        break
      case 'schedule':
        schedules.push(rec.payload)
        break
      case 'habit':
        habits.push(rec.payload)
        break
      case 'habitLog':
        habitLogs.push(rec.payload)
        break
      case 'todo':
        todos.push(rec.payload)
        break
      case 'journal':
        journals.push(rec.payload)
        break
    }
  }

  if (areas.length) await db.areas.bulkAdd(areas)
  if (projects.length) await db.projects.bulkAdd(projects)
  if (schedules.length) await db.schedules.bulkAdd(schedules)
  if (habits.length) await db.habits.bulkAdd(habits)
  if (habitLogs.length) await db.habitLogs.bulkAdd(habitLogs)
  if (todos.length) await db.todos.bulkAdd(todos)
  if (journals.length) await db.journals.bulkAdd(journals)

  lastSyncTime.value = Date.now()
  localStorage.setItem(LAST_SYNC_KEY, String(lastSyncTime.value))
  syncStatus.value = 'synced'
  notifyRemoteChange()

  return { count: records.length }
}

/**
 * Reset local sync outbox queue and update lastSyncTime
 */
export function resetSyncOutbox(): void {
  pendingChanges.clear()
  savePendingQueue()
  lastSyncTime.value = Date.now()
  localStorage.setItem(LAST_SYNC_KEY, String(lastSyncTime.value))
}

/**
 * Apply imported backup data to cloud:
 * Overwrite cloud records with the backup, mark removed cloud records as deleted (tombstone),
 * clear outbox queue, and update lastSyncTime.
 */
export async function applyBackupToCloud(backupData: any): Promise<void> {
  if (!isAuthenticated.value) {
    resetSyncOutbox()
    return
  }
  syncStatus.value = 'syncing'

  // 1. Clear local pending changes so old unsynced local mutations don't conflict
  pendingChanges.clear()
  savePendingQueue()

  const user = currentUser.value
  const now = Date.now()

  // 2. Extract all entities from backupData
  const backupBatch: Array<{ entityType: EntityType; entityId: string; payload: any }> = []
  if (Array.isArray(backupData.areas)) {
    backupData.areas.forEach((item: any) => item?.id && backupBatch.push({ entityType: 'area', entityId: item.id, payload: item }))
  }
  if (Array.isArray(backupData.projects)) {
    backupData.projects.forEach((item: any) => item?.id && backupBatch.push({ entityType: 'project', entityId: item.id, payload: item }))
  }
  if (Array.isArray(backupData.schedules)) {
    backupData.schedules.forEach((item: any) => item?.id && backupBatch.push({ entityType: 'schedule', entityId: item.id, payload: item }))
  }
  if (Array.isArray(backupData.habits)) {
    backupData.habits.forEach((item: any) => item?.id && backupBatch.push({ entityType: 'habit', entityId: item.id, payload: item }))
  }
  if (Array.isArray(backupData.habitLogs)) {
    backupData.habitLogs.forEach((item: any) => item?.id && backupBatch.push({ entityType: 'habitLog', entityId: item.id, payload: item }))
  }
  if (Array.isArray(backupData.todos)) {
    backupData.todos.forEach((item: any) => item?.id && backupBatch.push({ entityType: 'todo', entityId: item.id, payload: item }))
  }
  if (Array.isArray(backupData.journals)) {
    backupData.journals.forEach((item: any) => item?.id && backupBatch.push({ entityType: 'journal', entityId: item.id, payload: item }))
  }

  const backupKeySet = new Set(backupBatch.map((b) => `${b.entityType}:${b.entityId}`))

  // 3. Fetch all existing cloud records for this user
  try {
    const existingCloudRecords = await pb.collection('sync_items').getFullList<SyncItemRecord>()

    // Tombstone cloud records that do not exist in the backup
    for (const record of existingCloudRecords) {
      const key = `${record.entityType}:${record.entityId}`
      if (!backupKeySet.has(key) && !record.isDeleted && record.id) {
        try {
          await pb.collection('sync_items').update(record.id, {
            isDeleted: true,
            clientUpdatedAt: now,
          })
        } catch (_e) {}
      }
    }

    // Upsert backup items to cloud
    for (const item of backupBatch) {
      try {
        let existingRecord: any = null
        try {
          existingRecord = await pb.collection('sync_items').getFirstListItem(
            `entityType="${item.entityType}" && entityId="${item.entityId}"`
          )
        } catch (err: any) {
          if (err.status !== 404) throw err
        }

        if (existingRecord) {
          await pb.collection('sync_items').update(existingRecord.id, {
            payload: item.payload,
            clientUpdatedAt: now,
            isDeleted: false,
          })
        } else {
          await pb.collection('sync_items').create({
            entityType: item.entityType,
            entityId: item.entityId,
            payload: item.payload,
            clientUpdatedAt: now,
            isDeleted: false,
            user: user?.id,
          })
        }
      } catch (err: any) {
        console.warn(`[SyncEngine] Backup upload item failed for ${item.entityType}:${item.entityId}`, err)
      }
    }

    lastSyncTime.value = now
    localStorage.setItem(LAST_SYNC_KEY, String(now))
    syncStatus.value = 'synced'
  } catch (err) {
    console.warn('[SyncEngine] applyBackupToCloud failed:', err)
    syncStatus.value = 'error'
  }
}


// Watch online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline.value = true
    if (isAuthenticated.value) {
      syncAll()
    }
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
    syncStatus.value = 'offline'
    stopRealtimeSubscription()
  })
}

// Watch auth changes
watch(isAuthenticated, (authed) => {
  if (authed) {
    syncAll()
  } else {
    stopRealtimeSubscription()
    syncStatus.value = 'offline'
  }
})
