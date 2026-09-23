export interface PriorityMeta {
  level: number
  label: string
  shortLabel: string
  badgeClass: string
  dotClass: string
}

export const PRIORITY_CONFIGS: Record<number, PriorityMeta> = {
  1: {
    level: 1,
    label: 'P1 - 极低',
    shortLabel: '极低',
    badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200/90 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/80',
    dotClass: 'bg-slate-400',
  },
  2: {
    level: 2,
    label: 'P2 - 较低',
    shortLabel: '较低',
    badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200/90 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/80',
    dotClass: 'bg-slate-400',
  },
  3: {
    level: 3,
    label: 'P3 - 低度',
    shortLabel: '低',
    badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dotClass: 'bg-slate-400',
  },
  4: {
    level: 4,
    label: 'P4 - 次中',
    shortLabel: '次中',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50',
    dotClass: 'bg-sky-400',
  },
  5: {
    level: 5,
    label: 'P5 - 普通',
    shortLabel: '普通',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50',
    dotClass: 'bg-sky-500',
  },
  6: {
    level: 6,
    label: 'P6 - 关注',
    shortLabel: '中上',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50',
    dotClass: 'bg-sky-500',
  },
  7: {
    level: 7,
    label: 'P7 - 较重',
    shortLabel: '较重',
    badgeClass: 'bg-amber-50/90 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
    dotClass: 'bg-amber-500',
  },
  8: {
    level: 8,
    label: 'P8 - 重要',
    shortLabel: '重要',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-300/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    dotClass: 'bg-amber-600',
  },
  9: {
    level: 9,
    label: 'P9 - 紧急',
    shortLabel: '紧急',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50',
    dotClass: 'bg-rose-500',
  },
  10: {
    level: 10,
    label: 'P10 - 最高',
    shortLabel: '特急',
    badgeClass: 'bg-rose-50 text-rose-800 border border-rose-300/90 font-semibold dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800/80',
    dotClass: 'bg-rose-600',
  },
}

export function normalizePriority(val: any): number {
  const num = Number(val)
  if (isNaN(num) || num < 1) return 5
  if (num > 10) return 10
  return Math.round(num)
}

export function getPriorityStyle(importance?: any): PriorityMeta {
  const level = normalizePriority(importance)
  return PRIORITY_CONFIGS[level] || PRIORITY_CONFIGS[5]
}
