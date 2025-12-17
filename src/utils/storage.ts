import type { DataShape, Profile, Settings, User } from '../types'

const USER_KEY = 'todo-users'
const CURRENT_KEY = 'todo-current-user'
const SETTINGS_KEY = (u: string) => `todo-settings-${u}`
const PROFILE_KEY = (u: string) => `todo-profile-${u}`
const DATA_KEY = (u: string) => `todo-data-${u}`

export { CURRENT_KEY, SETTINGS_KEY, PROFILE_KEY, DATA_KEY }

export function loadUsers(): User[] {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USER_KEY, JSON.stringify(users))
}

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

export function saveData(username: string, data: DataShape) {
  localStorage.setItem(DATA_KEY(username), JSON.stringify(data))
}

export function loadSettings(username: string, defaults: Settings): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY(username))
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function saveSettings(username: string, settings: Settings) {
  localStorage.setItem(SETTINGS_KEY(username), JSON.stringify(settings))
}

export function loadProfile(username: string, defaults: Profile): Profile {
  const raw = localStorage.getItem(PROFILE_KEY(username))
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function saveProfile(username: string, profile: Profile) {
  localStorage.setItem(PROFILE_KEY(username), JSON.stringify(profile))
}

export function clearUserData(username: string) {
  localStorage.removeItem(SETTINGS_KEY(username))
  localStorage.removeItem(PROFILE_KEY(username))
  localStorage.removeItem(DATA_KEY(username))
}

export { USER_KEY }

