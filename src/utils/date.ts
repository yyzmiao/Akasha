export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

export function isSameDay(d1: string | Date, d2: string | Date): boolean {
  const s1 = typeof d1 === 'string' ? d1 : formatDate(d1)
  const s2 = typeof d2 === 'string' ? d2 : formatDate(d2)
  return s1 === s2
}

export function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export function getWeekKey(dateStr: string): string {
  const d = parseDate(dateStr)
  const monday = getMonday(d)
  return `W-${formatDate(monday)}`
}

export function isBiweeklyActive(dateStr: string, anchorDateStr?: string): boolean {
  if (!anchorDateStr) return true
  const d = parseDate(dateStr)
  const anchor = parseDate(anchorDateStr)
  const mondayD = getMonday(d)
  const mondayAnchor = getMonday(anchor)
  const diffTime = mondayD.getTime() - mondayAnchor.getTime()
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7))
  return Math.abs(diffWeeks) % 2 === 0
}

export function isDayMatchingTiming(dateStr: string, timingType?: string, targetDays?: number[]): boolean {
  if (!timingType || timingType === 'anytime') return true
  const d = parseDate(dateStr)
  const dayOfWeek = d.getDay()
  if (timingType === 'weekend') {
    return dayOfWeek === 0 || dayOfWeek === 6
  }
  if (timingType === 'specific_days' && targetDays && targetDays.length > 0) {
    return targetDays.includes(dayOfWeek)
  }
  return true
}

export function isDateInRange(dateStr: string, startDateStr: string, endDateStr: string): boolean {
  return dateStr >= startDateStr && dateStr <= endDateStr
}

export function getDaysRemaining(dueDateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = parseDate(dueDateStr)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatDaysRemaining(dueDateStr: string): { text: string; urgentLevel: 'normal' | 'warning' | 'danger' | 'overdue' } {
  const days = getDaysRemaining(dueDateStr)
  if (days < 0) {
    return { text: `逾期 ${Math.abs(days)} 天`, urgentLevel: 'overdue' }
  } else if (days === 0) {
    return { text: '今日截止', urgentLevel: 'danger' }
  } else if (days <= 3) {
    return { text: `剩 ${days} 天`, urgentLevel: 'warning' }
  } else {
    return { text: `剩 ${days} 天`, urgentLevel: 'normal' }
  }
}

import type { CalendarViewMode } from '@/types'

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export interface CalendarDay {
  date: Date
  dateStr: string
  dayNumber: number
  dayOfWeek: number
  weekdayName: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

const WEEKDAY_NAMES_MAP = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatPeriodTitle(mode: CalendarViewMode, baseDate: Date): string {
  if (mode === 'day') {
    const y = baseDate.getFullYear()
    const m = baseDate.getMonth() + 1
    const d = baseDate.getDate()
    const w = WEEKDAY_NAMES_MAP[baseDate.getDay()]
    return `${y}年${m}月${d}日 ${w}`
  }

  if (mode === 'month') {
    return `${baseDate.getFullYear()}年 ${baseDate.getMonth() + 1}月`
  }

  let startD: Date
  let endD: Date
  let suffix = ''

  if (mode === '2days') {
    startD = baseDate
    endD = addDays(baseDate, 1)
  } else if (mode === '3days') {
    startD = baseDate
    endD = addDays(baseDate, 2)
  } else if (mode === 'week') {
    startD = getMonday(baseDate)
    endD = addDays(startD, 6)
    suffix = ` (第${getISOWeekNumber(startD)}周)`
  } else if (mode === '2weeks') {
    startD = getMonday(baseDate)
    endD = addDays(startD, 13)
  } else {
    return `${baseDate.getFullYear()}年 ${baseDate.getMonth() + 1}月`
  }

  const y1 = startD.getFullYear()
  const m1 = startD.getMonth() + 1
  const d1 = startD.getDate()

  const y2 = endD.getFullYear()
  const m2 = endD.getMonth() + 1
  const d2 = endD.getDate()

  if (y1 === y2) {
    return `${y1}年${m1}月${d1}日 - ${m2}月${d2}日${suffix}`
  }
  return `${y1}年${m1}月${d1}日 - ${y2}年${m2}月${d2}日${suffix}`
}

export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const todayStr = formatDate(new Date())
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const days: CalendarDay[] = []

  let startDayOfWeek = firstDayOfMonth.getDay() - 1
  if (startDayOfWeek === -1) startDayOfWeek = 6

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    const dateStr = formatDate(d)
    const dayOfWeek = d.getDay()
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      dayOfWeek,
      weekdayName: WEEKDAY_NAMES_MAP[dayOfWeek],
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    })
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const d = new Date(year, month, day)
    const dateStr = formatDate(d)
    const dayOfWeek = d.getDay()
    days.push({
      date: d,
      dateStr,
      dayNumber: day,
      dayOfWeek,
      weekdayName: WEEKDAY_NAMES_MAP[dayOfWeek],
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    })
  }

  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day)
      const dateStr = formatDate(d)
      const dayOfWeek = d.getDay()
      days.push({
        date: d,
        dateStr,
        dayNumber: day,
        dayOfWeek,
        weekdayName: WEEKDAY_NAMES_MAP[dayOfWeek],
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      })
    }
  }

  return days
}

export function getViewDays(mode: CalendarViewMode, baseDate: Date): CalendarDay[] {
  const todayStr = formatDate(new Date())

  if (mode === 'month') {
    return getCalendarDays(baseDate.getFullYear(), baseDate.getMonth())
  }

  let startDate: Date
  let dayCount: number

  if (mode === 'day') {
    startDate = new Date(baseDate)
    dayCount = 1
  } else if (mode === '2days') {
    startDate = new Date(baseDate)
    dayCount = 2
  } else if (mode === '3days') {
    startDate = new Date(baseDate)
    dayCount = 3
  } else if (mode === 'week') {
    startDate = getMonday(baseDate)
    dayCount = 7
  } else if (mode === '2weeks') {
    startDate = getMonday(baseDate)
    dayCount = 14
  } else {
    return getCalendarDays(baseDate.getFullYear(), baseDate.getMonth())
  }

  const days: CalendarDay[] = []
  for (let i = 0; i < dayCount; i++) {
    const d = addDays(startDate, i)
    const dateStr = formatDate(d)
    const dayOfWeek = d.getDay()
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      dayOfWeek,
      weekdayName: WEEKDAY_NAMES_MAP[dayOfWeek],
      // 注意：非月视图下所有日子均是该视角的有效排期日，跨月绝不判为半透明灰色
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    })
  }

  return days
}
