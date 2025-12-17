import type { Group, Profile, Settings, Task } from './types'

export const iconMap: Record<string, string> = {
  todo: '/images/icon/todo.png',
  count: '/images/icon/count.png',
  settings: '/images/icon/settings.png',
  search: '/images/icon/search.png',
  logout: '/images/icon/logout.png',
}

export const themePresets = ['#ffb7c5', '#a7c8ff', '#ffe8a1', '#c9b7ff', '#9ee6b8', '#1f1f1f']

// 莫兰迪色系
export const morandiColors = ['#93c5fd', '#fde68a', '#a7f3d0', '#fbbf24', '#86efac', '#fcd34d']

export const homepageBackgrounds = [
  '/images/HomepageBackground/HomepageBackground1.png',
  '/images/HomepageBackground/HomepageBackground2.png',
  '/images/HomepageBackground/HomepageBackground3.png',
  '/images/HomepageBackground/HomepageBackground4.png',
  '/images/HomepageBackground/HomepageBackground5.png',
]

export const todoBackgrounds = [
  '/images/TodoBackground/TodoBackground1.png',
  '/images/TodoBackground/TodoBackground2.png',
  '/images/TodoBackground/TodoBackground3.png',
  '/images/TodoBackground/TodoBackground4.png',
  '/images/TodoBackground/TodoBackground5.png',
]

export const presetColors = [
  '#ff0000', // 红
  '#00ff00', // 绿
  '#0000ff', // 蓝
  '#00ffff', // 青
  '#ffff00', // 黄
  '#ff00ff', // 品红
  '#ffffff', // 白
  '#000000', // 黑
]

// 兼容性别名
export const colors = presetColors

export const presetGroups: Group[] = [
  { id: 'inbox', name: '未分组', color: '#7cc4a3', order: 1 },
  { id: 'work', name: '工作', color: '#a7c8ff', order: 2 },
  { id: 'wish', name: '心愿', color: '#f5c26b', order: 3 },
  { id: 'study', name: '学习', color: '#c9b7ff', order: 4 },
  { id: 'shop', name: '购物', color: '#ffb7c5', order: 5 },
]

export const defaultTasks: Task[] = [
  {
    id: 't1',
    title: '整理本周工作计划',
    description: '拆分任务并安排时间块',
    groupId: 'work',
    importance: 'high',
    type: 'task',
    dueAt: new Date(Date.now() + 3600 * 1000 * 6).toISOString(),
    status: 'todo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't11',
    title: '准备明天的会议',
    description: '整理会议资料和议程',
    groupId: 'work',
    importance: 'high',
    type: 'task',
    dueAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
    status: 'todo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't12',
    title: '完成项目报告',
    description: '编写本周项目进展报告',
    groupId: 'work',
    importance: 'normal',
    type: 'task',
    dueAt: new Date(Date.now() + 3600 * 1000 * 48).toISOString(),
    status: 'todo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't13',
    title: '学习新的编程语言',
    description: '每天学习30分钟基础语法',
    groupId: 'study',
    importance: 'normal',
    type: 'task',
    dueAt: new Date(Date.now() + 3600 * 1000 * 72).toISOString(),
    status: 'todo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't14',
    title: '整理书房',
    description: '清理和重新整理书桌',
    groupId: 'work',
    importance: 'low',
    type: 'task',
    dueAt: new Date(Date.now() + 3600 * 1000 * 120).toISOString(),
    status: 'todo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: '阅读专业书籍',
    description: '番茄工作法专注阅读',
    groupId: 'study',
    importance: 'normal',
    type: 'focus',
    durationMinutes: 45,
    timerMode: 'countdown',
    dueAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
  {
    id: 't3',
    title: '购买生日礼物',
    description: '关注配送时间',
    groupId: 'shop',
    importance: 'critical',
    type: 'task',
    dueAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    status: 'todo',
    createdAt: new Date().toISOString(),
  },
  // 添加更多已完成的专注任务作为示例数据
  {
    id: 't4',
    title: '编写项目代码',
    description: '完成用户管理模块功能',
    groupId: 'work',
    importance: 'high',
    type: 'focus',
    durationMinutes: 90,
    timerMode: 'countdown',
    cancelReasons: ['临时有事'],
    dueAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
  },
  {
    id: 't5',
    title: '英语口语练习',
    description: '每日英语口语对话训练',
    groupId: 'study',
    importance: 'normal',
    type: 'focus',
    durationMinutes: 30,
    timerMode: 'countdown',
    dueAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
  },
  {
    id: 't6',
    title: '学习新技术框架',
    description: '深入学习 React 高级特性',
    groupId: 'study',
    importance: 'high',
    type: 'focus',
    durationMinutes: 60,
    timerMode: 'countdown',
    dueAt: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 144).toISOString(),
  },
  {
    id: 't7',
    title: '整理会议纪要',
    description: '团队会议记录整理归档',
    groupId: 'work',
    importance: 'normal',
    type: 'focus',
    durationMinutes: 25,
    timerMode: 'countdown',
    cancelReasons: ['被打断', '计划调整'],
    dueAt: new Date(Date.now() - 3600 * 1000 * 168).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 168).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 192).toISOString(),
  },
  {
    id: 't8',
    title: '写技术博客',
    description: '分享开发经验和心得',
    groupId: 'study',
    importance: 'normal',
    type: 'focus',
    durationMinutes: 75,
    timerMode: 'countdown',
    dueAt: new Date(Date.now() - 3600 * 1000 * 240).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 240).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 264).toISOString(),
  },
  {
    id: 't9',
    title: '代码审查',
    description: '审查团队成员提交的代码',
    groupId: 'work',
    importance: 'high',
    type: 'focus',
    durationMinutes: 40,
    timerMode: 'countdown',
    cancelReasons: ['被打断'],
    dueAt: new Date(Date.now() - 3600 * 1000 * 336).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 336).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 360).toISOString(),
  },
  {
    id: 't10',
    title: '学习算法知识',
    description: '复习经典算法和数据结构',
    groupId: 'study',
    importance: 'normal',
    type: 'focus',
    durationMinutes: 50,
    timerMode: 'countdown',
    dueAt: new Date(Date.now() - 3600 * 1000 * 408).toISOString(),
    status: 'done',
    completedAt: new Date(Date.now() - 3600 * 1000 * 408).toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 432).toISOString(),
  },
]

export const defaultSettings: Settings = {
  theme: '#a7c8ff',
  homepageBg: homepageBackgrounds[0],
  todoBg: todoBackgrounds[0],
}

export const defaultProfilePhotos = [
  // 使用3张精选的CDN网络图片作为精选照片
  { id: 'p1', url: 'https://picsum.photos/400/300', desc: '随机艺术', showDesc: false },
  { id: 'p2', url: 'https://picsum.photos/400/300?grayscale', desc: '黑白经典', showDesc: false },
  { id: 'p3', url: 'https://picsum.photos/400/300?random=1', desc: '精选风景', showDesc: false },
]

export const defaultProfile: Profile = {
  nickname: '未命名用户',
  signature: '保持高效，记录每一天',
  photos: defaultProfilePhotos,
}

