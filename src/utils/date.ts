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

export interface CalendarDay {
  date: Date
  dateStr: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
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
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    })
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const d = new Date(year, month, day)
    const dateStr = formatDate(d)
    days.push({
      date: d,
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    })
  }

  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day)
      const dateStr = formatDate(d)
      days.push({
        date: d,
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      })
    }
  }

  return days
}
