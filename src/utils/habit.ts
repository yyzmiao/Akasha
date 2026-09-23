import type { Habit, HabitLog } from '@/types'
import { parseDate, formatDate, getMonday } from './date'

// JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
// 日常界面显示顺序：周一到周日
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const WEEKDAY_NAMES: Record<number, string> = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日',
}

export const WEEKDAY_SHORT_NAMES: Record<number, string> = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  0: '日',
}

/**
 * 权重比对函数：周一到周六为 1~6，周日转换为 7
 */
export function getDayWeight(day: number): number {
  return day === 0 ? 7 : day
}

/**
 * 按照周一到周日标准顺序排序
 */
export function sortDays(days: number[]): number[] {
  return [...days].sort((a, b) => getDayWeight(a) - getDayWeight(b))
}

/**
 * 计算两个日期之间跨越的整周数
 * 严格先分别归一化至各自所在周的周一 00:00:00，确保每周一 00:00 精准发生轮换
 */
export function getDiffWeeks(targetDateStr: string, anchorDateStr: string): number {
  const targetD = parseDate(targetDateStr)
  const anchorD = parseDate(anchorDateStr)
  const mondayTarget = getMonday(targetD)
  const mondayAnchor = getMonday(anchorD)
  const diffTime = mondayTarget.getTime() - mondayAnchor.getTime()
  return Math.round(diffTime / (7 * 24 * 60 * 60 * 1000))
}

/**
 * 依据基准日 anchorDate，计算 targetDateStr 所处的轮换周序号（1-based: 1 到 cycleWeeks）
 * 模数算法：((diffWeeks % cycleWeeks) + cycleWeeks) % cycleWeeks + 1
 */
export function getCycleWeekNumber(targetDateStr: string, anchorDateStr?: string, cycleWeeks: number = 2): number {
  if (!anchorDateStr || cycleWeeks <= 1) return 1
  const diffWeeks = getDiffWeeks(targetDateStr, anchorDateStr)
  return (((diffWeeks % cycleWeeks) + cycleWeeks) % cycleWeeks) + 1
}

/**
 * 判断指定日期 dateStr 是否为该习惯的计划执行日
 */
export function isHabitScheduledForDay(habit: Habit, dateStr: string): boolean {
  if (habit.frequency === 'daily') {
    return true
  }

  if (habit.frequency === 'weekly') {
    if (habit.timingType === 'weekend') {
      const d = parseDate(dateStr).getDay()
      return d === 0 || d === 6
    }
    if (habit.targetDaysOfWeek && habit.targetDaysOfWeek.length > 0) {
      const d = parseDate(dateStr).getDay()
      return habit.targetDaysOfWeek.includes(d)
    }
    return true
  }

  if (habit.frequency === 'rotating' || habit.frequency === 'biweekly') {
    const cycleWeeks = habit.cycleWeeks || 2
    const anchor = habit.anchorDate || dateStr
    const currentCycleWeek = getCycleWeekNumber(dateStr, anchor, cycleWeeks)
    const patterns = habit.weekPatterns || {}
    const scheduledDays = patterns[currentCycleWeek] || []
    const dayOfWeek = parseDate(dateStr).getDay()
    return scheduledDays.includes(dayOfWeek)
  }

  if (habit.frequency === 'monthly') {
    if (habit.targetDayOfMonth) {
      return parseDate(dateStr).getDate() === habit.targetDayOfMonth
    }
    return true
  }

  return true
}

/**
 * 获取习惯在本周的所有排期日列表（星期数字 0~6）
 */
export function getHabitScheduledDaysThisWeek(habit: Habit, targetDateStr: string): number[] {
  if (habit.frequency === 'daily') {
    return [1, 2, 3, 4, 5, 6, 0]
  }

  if (habit.frequency === 'weekly') {
    if (habit.timingType === 'weekend') return [6, 0]
    if (habit.targetDaysOfWeek && habit.targetDaysOfWeek.length > 0) {
      return sortDays(habit.targetDaysOfWeek)
    }
    return [1, 2, 3, 4, 5, 6, 0]
  }

  if (habit.frequency === 'rotating' || habit.frequency === 'biweekly') {
    const cycleWeeks = habit.cycleWeeks || 2
    const anchor = habit.anchorDate || targetDateStr
    const currentCycleWeek = getCycleWeekNumber(targetDateStr, anchor, cycleWeeks)
    const patterns = habit.weekPatterns || {}
    return sortDays(patterns[currentCycleWeek] || [])
  }

  return []
}

/**
 * 生成多周轮换规则的自然语言描述与实时预览
 */
export function getRotatingHabitNaturalDescription(
  cycleWeeks: number,
  weekPatterns: Record<number, number[]>,
  anchorDateStr?: string,
  targetDateStr?: string
): { summary: string; currentWeekDesc: string; isTodayScheduled: boolean; currentWeek: number } {
  const parts: string[] = []
  for (let w = 1; w <= cycleWeeks; w++) {
    const days = sortDays(weekPatterns[w] || [])
    if (days.length === 0) {
      parts.push(`第 ${w} 周：无排期（整周休息）`)
    } else {
      const dayNames = days.map((d) => WEEKDAY_NAMES[d]).join('、')
      parts.push(`第 ${w} 周：${dayNames}`)
    }
  }

  const summary = `每 ${cycleWeeks} 周轮换循环：${parts.join('；')}。`

  const todayStr = targetDateStr || formatDate(new Date())
  const anchor = anchorDateStr || todayStr
  const currentWeek = getCycleWeekNumber(todayStr, anchor, cycleWeeks)
  const todayDay = parseDate(todayStr).getDay()
  const currentWeekDays = weekPatterns[currentWeek] || []
  const isTodayScheduled = currentWeekDays.includes(todayDay)

  const currentWeekDaysSorted = sortDays(currentWeekDays)
  const currentWeekDayNames =
    currentWeekDaysSorted.length > 0
      ? currentWeekDaysSorted.map((d) => WEEKDAY_NAMES[d]).join('、')
      : '无执行日'

  const currentWeekDesc = `📍 依据基准日 (${anchor}) 推算：本周为「第 ${currentWeek} 周」（排期：${currentWeekDayNames}）${
    isTodayScheduled ? ' · 今日需打卡' : ' · 🏖️ 今日休息（非排期日）'
  }`

  return { summary, currentWeekDesc, isTodayScheduled, currentWeek }
}

/**
 * 连续打卡（Streak）算法
 * 多周轮换习惯的核心规则：非排期日（休息日）绝对不中断连胜！
 * 仅逆序回溯检查历史排期日的打卡记录。
 */
export function calculateHabitStreak(
  habit: Habit,
  habitLogs: HabitLog[],
  todayStr: string
): { currentStreak: number; totalCompleted: number } {
  const logsSet = new Set(
    habitLogs.filter((l) => l.habitId === habit.id && l.completed).map((l) => l.date)
  )

  const totalCompleted = logsSet.size

  if (habit.frequency !== 'rotating' && habit.frequency !== 'biweekly') {
    let streak = 0
    const checkDate = parseDate(todayStr)

    // 若今天未打卡，由于今天还没过完，先从昨天开始判断
    if (!logsSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      const s = formatDate(checkDate)
      if (logsSet.has(s)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return { currentStreak: streak, totalCompleted }
  }

  // 多周轮换习惯：只统计排期日，非排期日跳过
  let streak = 0
  const checkDate = parseDate(todayStr)
  let foundFirstScheduled = false

  for (let i = 0; i < 365; i++) {
    const s = formatDate(checkDate)
    const isScheduled = isHabitScheduledForDay(habit, s)

    if (isScheduled) {
      if (s === todayStr && !logsSet.has(s)) {
        // 如果今天是排期日但还未打卡，不打断连胜，等待打卡
      } else if (logsSet.has(s)) {
        streak++
        foundFirstScheduled = true
      } else {
        // 发现过去某个排期日未打卡，连胜到此终止
        if (foundFirstScheduled || s < todayStr) {
          break
        }
      }
    }

    checkDate.setDate(checkDate.getDate() - 1)
  }

  return { currentStreak: streak, totalCompleted }
}
