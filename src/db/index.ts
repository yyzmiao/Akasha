import Dexie, { type Table } from 'dexie'
import type {
  Area,
  Project,
  ScheduleItem,
  Habit,
  HabitLog,
  TodoItem,
  JournalEntry,
} from '@/types'

export class FlowOSDatabase extends Dexie {
  areas!: Table<Area>
  projects!: Table<Project>
  schedules!: Table<ScheduleItem>
  habits!: Table<Habit>
  habitLogs!: Table<HabitLog>
  todos!: Table<TodoItem>
  journals!: Table<JournalEntry>

  constructor() {
    super('PersonalFlowOSDB')
    this.version(3).stores({
      areas: 'id, order, createdAt',
      projects: 'id, areaId, order, createdAt',
      schedules: 'id, projectId, date, recurringType, createdAt',
      habits: 'id, projectId, frequency, timeSlot, createdAt',
      habitLogs: 'id, [habitId+date], habitId, date, completed',
      todos: 'id, projectId, parentId, completed, importance, dueDate, order',
      journals: 'id, date, createdAt',
    })
  }
}

export const db = new FlowOSDatabase()

export const DEFAULT_JOURNAL_TEMPLATE = `· 今日速记与心境：


· 发生的人和事：


· 推进与收获：
`

export async function clearAllDatabaseData() {
  await db.areas.clear()
  await db.projects.clear()
  await db.schedules.clear()
  await db.todos.clear()
  await db.habits.clear()
  await db.habitLogs.clear()
  await db.journals.clear()
}

export async function initSeedData() {
}
