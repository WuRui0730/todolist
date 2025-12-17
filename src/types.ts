export type Importance = 'critical' | 'high' | 'normal'
export type TaskType = 'focus' | 'habit' | 'goal' | 'task'
export type Page = 'todo' | 'count' | 'settings' | 'profile'

export type Group = {
  id: string
  name: string
  color: string
  parentId?: string
  pinned?: boolean
  order?: number
}

export type Task = {
  id: string
  title: string
  description?: string
  groupId: string
  importance: Importance
  type: TaskType
  dueAt?: string
  status: 'todo' | 'done'
  createdAt: string
  completedAt?: string
  // 计时/习惯/目标扩展
  timerMode?: 'countdown' | 'countup'
  durationMinutes?: number // 专注/倒计时分钟
  actualFocusMinutes?: number // 最近一次专注的时间（分钟）
  totalFocusMinutes?: number // 累计专注总时长（分钟）
  repeat?: 'daily' | 'weekly' | 'monthly'
  targetValue?: number
  targetUnit?: string
  progressValue?: number
  // 计时取消原因历史
  cancelReasons?: string[]
  // 习惯/目标进度
  history?: { at: string; action: 'progress' | 'reset' | 'complete'; value?: number; note?: string }[]
  // 背景图设置
  backgroundImage?: string
}

export type TrashItem = Task & { deletedAt: string; trashUniqueId?: string }

export type User = { username: string; password: string }

export type Settings = {
  theme: string
  homepageBg: string
  todoBg: string
}

export type Profile = {
  nickname: string
  signature: string
  age?: string
  gender?: string
  birthday?: string
  zodiac?: string
  location?: string
  school?: string
  phone?: string
  email?: string
  photos?: { id: string; url: string; desc?: string; showDesc?: boolean }[]
}

export type DataShape = {
  groups: Group[]
  tasks: Task[]
  trash: TrashItem[]
}

