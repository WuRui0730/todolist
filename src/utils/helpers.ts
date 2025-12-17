/**
 * 文件功能：通用工具函数
 * 提供日期格式化、颜色转换、倒计时计算等通用的辅助函数。
 */
import type { Importance } from '../types'

/**
 * 将 HEX 颜色转换为 RGB 对象
 */
export function hexToRgb(hex: string) {
  const val = hex.replace('#', '')
  const num = parseInt(val.length === 3 ? val.split('').map((c) => c + c).join('') : val, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

/**
 * 应用主题色到 CSS 变量
 */
export function applyTheme(primary: string) {
  const root = document.documentElement
  const { r, g, b } = hexToRgb(primary)
  root.style.setProperty('--theme-primary', primary)
  root.style.setProperty('--theme-primary-light', `rgba(${r}, ${g}, ${b}, 0.2)`)
}

/**
 * 格式化日期显示
 * @returns "M月D日 HH:mm"
 */
export function formatDate(d?: string) {
  if (!d) return '无截止时间'
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 获取简单的倒计时文本
 * @returns "剩余 X小时X分" 或 "超时 X小时X分"
 */
export function getCountdown(d?: string) {
  if (!d) return '未设置'
  const diff = new Date(d).getTime() - Date.now()
  const abs = Math.abs(diff)
  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const prefix = diff < 0 ? '超时' : '剩余'
  return `${prefix} ${h}小时${m}分`
}

/**
 * 简单的字符串哈希函数，用于生成索引
 */
export function hashIndex(str: string, mod: number) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
  return Math.abs(hash) % mod
}

/**
 * 判断日期是否是今天
 */
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

/**
 * 判断日期是否在未来7天内
 */
export function isWithin7Days(d?: string) {
  if (!d) return false
  const date = new Date(d).getTime()
  const now = Date.now()
  const diff = date - now
  return diff >= 0 && diff <= 7 * 24 * 3600 * 1000
}

/**
 * 获取详细的倒计时文本 (天/时/分)
 */
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

/**
 * 重要性对应的颜色映射
 */
export const importanceColor: Record<Importance, string> = {
  critical: '#e66b6b',
  high: '#f5c26b',
  normal: '#7cc4a3',
}

