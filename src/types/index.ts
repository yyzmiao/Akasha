export type HabitFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'anytime'
export type TimingType = 'anytime' | 'weekend' | 'specific_days'

export interface Area {
  id: string
  title: string
  order: number
  createdAt: string
}

export interface Project {
  id: string
  areaId: string
  title: string
  description?: string
  color?: string
  order: number
  createdAt: string
}

export type ScheduleRecurringType = 'none' | 'weekly' | 'monthly'

export interface ScheduleItem {
  id: string
  projectId?: string | null
  title: string
  date?: string
  time?: string
  recurringType: ScheduleRecurringType
  recurringDayOfWeek?: number
  recurringDayOfMonth?: number
  createdAt: string
}

export interface Habit {
  id: string
  projectId?: string | null
  title: string
  frequency: HabitFrequency
  timeSlot?: TimeSlot
  timingType?: TimingType
  targetDaysOfWeek?: number[]
  targetCount?: number
  anchorDate?: string
  icon?: string
  color?: string
  description?: string
  targetDayOfMonth?: number
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
  completedAt: string
}

export interface TodoItem {
  id: string
  projectId?: string | null
  parentId: string | null
  title: string
  completed: boolean
  importance?: number
  startDate?: string
  dueDate?: string
  notes?: string
  order: number
  collapsed?: boolean
  children?: TodoItem[]
  createdAt: string
}

export interface JournalEntry {
  id: string
  date: string
  createdAt: string
  updatedAt: string
  mood?: string
  content: string
  tags?: string[]
}

export type ActiveTab = 'calendar' | 'projects' | 'todos' | 'habits' | 'journal'
export type FontSize = 'small' | 'standard' | 'large' | 'xlarge'
export type FontFamily = 'wenkai' | 'system' | 'serif'
export type UiScale = 'compact' | 'standard' | 'comfortable' | 'large'
