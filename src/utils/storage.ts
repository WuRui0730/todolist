/**
 * 文件功能：本地存储工具
 * 封装 LocalStorage 操作，处理用户数据、设置和个人资料的持久化与读取。
 */
import type { DataShape, Profile, Settings, User } from '../types'

// [PPT Slide 4] 身份认证系统 - 数据持久化与隔离
// [PPT Slide 11] 关键技术实现 - LocalStorage 封装
// LocalStorage 键名定义
const USER_KEY = 'todo-users'
const CURRENT_KEY = 'todo-current-user'
const SETTINGS_KEY = (u: string) => `todo-settings-${u}`
const PROFILE_KEY = (u: string) => `todo-profile-${u}`
const DATA_KEY = (u: string) => `todo-data-${u}`

export { CURRENT_KEY, SETTINGS_KEY, PROFILE_KEY, DATA_KEY }

/**
 * 加载所有注册用户
 */
export function loadUsers(): User[] {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

/**
 * 保存用户列表
 */
export function saveUsers(users: User[]) {
  localStorage.setItem(USER_KEY, JSON.stringify(users))
}

/**
 * 加载指定用户的数据（分组、任务、回收站）
 */
export function loadData(username: string, defaults: DataShape): DataShape {
  const raw = localStorage.getItem(DATA_KEY(username))
  if (!raw) return defaults
  try {
    const parsed = JSON.parse(raw)
    return {
      groups: parsed.groups || defaults.groups,
      tasks: parsed.tasks || defaults.tasks,
      trash: parsed.trash || [],
    }
  } catch {
    return defaults
  }
}

/**
 * 保存指定用户的数据
 */
export function saveData(username: string, data: DataShape) {
  localStorage.setItem(DATA_KEY(username), JSON.stringify(data))
}

/**
 * 加载用户设置
 */
export function loadSettings(username: string, defaults: Settings): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY(username))
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

/**
 * 保存用户设置
 */
export function saveSettings(username: string, settings: Settings) {
  localStorage.setItem(SETTINGS_KEY(username), JSON.stringify(settings))
}

/**
 * 加载用户个人资料
 */
export function loadProfile(username: string, defaults: Profile): Profile {
  const raw = localStorage.getItem(PROFILE_KEY(username))
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

/**
 * 保存用户个人资料
 */
export function saveProfile(username: string, profile: Profile) {
  localStorage.setItem(PROFILE_KEY(username), JSON.stringify(profile))
}

/**
 * 清除指定用户的所有数据
 */
export function clearUserData(username: string) {
  localStorage.removeItem(SETTINGS_KEY(username))
  localStorage.removeItem(PROFILE_KEY(username))
  localStorage.removeItem(DATA_KEY(username))
}

export { USER_KEY }

