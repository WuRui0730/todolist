/**
 * 文件功能：类型定义
 * 包含项目核心数据结构（任务、分组、用户等）的 TypeScript 接口定义。
 */
//多维度任务管理 - 数据模型定义
/**
 * 任务的重要性级别
 * critical: 紧急且重要
 * high: 重要但不紧急
 * normal: 普通任务
 */
export type Importance = 'critical' | 'high' | 'normal'

/**
 * 任务类型
 * focus: 专注任务（番茄钟）
 * habit: 习惯打卡
 * goal: 目标进度
 * task: 普通待办
 */
export type TaskType = 'focus' | 'habit' | 'goal' | 'task'

/**
 * 页面路由类型
 * todo: 待办列表页
 * count: 统计页
 * settings: 设置页
 * profile: 个人资料页
 */
export type Page = 'todo' | 'count' | 'settings' | 'profile'


//分组定义
export type Group = {
  id: string
  name: string
  color: string
  parentId?: string // 父分组ID，用于嵌套分组
  pinned?: boolean // 是否置顶
  order?: number // 排序权重
}

//任务定义
export type Task = {
  id: string
  title: string
  description?: string
  groupId: string
  importance: Importance
  type: TaskType
  dueAt?: string // 截止时间 ISO 字符串
  status: 'todo' | 'done'
  createdAt: string
  completedAt?: string
  // 计时/习惯/目标扩展
  timerMode?: 'countdown' | 'countup' // 计时模式：倒计时或正计时
  durationMinutes?: number // 专注/倒计时分钟
  actualFocusMinutes?: number // 最近一次专注的时间（分钟）
  totalFocusMinutes?: number // 累计专注总时长（分钟）
  repeat?: 'daily' | 'weekly' | 'monthly' // 重复周期
  targetValue?: number // 目标值（如：读10本书）
  targetUnit?: string // 目标单位
  progressValue?: number // 当前进度值
  // 计时取消原因历史
  cancelReasons?: string[]
  // 习惯/目标进度
  history?: { at: string; action: 'progress' | 'reset' | 'complete'; value?: number; note?: string }[]
  // 背景图设置
  backgroundImage?: string
}

/**
 * 回收站中的项目
 */
export type TrashItem = Task & { deletedAt: string; trashUniqueId?: string }

/**
 * 用户信息
 */
export type User = { username: string; password: string }

/**
 * 全局设置
 */
export type Settings = {
  theme: string
  homepageBg: string
  todoBg: string
}

/**
 * 用户个人资料
 */
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

/**
 * 数据存储结构
 */
export type DataShape = {
  groups: Group[]
  tasks: Task[]
  trash: TrashItem[]
}

