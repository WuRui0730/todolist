import type { Importance } from '../types'

export function hexToRgb(hex: string) {
  const val = hex.replace('#', '')
  const num = parseInt(val.length === 3 ? val.split('').map((c) => c + c).join('') : val, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function applyTheme(primary: string) {
  const root = document.documentElement
  const { r, g, b } = hexToRgb(primary)
  root.style.setProperty('--theme-primary', primary)
  root.style.setProperty('--theme-primary-light', `rgba(${r}, ${g}, ${b}, 0.2)`)
}

export function formatDate(d?: string) {
  if (!d) return '无截止时间'
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function getCountdown(d?: string) {
  if (!d) return '未设置'
  const diff = new Date(d).getTime() - Date.now()
  const abs = Math.abs(diff)
  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const prefix = diff < 0 ? '超时' : '剩余'
  return `${prefix} ${h}小时${m}分`
}

export function hashIndex(str: string, mod: number) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
  return Math.abs(hash) % mod
}

export function isToday(d?: string) {
  if (!d) return false
  const date = new Date(d)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isWithin7Days(d?: string) {
  if (!d) return false
  const date = new Date(d).getTime()
  const now = Date.now()
  const diff = date - now
  return diff >= 0 && diff <= 7 * 24 * 3600 * 1000
}

export function getCountdownDHM(d?: string, currentTime?: number) {
  if (!d) return ''
  const now = currentTime || Date.now()
  const deadline = new Date(d).getTime()
  const diff = deadline - now

  // 已经超时
  if (diff <= 0) {
    return '已超时'
  }

  const abs = Math.abs(diff)
  const days = Math.floor(abs / (24 * 3600000))
  const hours = Math.floor((abs % (24 * 3600000)) / 3600000)
  const minutes = Math.floor((abs % 3600000) / 60000)

  if (days > 0) {
    return `${days}天${hours}时${minutes}分`
  } else if (hours > 0) {
    return `${hours}时${minutes}分`
  } else {
    return `${minutes}分`
  }
}

export const importanceColor: Record<Importance, string> = {
  critical: '#e66b6b',
  high: '#f5c26b',
  normal: '#7cc4a3',
}

