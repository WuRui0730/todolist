import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'
// 这个是类型定义
import type { Group, Importance, Page, Profile, Settings, Task, TaskType, TrashItem, User } from './types'
import { AuthPanel } from './components/Auth'
import { TimePicker } from './components/TimePicker'
import { ColorPicker } from './components/ColorPicker'
import { DraggableGroup } from './components/DraggableGroup'
import { InputModal } from './components/InputModal'
import { DatePicker } from './components/DatePicker'
import { UnitSelector } from './components/UnitSelector'
import { DeleteGroupModal } from './components/DeleteGroupModal'
import { ConfirmModal } from './components/ConfirmModal'
import { EditGroupModal } from './components/EditGroupModal'
import ReactECharts from 'echarts-for-react'
import {
  colors,
  defaultProfile,
  defaultSettings,
  defaultTasks,
  homepageBackgrounds,
  iconMap,
  presetGroups,
  themePresets,
  todoBackgrounds,
  defaultProfilePhotos,
  morandiColors,
} from './constants'
import {
  applyTheme,
  formatDate,
  getCountdown,
  getCountdownDHM,
  hashIndex,
  importanceColor,
  isToday,
  isWithin7Days,
} from './utils/helpers'
import {
  CURRENT_KEY,
  clearUserData,
  loadData,
  loadProfile,
  loadSettings,
  loadUsers,
  saveData,
  saveProfile,
  saveSettings,
  saveUsers,
} from './utils/storage'

// 主函数
function App() {
  // 用户相关的state
  const [users, setUsers] = useState<User[]>([])
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    confirm: '',
  })
  const [authError, setAuthError] = useState('')

  // 分组和任务的数据
  const [groups, setGroups] = useState<Group[]>(presetGroups)
  const [tasks, setTasks] = useState<Task[]>(defaultTasks)
  const [trash, setTrash] = useState<TrashItem[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('inbox')
  const [middleCollapsed, setMiddleCollapsed] = useState(false) // 中间栏是否折叠
  const [groupsCollapsed, setGroupsCollapsed] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('') // 搜索关键词
  const [timeSort, setTimeSort] = useState<'asc' | 'desc'>('asc')
  const [importanceSort, setImportanceSort] = useState<'high' | 'low'>('high')
  const [page, setPage] = useState<Page>('todo')
  const [timerTaskId, setTimerTaskId] = useState<string | null>(null)
  const [timerMode, setTimerMode] = useState<'countdown' | 'countup'>('countdown')
  const [timerTotal, setTimerTotal] = useState<number>(25 * 60)
  const [timerRemaining, setTimerRemaining] = useState<number>(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null) // 记录计时开始的真实时间戳
  const [timerElapsedSeconds, setTimerElapsedSeconds] = useState<number>(0) // 记录实际经过的秒数
  const [cancelReasons, setCancelReasons] = useState<string[]>(['被打断', '临时有事', '计划调整'])

  // 注销账号确认弹窗
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 创建分组弹窗
  const [showAddGroupModal, setShowAddGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(colors[0])

  // 拖拽相关状态
  const [draggedGroup, setDraggedGroup] = useState<Group | null>(null)
  const [dropTargetGroup, setDropTargetGroup] = useState<Group | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // 分组展开/收起状态
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // 统计页面相关状态
  const [statsTimeRange, setStatsTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>('day')
  const [statsStartDate, setStatsStartDate] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [editing, setEditing] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    groupId: 'inbox',
    importance: 'normal' as Importance,
    type: 'task' as TaskType,
    dueAt: '',
  })
  const [timerReason, setTimerReason] = useState('')
  const [timerHistory, setTimerHistory] = useState<
    { taskId: string; reason: string; at: string; duration: number; mode: 'countdown' | 'countup' }[]
  >([])
  const [remindToast, setRemindToast] = useState<string | null>(null)
  const [progressDelta, setProgressDelta] = useState(1)
  const [todayKey, setTodayKey] = useState<string>(() => new Date().toDateString())
  const [remindedToday, setRemindedToday] = useState<Set<string>>(new Set())
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [contextMenu, setContextMenu] = useState<{
    taskId: string
    x: number
    y: number
  } | null>(null)
  const [groupMenu, setGroupMenu] = useState<{
    groupId: string
    x: number
    y: number
  } | null>(null)

  // 新增弹框状态
  const [addChildGroupModal, setAddChildGroupModal] = useState(false)
  const [childGroupName, setChildGroupName] = useState('')
  const [childGroupColor, setChildGroupColor] = useState(colors[0])
  const [parentGroupId, setParentGroupId] = useState<string>('')

  const [editGroupModal, setEditGroupModal] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string>('')
  const [editingGroupName, setEditingGroupName] = useState('')
  const [editingGroupColor, setEditingGroupColor] = useState('')

  const [deleteGroupModal, setDeleteGroupModal] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<string>('')
  const [deleteOption, setDeleteOption] = useState<'move' | 'delete'>('move') // 'move': 移入未分组, 'delete': 删除分组及任务

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    groupId: 'inbox',
    importance: 'normal' as Importance,
    type: 'task' as TaskType,
    dueAt: '',
    durationHours: 0,
    durationMinutes: 25,
    durationSeconds: 0,
    timerMode: 'countdown' as 'countdown' | 'countup',
    repeat: 'daily' as 'daily' | 'weekly' | 'monthly',
    targetValue: 1,
    targetUnit: '次',
    remind: false,
    remindHour: 9,
    backgroundImage: '', // 新增：任务背景图
  })

  useEffect(() => {
    const loaded = loadUsers()
    setUsers(loaded)
    const cur = localStorage.getItem(CURRENT_KEY)
    if (cur) {
      setCurrentUser(cur)
      const data = loadData(cur, { groups: presetGroups, tasks: defaultTasks, trash: [] })
      console.log('加载用户数据:', cur, '任务数:', data.tasks.length)
      setGroups(data.groups)
      setTasks(data.tasks)
      setTrash(data.trash || [])
      const setts = loadSettings(cur, defaultSettings)
      setSettings(setts)
      const prof = loadProfile(cur, defaultProfile)
      setProfile(prof)
      applyTheme(setts.theme)
      const remembered = localStorage.getItem(`todo-reminded-${cur}-${todayKey}`)
      if (remembered) {
        try {
          setRemindedToday(new Set(JSON.parse(remembered)))
        } catch {
          setRemindedToday(new Set())
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!currentUser) return
    saveData(currentUser, { groups, tasks, trash })
  }, [groups, tasks, trash, currentUser])

  useEffect(() => {
    if (!currentUser) return
    const now = Date.now()
    setTrash((prev) => prev.filter((t) => now - new Date(t.deletedAt).getTime() < 7 * 24 * 3600 * 1000))
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    saveSettings(currentUser, settings)
    applyTheme(settings.theme)
  }, [settings, currentUser])

  useEffect(() => {
    if (!currentUser) return
    saveProfile(currentUser, profile)
  }, [profile, currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`todo-reminded-${currentUser}-${todayKey}`, JSON.stringify(Array.from(remindedToday)))
    }
  }, [remindedToday, todayKey, currentUser])

  // 每秒更新当前时间，用于动态倒计时
  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000) // 每秒更新一次

    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!timerRunning || !timerTaskId) return

    const id = window.setInterval(() => {
      // 计算当前这次运行的实际时间（加上之前暂停的时间）
      const currentRunTime = timerStartTime ? Math.floor((Date.now() - timerStartTime) / 1000) : 0
      const totalElapsedSeconds = timerElapsedSeconds + currentRunTime

      setTimerRemaining((prev) => {
        if (timerMode === 'countdown') {
          if (prev <= 1) {
            window.clearInterval(id)
            setTimerRunning(false)

            // 计算实际专注时间（秒）
            const actualSeconds = totalElapsedSeconds || timerTotal
            const actualMinutes = Math.ceil(actualSeconds / 60)

            setTasks((old) =>
              old.map((t) =>
                t.id === timerTaskId ? {
                  ...t,
                  status: 'done',
                  completedAt: new Date().toISOString(),
                  actualFocusMinutes: actualMinutes, // 最近一次专注时间
                  totalFocusMinutes: (t.totalFocusMinutes || 0) + actualMinutes, // 累计总专注时间
                } : t,
              ),
            )
            setTimerHistory((prev) => [
              ...prev,
              { taskId: timerTaskId, reason: '计时完成', at: new Date().toISOString(), duration: actualSeconds, mode: timerMode },
            ])
            setRemindToast('计时完成')

            // 重置计时器状态
            setTimerStartTime(null)
            setTimerElapsedSeconds(0)
            return 0
          }
          return prev - 1
        }
        return prev + 1
      })
    }, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [timerRunning, timerTaskId, timerMode, timerStartTime, timerElapsedSeconds])

  useEffect(() => {
    if (!remindToast) return
    const t = window.setTimeout(() => setRemindToast(null), 2000)
    return () => window.clearTimeout(t)
  }, [remindToast])

  useEffect(() => {
    const nowKey = new Date().toDateString()
    if (todayKey !== nowKey) {
      setTodayKey(nowKey)
      // 每天刷新时重置超期提醒，未来可挂钩提醒逻辑
      setRemindedToday(new Set())
    }
  }, [todayKey])

  useEffect(() => {
    // 简易提醒：习惯/目标勾选提醒，且当前小时达到 remindHour 时弹一次
    const checkRemind = () => {
      const now = new Date()
      const hour = now.getHours()
      const key = now.toDateString()
      if (key !== todayKey) {
        setTodayKey(key)
        setRemindedToday(new Set())
      }
      const toRemind = tasks.filter(
        (t) => (t.type === 'habit' || t.type === 'goal') && (t as any).remind && (t as any).remindHour === hour,
      )
      toRemind.forEach((t) => {
        if (!remindedToday.has(t.id)) {
          setRemindToast(`提醒：${t.title}`)
          setRemindedToday((prev) => new Set(prev).add(t.id))
        }
      })
    }
    const id = window.setInterval(checkRemind, 60 * 1000)
    checkRemind()
    return () => window.clearInterval(id)
  }, [tasks, remindedToday, todayKey])

  // 处理登录
  const handleLogin = () => {
    setAuthError('')
    const user = users.find((u) => u.username === authForm.username.trim())
    if (!user) {
      setAuthError('账户不存在')
      return
    }
    if (user.password !== authForm.password) {
      setAuthError('密码不正确')
      return
    }
    // 登录成功，保存用户信息
    console.log('用户登录:', user.username) // 调试日志
    setCurrentUser(user.username)
    localStorage.setItem(CURRENT_KEY, user.username)
    const data = loadData(user.username, { groups: presetGroups, tasks: defaultTasks, trash: [] })
    setGroups(data.groups)
    setTasks(data.tasks)
    setTrash(data.trash || [])
    const setts = loadSettings(user.username, defaultSettings)
    setSettings(setts)
    const prof = loadProfile(user.username, defaultProfile)
    setProfile(prof)
    applyTheme(setts.theme) // 应用主题
    setPage('todo') // 跳转到待办页
  }

  // 注册功能
  const handleRegister = () => {
    setAuthError('')
    const name = authForm.username.trim()
    // 检查用户名和密码
    if (!name || !authForm.password) {
      setAuthError('请输入账号和密码')
      return
    }
    // 检查两次密码
    if (authForm.password !== authForm.confirm) {
      setAuthError('两次输入的密码不一致')
      return
    }
    // 检查用户名是否已存在
    if (users.some((u) => u.username === name)) {
      setAuthError('账户已存在')
      return
    }
    const next = [...users, { username: name, password: authForm.password }]
    setUsers(next)
    saveUsers(next) // 保存到本地
    setMode('login')
    setAuthError('注册成功，请登录')
  }

  
  // 拖拽处理函数
  const handleDragStart = (group: Group) => {
    setDraggedGroup(group)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetGroup: Group) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedGroup || draggedGroup.id === targetGroup.id) {
      setDraggedGroup(null)
      setDropTargetGroup(null)
      return
    }

    // 检查是否为特殊分组（不允许拖拽）
    const specialIds = ['today', 'week', 'all', 'completed', 'trash']
    if (specialIds.includes(draggedGroup.id) || specialIds.includes(targetGroup.id)) {
      setDraggedGroup(null)
      setDropTargetGroup(null)
      return
    }

    // 检查是否会创建循环嵌套
    const wouldCreateCycle = (parentId: string, childId: string): boolean => {
      if (parentId === childId) return true
      const parent = groups.find(g => g.id === parentId)
      if (!parent || !parent.parentId) return false
      return wouldCreateCycle(parent.parentId, childId)
    }

    // 如果拖拽到自己的后代分组上，不允许
    if (wouldCreateCycle(targetGroup.id, draggedGroup.id)) {
      alert('不能将分组拖拽到其子分组中')
      setDraggedGroup(null)
      setDropTargetGroup(null)
      return
    }

    // 获取鼠标位置来判断是排序还是嵌套
    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const isDroppingOnTop = e.clientY < midY

    // 如果拖拽到目标分组的上半部分，进行排序
    // 如果拖拽到目标分组的下半部分，根据上下文决定是嵌套还是排序
    if (isDroppingOnTop) {
      // 拖到上方，总是进行排序，保持同级
      // 排序逻辑：重新排列order
      const draggedIndex = groups.findIndex(g => g.id === draggedGroup.id)
      const targetIndex = groups.findIndex(g => g.id === targetGroup.id)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newGroups = [...groups]

        // 如果拖拽到下半部分且目标是顶级分组，可以将拖拽的分组变为顶级分组
        let newDraggedGroup = { ...newGroups[draggedIndex] }
        if (!isDroppingOnTop && !targetGroup.parentId) {
          // 拖拽到顶级分组下方，移除parentId，使其成为顶级分组
          newDraggedGroup.parentId = undefined
          newGroups[draggedIndex] = newDraggedGroup
        }

        const [removed] = newGroups.splice(draggedIndex, 1)

        // 确定插入位置和parentId
        let insertIndex = isDroppingOnTop ? targetIndex : targetIndex + 1
        let parentId = targetGroup.parentId

        // 如果拖拽到下半部分且目标是顶级分组，拖拽的分组也应该是顶级分组
        if (!isDroppingOnTop && !targetGroup.parentId) {
          parentId = undefined
          // 调整插入位置，考虑到删除操作
          if (draggedIndex < targetIndex) {
            insertIndex = targetIndex
          }
        }

        // 更新拖拽分组的parentId
        removed.parentId = parentId

        newGroups.splice(insertIndex, 0, removed)

        // 重新设置order（只对同级分组）
        const siblings = newGroups.filter(g => g.parentId === parentId)
        siblings.forEach((group, index) => {
          const actualIndex = newGroups.findIndex(g => g.id === group.id)
          newGroups[actualIndex].order = index + 1
        })

        setGroups(newGroups)
      }
    } else {
      // 拖到下半部分，检查是否需要嵌套
      // 如果目标分组没有父分组，可以将拖拽的分组作为其子分组
      // 如果拖拽的分组已经有父分组，可以选择移出或移到新的父分组

      // 检查层级限制（最多三级）
      const getDepth = (groupId: string, depth = 1): number => {
        const group = groups.find(g => g.id === groupId)
        if (!group || !group.parentId) return depth
        if (depth >= 3) return depth // 已经达到最大深度
        return getDepth(group.parentId, depth + 1)
      }

      // 如果目标分组没有父分组，且层级未达到限制，则嵌套
      if (!targetGroup.parentId && getDepth(targetGroup.id) < 3) {
        // 将拖拽的分组作为目标分组的子分组
        setGroups(prev => {
          const updated = prev.map(g =>
            g.id === draggedGroup.id ? { ...g, parentId: targetGroup.id } : g
          )

          // 重新排序目标分组下的子分组
          const children = updated.filter(g => g.parentId === targetGroup.id)
          children.forEach((child, index) => {
            const actualIndex = updated.findIndex(g => g.id === child.id)
            updated[actualIndex].order = index + 1
          })

          return updated
        })
      } else if (targetGroup.parentId && draggedGroup.parentId !== targetGroup.parentId) {
        // 如果两个二级分组拖拽合并，在它们的一级分组下创建新的二级分组
        const commonParentId = targetGroup.parentId
        const maxOrder = Math.max(0, ...groups.map((g) => g.order || 0))
        const parentGroup: Group = {
          id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: '新分组',
          color: targetGroup.color,
          order: targetGroup.order || maxOrder + 1,
          parentId: commonParentId
        }

        const updatedGroups = groups.map(group => {
          if (group.id === draggedGroup.id || group.id === targetGroup.id) {
            return { ...group, parentId: parentGroup.id }
          }
          return group
        })

        setGroups([...updatedGroups, parentGroup])
      } else if (targetGroup.parentId && draggedGroup.parentId === targetGroup.parentId) {
        // 如果两个二级分组属于同一个一级分组，创建新的二级分组
        const commonParentId = targetGroup.parentId
        const maxOrder = Math.max(0, ...groups.map((g) => g.order || 0))
        const parentGroup: Group = {
          id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: '新分组',
          color: targetGroup.color,
          order: targetGroup.order || maxOrder + 1,
          parentId: commonParentId
        }

        const updatedGroups = groups.map(group => {
          if (group.id === draggedGroup.id || group.id === targetGroup.id) {
            return { ...group, parentId: parentGroup.id }
          }
          return group
        })

        setGroups([...updatedGroups, parentGroup])
      }
    }

    setDraggedGroup(null)
    setDropTargetGroup(null)
  }

  const handleDragEnd = () => {
    setDraggedGroup(null)
    setDropTargetGroup(null)
    setDragOverIndex(null)
  }

  const handleAddChildGroup = (parentId: string) => {
    const parent = groups.find((g) => g.id === parentId)
    if (!parent) return
    const depth = (gid: string, level = 1): number => {
      const g = groups.find((item) => item.id === gid)
      if (!g || !g.parentId) return level
      return depth(g.parentId, level + 1)
    }
    if (depth(parentId) >= 3) {
      alert('已到达最多三级分组')
      return
    }
    setParentGroupId(parentId)
    setChildGroupName('新分组')
    setChildGroupColor(parent.color)
    setAddChildGroupModal(true)
  }

  const confirmAddChildGroup = (name: string, color: string) => {
    const maxOrder = Math.max(0, ...groups.map((g) => g.order || 0))
    const newGroup: Group = {
      id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      parentId: parentGroupId,
      order: maxOrder + 1,
    }
    setGroups((prev) => [...prev, newGroup])
    setAddChildGroupModal(false)
  }

  const handleEditGroup = (groupId: string) => {
    const g = groups.find((x) => x.id === groupId)
    if (!g) return
    setEditingGroupId(groupId)
    setEditingGroupName(g.name)
    setEditingGroupColor(g.color)
    setEditGroupModal(true)
  }

  const confirmEditGroup = (name: string, color: string) => {
    setGroups((prev) => prev.map((x) =>
      x.id === editingGroupId ? { ...x, name, color } : x
    ))
    setEditGroupModal(false)
  }

  const handleDeleteGroup = (groupId: string) => {
    if (groupId === 'inbox') {
      alert('默认分组不可删除')
      return
    }
    setDeletingGroupId(groupId)
    setDeleteGroupModal(true)
  }

  const confirmDeleteGroup = () => {
    if (deleteOption === 'move') {
      // 移入未分组：只删除分组，任务移到未分组
      setGroups((prev) => prev.filter((g) => g.id !== deletingGroupId))
      setTasks((prev) => prev.map((t) =>
        t.groupId === deletingGroupId ? { ...t, groupId: 'inbox' } : t
      ))
    } else {
      // 删除分组及任务：将任务移入回收站
      const group = groups.find(g => g.id === deletingGroupId)
      const tasksInGroup = tasks.filter(t => t.groupId === deletingGroupId)

      // 将任务移入回收站
      const trashItems: TrashItem[] = tasksInGroup.map(task => ({
        ...task,
        deletedAt: new Date().toISOString(),
        trashUniqueId: `${task.id}-${Date.now()}`
      }))

      setTrash(prev => [...trashItems, ...prev])
      setTasks(prev => prev.filter(t => t.groupId !== deletingGroupId))
      setGroups(prev => prev.filter(g => g.id !== deletingGroupId))
    }

    if (selectedGroup === deletingGroupId) setSelectedGroup('inbox')
    setDeleteGroupModal(false)
  }

  const handlePinGroup = (groupId: string, pinned: boolean) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, pinned } : g)))
  }

  const reorderWithinParent = (parentId: string | undefined, dragId: string, targetId: string) => {
    setGroups((prev) => {
      const list = prev.filter((g) => g.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0))
      const dragIndex = list.findIndex((g) => g.id === dragId)
      const targetIndex = list.findIndex((g) => g.id === targetId)
      if (dragIndex === -1 || targetIndex === -1) return prev
      const [dragItem] = list.splice(dragIndex, 1)
      list.splice(targetIndex, 0, dragItem)
      const newOrders = list.map((g, idx) => ({ ...g, order: idx + 1 }))
      const others = prev.filter((g) => g.parentId !== parentId)
      return [...others, ...newOrders]
    })
  }

  const mergeGroups = (dragId: string, targetId: string) => {
    setGroups((prev) => {
      const drag = prev.find((g) => g.id === dragId)
      const target = prev.find((g) => g.id === targetId)
      if (!drag || !target) return prev
      const parentId = target.parentId
      const newId = `merge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newGroup: Group = {
        id: newId,
        name: '新分组',
        color: target.color,
        parentId,
        order: target.order || 1,
      }
      // push down siblings orders after target position
      const updated = prev.map((g) => {
        if (g.parentId === parentId && (g.order || 0) >= (target.order || 1)) {
          return { ...g, order: (g.order || 0) + 1 }
        }
        return g
      })
      const withNew = [...updated, newGroup].map((g) => {
        if (g.id === targetId) return { ...g, parentId: newId, order: 1 }
        if (g.id === dragId) return { ...g, parentId: newId, order: 2 }
        return g
      })
      return withNew
    })
  }

  
  // 创建任务
  const handleCreateTask = () => {
    if (!taskForm.title.trim()) return
    const ts = Date.now() // 获取时间戳
    const randomSuffix = Math.random().toString(36).substr(2, 9) // 添加随机后缀
    const t_mode = taskForm.type === 'focus' ? 'countdown' : 'countup'
    const totalMinutes = taskForm.type === 'focus'
      ? (taskForm.durationHours * 60 + taskForm.durationMinutes + Math.floor(taskForm.durationSeconds / 60))
      : undefined

    const newTask: Task = {
      id: `t-${ts}-${randomSuffix}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      groupId: taskForm.groupId,
      importance: taskForm.importance,
      type: taskForm.type,
      timerMode: t_mode,
      durationMinutes: totalMinutes || 25,
      repeat: taskForm.type === 'habit' ? taskForm.repeat : undefined,
      targetValue: taskForm.type !== 'task' ? taskForm.targetValue : undefined,
      targetUnit: taskForm.type !== 'task' ? taskForm.targetUnit : undefined,
      dueAt: taskForm.dueAt ? new Date(taskForm.dueAt).toISOString() : undefined,
      status: 'todo',
      createdAt: new Date().toISOString(),
      history: [],
      backgroundImage: taskForm.backgroundImage || undefined, // 新增：任务背景图
    }
    console.log('创建新任务:', newTask) // 打印完整任务信息
    setTasks((prev) => {
      const newTasks = [newTask, ...prev]
      console.log('更新后的任务列表:', newTasks.length, '个任务')
      console.log('当前selectedGroup:', selectedGroup)
      return newTasks
    }) // 添加到任务列表
    // 重置表单
    setTaskForm({
      title: '',
      description: '',
      groupId: selectedGroup,
      importance: 'normal',
      type: 'task',
      dueAt: '',
      durationHours: 0,
      durationMinutes: 25,
      durationSeconds: 0,
      timerMode: 'countdown',
      repeat: 'daily',
      targetValue: 1,
      targetUnit: '次',
      remind: false,
      remindHour: 9,
      backgroundImage: '', // 新增：重置背景图
    })
    setShowTaskForm(false)
  }

  // 切换任务状态
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          // 如果是目标任务，记录进度而不是标记完成
          if (t.type === 'goal') {
            const incrementValue = 1 // 每次点击增加的进度值
            const newProgressValue = (t.progressValue || 0) + incrementValue
            const isCompleted = newProgressValue >= (t.targetValue || 0)

            return {
              ...t,
              progressValue: newProgressValue,
              // 只有达到目标值时才标记为完成
              status: isCompleted ? 'done' : 'todo',
              completedAt: isCompleted ? new Date().toISOString() : undefined,
              history: [
                ...(t.history || []),
                {
                  at: new Date().toISOString(),
                  action: 'progress',
                  value: incrementValue,
                  note: `进度 +${incrementValue}`
                }
              ]
            }
          } else {
            // 其他类型任务正常切换状态
            return {
              ...t,
              status: t.status === 'todo' ? 'done' : 'todo',
              completedAt: t.status === 'todo' ? new Date().toISOString() : undefined,
            }
          }
        }
        return t
      }),
    )
  }

  // 删除任务
  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id) // 找到要删除的任务
      if (!target) return prev

      // 检查是否已经在 trash 中（防止重复删除）
      setTrash((old) => {
        const alreadyInTrash = old.some(t => t.id === id)
        if (alreadyInTrash) return old

        // 为 trash 项目添加唯一标识，即使同一任务被多次删除也有不同的 key
        const uniqueId = `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        return [{ ...target, deletedAt: new Date().toISOString(), trashUniqueId: uniqueId }, ...old] // 放进回收站
      })

      return prev.filter((t) => t.id !== id)
    })
    // 如果正在计时就停止
    if (timerTaskId === id) {
      setTimerRunning(false)
      setTimerTaskId(null)
    }
  }

  // 创建分组
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: Group = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newGroupName.trim(),
      color: newGroupColor,
      parentId: undefined,
      order: Date.now(),
      pinned: false
    }

    setGroups(prev => [...prev, newGroup])
    setNewGroupName('')
    setNewGroupColor(colors[0])
    setShowAddGroupModal(false)
  }

  const incrementProgress = (taskId: string, delta: number, note: string) => {
    setTasks((prev) =>
      prev.map((x) =>
        x.id === taskId
          ? {
              ...x,
              progressValue: (x.progressValue || 0) + delta,
              history: [...(x.history || []), { at: new Date().toISOString(), action: 'progress', value: delta, note }],
            }
          : x,
      ),
    )
  }

  
  const moveTask = (id: string, targetGroup: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, groupId: targetGroup } : t)))
  }

  // 判断任务是否超时
  const overdue = (t: Task) => t.dueAt && new Date(t.dueAt).getTime() < Date.now() && t.status === 'todo'

  const filteredTasks = useMemo(() => {
    if (selectedGroup === 'completed') {
      return tasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    }

    if (selectedGroup === 'trash') return []

    let list = selectedGroup === 'all' ? tasks : tasks.filter((t) => t.status === 'todo')
    if (selectedGroup === 'today') {
      list = list.filter((t) => isToday(t.dueAt))
    } else if (selectedGroup === 'week') {
      list = list.filter((t) => isWithin7Days(t.dueAt))
    } else if (selectedGroup !== 'all') {
      list = list.filter((t) => t.groupId === selectedGroup)
    }

    const overdueTasks = list
      .filter((t) => overdue(t))
      .sort((a, b) => (a.dueAt && b.dueAt ? new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime() : 0))
    const pending = list
      .filter((t) => !overdue(t))
      .sort((a, b) => {
        const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Infinity
        const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Infinity
        return aDue - bDue
      })
    // 如果是全部待办，按照创建时间排序
    if (selectedGroup === 'all') {
      const result = [...overdueTasks, ...pending].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      console.log('全部待办 - 过滤后的任务数:', result.length)
      return result
    }

    const result = [...overdueTasks, ...pending]
    console.log('过滤后的任务数:', result.length, '当前分组:', selectedGroup)
    return result
  }, [tasks, selectedGroup])

  const searchResults = useMemo(() => {
    let list = tasks.filter((t) => t.title.toLowerCase().includes(searchKeyword.toLowerCase()))
    list = list.sort((a, b) => {
      const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Infinity
      const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Infinity
      const rank: Record<Importance, number> = { critical: 0, high: 1, normal: 2 }

      // 计算时间分数（归一化到0-1范围）
      const timeScoreA = aDue === Infinity ? 1 : (Date.now() - aDue) / (365 * 24 * 60 * 60 * 1000) // 转换为年
      const timeScoreB = bDue === Infinity ? 1 : (Date.now() - bDue) / (365 * 24 * 60 * 60 * 1000)

      // 计算重要性分数（0-2，数字越小越重要）
      const importanceScoreA = rank[a.importance]
      const importanceScoreB = rank[b.importance]

      // 计算最终分数：重要性分数 + 时间分数
      // 这样两个条件都会影响排序，但都不会完全覆盖另一个
      const finalScoreA = importanceScoreA * 0.6 + timeScoreA * 0.4 // 重要性权重60%，时间权重40%
      const finalScoreB = importanceScoreB * 0.6 + timeScoreB * 0.4

      let diff = finalScoreA - finalScoreB

      // 根据用户选择调整方向
      if (timeSort === 'desc') {
        diff = -diff // 时间倒序时反转
      }
      if (importanceSort === 'low') {
        diff = -diff // 重要性低优先时反转
      }

      return diff
    })
    return list
  }, [tasks, searchKeyword, timeSort, importanceSort])

  // 退出登录
  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(CURRENT_KEY) // 清除缓存
    setPage('todo')
  }

  // 注销账号
  const deleteAccount = () => {
    if (!currentUser) return
    setShowDeleteConfirm(true) // 显示确认弹窗
  }

  // 确认删除账号
  const confirmDeleteAccount = () => {
    if (!currentUser) return
    const filtered = users.filter((u) => u.username !== currentUser) // 过滤掉当前用户
    setUsers(filtered)
    saveUsers(filtered)
    clearUserData(currentUser) // 清除用户数据
    setShowDeleteConfirm(false) // 关闭弹窗
    logout() // 然后退出
  }

  // 获取当前主题色的实际值
  const getCurrentThemeColor = () => {
    if (typeof window !== 'undefined') {
      const rootStyle = getComputedStyle(document.documentElement)
      return rootStyle.getPropertyValue('--theme-primary').trim()
    }
    return '#a7c8ff' // 默认颜色
  }

  // 统计数据 - 包含所有类型的任务
  const totalTasks = tasks // 所有任务
  const completedTasks = totalTasks.filter((t) => t.status === 'done') // 完成的
  const uncompletedTasks = totalTasks.filter((t) => t.status === 'todo') // 未完成的
    const todayCount = tasks.filter((t) => t.status === 'todo' && isToday(t.dueAt)).length
  const weekCount = tasks.filter((t) => t.status === 'todo' && isWithin7Days(t.dueAt)).length
  const specialItems = useMemo(
    () => [
      { id: 'today', name: '今天任务', count: todayCount, color: '#9ee6b8' },
      { id: 'week', name: '最近七天', count: weekCount, color: '#ffe8a1' },
      { id: 'all', name: '全部待办', count: tasks.length, color: '#a7c8ff' },
      { id: 'completed', name: '已完成', count: completedTasks.length, color: '#8a94a6' },
      { id: 'trash', name: '最近删除', count: trash.length, color: '#d63031' },
    ],
    [todayCount, weekCount, tasks.length, completedTasks.length, trash.length],
  )

  
  // 只统计当前 groups 数组中存在的分组（已删除的分组不在 groups 中，所以不会统计）
  const groupProgress = groups
    .map((g) => {
      const groupTasks = totalTasks.filter((t) => t.groupId === g.id)
      const done = groupTasks.filter((t) => t.status === 'done').length
      return {
        id: g.id,
        name: g.name,
        done,
        total: groupTasks.length,
        color: g.color,
      }
    })

  // 专注统计数据计算
  // 获取有效的用户分组（排除系统分组）
  const getAvailableGroups = () => {
    return groups.filter(g => {
      // 排除系统预设的特殊分组ID
      const systemGroupIds = ['today', 'week', 'all', 'completed', 'trash', 'inbox']
      return !systemGroupIds.includes(g.id) && g.id && g.name
    })
  }

  const focusStats = useMemo(() => {
    const focusTasks = tasks.filter(t => t.type === 'focus')
    const totalMinutes = focusTasks.reduce((acc, t) => acc + (t.totalFocusMinutes || 0), 0) // 使用累计专注时间，包括未完成的任务
    const completedSessions = focusTasks.filter(t => t.status === 'done').length

    // 计算起始日期后的数据
    const startDate = statsStartDate ? new Date(statsStartDate) : new Date(0)
    const filteredTasks = focusTasks.filter(t =>
      t.completedAt && new Date(t.completedAt) >= startDate
    )

    const filteredMinutes = filteredTasks.reduce((acc, t) => acc + (t.totalFocusMinutes || 0), 0) // 使用累计专注时间
    const filteredSessions = filteredTasks.length

    // 计算日均
    const daysSinceStart = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1
    const dailyAvg = Math.floor(filteredMinutes / daysSinceStart)

    return {
      totalMinutes: filteredMinutes,
      totalSessions: filteredSessions,
      dailyAvgMinutes: dailyAvg,
      allTimeMinutes: totalMinutes,
      allTimeSessions: completedSessions
    }
  }, [tasks, statsStartDate])

  // 按时间范围过滤任务
  const getTasksByTimeRange = useMemo(() => {
    let startDate: Date, endDate: Date

    switch (statsTimeRange) {
      case 'day':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(selectedDate)
        startDate.setDate(startDate.getDate() - selectedDate.getDay())
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
        break
      default:
        return tasks
    }

    return tasks.filter(t => {
      const taskDate = new Date(t.createdAt)
      return taskDate >= startDate && taskDate < endDate
    })
  }, [tasks, statsTimeRange, selectedDate])

  // 打断原因统计
  const cancelReasonStats = useMemo(() => {
    const reasonCounts: Record<string, number> = {}
    const focusTasks = tasks.filter(t => t.type === 'focus')
    focusTasks.forEach(task => {
      if (task.cancelReasons) {
        task.cancelReasons.forEach(reason => {
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
        })
      }
    })
    return Object.entries(reasonCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: focusTasks.length > 0 ? Math.round((count / focusTasks.length) * 100) : 0
    }))
  }, [tasks])

  // 本月专注时段统计
  const monthlyFocusStats = useMemo(() => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const daysInMonth = lastDay.getDate()
    const dailyStats = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1)
      const nextDate = new Date(year, month, i + 2)

      const dayTasks = tasks.filter(t =>
        t.type === 'focus' &&
        t.status === 'done' &&
        t.completedAt &&
        new Date(t.completedAt) >= date &&
        new Date(t.completedAt) < nextDate
      )

      return {
        day: i + 1,
        minutes: dayTasks.reduce((sum, task) => sum + (task.totalFocusMinutes || 0), 0), // 使用累计专注时间
        tasks: dayTasks.length
      }
    })

    return dailyStats
  }, [tasks, selectedMonth])

  // 年度专注分布统计
  const yearlyFocusStats = useMemo(() => {
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const startDate = new Date(selectedYear, i, 1)
      const endDate = new Date(selectedYear, i + 1, 0)

      const monthTasks = tasks.filter(t =>
        t.type === 'focus' &&
        t.status === 'done' &&
        t.completedAt &&
        new Date(t.completedAt) >= startDate &&
        new Date(t.completedAt) <= endDate
      )

      return {
        month: i + 1,
        monthName: `${i + 1}月`,
        minutes: monthTasks.reduce((sum, task) => sum + (task.totalFocusMinutes || 0), 0), // 使用累计专注时间
        tasks: monthTasks.length
      }
    })

    return monthlyStats
  }, [tasks, selectedYear])

  // 当日专注统计
  const dailyFocusStats = useMemo(() => {
    const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)

    const dayTasks = tasks.filter(t =>
      t.type === 'focus' &&
      t.status === 'done' &&
      t.completedAt &&
      new Date(t.completedAt) >= startOfDay &&
      new Date(t.completedAt) < endOfDay
    )

    return {
      sessions: dayTasks.length,
      minutes: dayTasks.reduce((sum, task) => sum + (task.totalFocusMinutes || 0), 0) // 使用累计专注时间
    }
  }, [tasks, selectedDate])

  // ECharts 图表配置 - 移到变量定义之后避免 hooks 顺序错误
  const focusTimeChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}分钟 ({d}%)'
    },
    series: [{
      name: '专注时长',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show:false,
        position:'center'
      },
  
      labelLine: {
        show: false
      },
      data: getTasksByTimeRange
        .filter(t => t.type === 'focus' && t.status === 'done')
        .slice(0, 5)
        .map((t, index) => ({
          value: t.totalFocusMinutes || 0, // 使用累计专注时间
          name: t.title,
          itemStyle: {
            color: morandiColors[index % morandiColors.length]
          }
        }))
    }]
  }), [getTasksByTimeRange, statsTimeRange, selectedDate, morandiColors])

  const interruptReasonChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}次 ({d}%)'
    },
    series: [{
      name: '打断原因',
      type: 'pie',
      radius: ['40%', '70%'],
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: cancelReasonStats.map((item, index) => ({
        value: item.count,
        name: item.reason,
        itemStyle: {
          color: morandiColors[index % morandiColors.length]
        }
      }))
    }]
  }), [cancelReasonStats, morandiColors])

  const taskCompletionChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      name: '任务状态',
      type: 'pie',
      radius: ['40%', '70%'],
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: [
        { value: completedTasks.length, name: '已完成', itemStyle: { color: getCurrentThemeColor() } },
        { value: uncompletedTasks.length, name: '未完成', itemStyle: { color: '#f0f0f0' } }
      ]
    }]
  }), [completedTasks.length, uncompletedTasks.length, getCurrentThemeColor()])

  const taskTrendChartOption = useMemo(() => ({
    title: {
      text: '任务完成趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: getTasksByTimeRange.map(t => t.title.slice(0, 8))
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '任务数',
      type: 'line',
      smooth: true,
      data: getTasksByTimeRange.map(() => 1),
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{
            offset: 0, color: getCurrentThemeColor(),
            opacity: 0.8
          }, {
            offset: 1, color: getCurrentThemeColor(),
            opacity: 0.1
          }]
        }
      },
      itemStyle: {
        color: getCurrentThemeColor()
      }
    }]
  }), [getTasksByTimeRange, statsTimeRange, statsStartDate, getCurrentThemeColor()])

  // 本月专注时段分布柱形图
  const monthlyFocusChartOption = useMemo(() => ({
    title: {
      text: `${selectedMonth.getFullYear()}年${selectedMonth.getMonth() + 1}月`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}日: {c}分钟'
    },
    xAxis: {
      type: 'category',
      data: monthlyFocusStats.map(item => item.day)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '专注时长',
      type: 'bar',
      data: monthlyFocusStats.map((item, index) => ({
        value: item.minutes,
        itemStyle: {
          color: morandiColors[index % 4]
        }
      })),
      barWidth: '60%',
      itemStyle: {
        borderRadius: [10, 10, 0, 0]
      },
      // label: {
      //   show: true,
      //   position: 'top',
      //   formatter: '{c}'
      // }
    }]
  }), [monthlyFocusStats, selectedMonth, morandiColors])

  // 年度专注分布柱形图
  const yearlyFocusChartOption = useMemo(() => ({
    title: {
      text: `${selectedYear}年`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}小时'
    },
    xAxis: {
      type: 'category',
      data: yearlyFocusStats.map(item => item.monthName)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '专注时长',
      type: 'bar',
      data: yearlyFocusStats.map((item, index) => ({
        value: Math.floor(item.minutes / 60),
        itemStyle: {
          color: morandiColors[index % 4]
        }
      })),
      barWidth: '60%',
      itemStyle: {
        borderRadius: [10, 10, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}小时'
      }
    }]
  }), [yearlyFocusStats, selectedYear, morandiColors])

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      if (a.pinned !== b.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
      return (a.order || 0) - (b.order || 0)
    })
  }, [groups])

  const renderGroups = (parentId?: string, level = 1) => {
    return sortedGroups
      .filter((g) => g.parentId === parentId)
      .map((g) => {
        const taskCount = tasks.filter((t) => t.groupId === g.id && t.status === 'todo').length
        const hasChildren = sortedGroups.some(child => child.parentId === g.id)
        const isExpanded = expandedGroups.has(g.id)

        return (
          <div key={g.id} className={level > 1 ? 'nested-group' : ''}>
            <DraggableGroup
              group={g}
              isSelected={selectedGroup === g.id}
              onClick={() => setSelectedGroup(g.id)}
              taskCount={taskCount}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onMenuClick={(e, groupId) => {
                e.stopPropagation()
                setGroupMenu({ groupId, x: e.clientX, y: e.clientY })
              }}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              onToggleExpand={() => {
                setExpandedGroups(prev => {
                  const newSet = new Set(prev)
                  if (newSet.has(g.id)) {
                    newSet.delete(g.id)
                  } else {
                    newSet.add(g.id)
                  }
                  return newSet
                })
              }}
            />
            {hasChildren && isExpanded && renderGroups(g.id, level + 1)}
          </div>
        )
      })
  }

  if (!currentUser) {
  return (
      <div className="app-shell">
        <div className="auth-top">
          <div />
          <div className="auth-top-right">
            <span className="muted">还没有账号？</span>
            <button className="btn sm auth-register" onClick={() => setMode('register')}>
              注册
            </button>
          </div>
        </div>
        <AuthPanel
          mode={mode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          authError={authError}
          onLogin={handleLogin}
          onRegister={handleRegister}
          users={users}
        />
        <div className="auth-footer">
          <span className="muted">还没有账号？</span>
          <button className="link-btn" onClick={() => setMode('register')}>
            注册
          </button>
        </div>
      </div>
    )
  }

  const taskBg = settings.todoBg
  const profileBg = settings.homepageBg

  const startEdit = (task: Task) => {
    setEditing(task)
    setEditForm({
      title: task.title,
      description: task.description || '',
      groupId: task.groupId,
      importance: task.importance,
      type: task.type,
      dueAt: task.dueAt ? task.dueAt.slice(0, 16) : '',
    })
    setContextMenu(null)
  }

  const submitEdit = () => {
    if (!editing || !editForm.title.trim()) {
      setEditing(null)
      return
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editing.id
          ? {
              ...t,
              title: editForm.title.trim(),
              description: editForm.description.trim(),
              groupId: editForm.groupId,
              importance: editForm.importance,
              type: editForm.type,
              dueAt: editForm.dueAt ? new Date(editForm.dueAt).toISOString() : undefined,
            }
          : t,
      ),
    )
    setEditing(null)
  }

  const formatTrashCountdown = (deletedAt: string) => {
    const expire = new Date(deletedAt).getTime() + 7 * 24 * 3600 * 1000
    const diff = expire - Date.now()
    if (diff <= 0) return '已过期'
    const days = Math.floor(diff / (24 * 3600 * 1000))
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / 3600000)
    return `剩余 ${days}天${hours}小时`
  }

  const getTaskDuration = (createdAt: string, completedAt?: string) => {
    if (!completedAt) return ''
    const start = new Date(createdAt).getTime()
    const end = new Date(completedAt).getTime()
    const diff = end - start

    if (diff < 0) return ''

    const days = Math.floor(diff / (24 * 3600 * 1000))
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)

    if (days > 0) {
      return `${days}天${hours}小时${minutes}分钟`
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    } else if (minutes > 0) {
      return `${minutes}分钟`
    } else {
      return '1分钟内'
    }
  }

  return (
    <div className="app-shell">
      <div className="main">
        <aside className="sidebar">
          <div className="avatar" onClick={() => setPage('profile')} title="个人页">
            {profile.nickname.slice(0, 1).toUpperCase()}
          </div>
          {(['todo', 'count', 'settings', 'search'] as (Page | 'search')[]).map((key) => {
            const isActive = key !== 'search' && page === key
            return (
            <div
              key={key}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (key === 'search') {
                  setSearchOpen(true)
                } else {
                  setPage(key)
                }
              }}
              title={key === 'todo' ? '待办' : key === 'count' ? '统计' : key === 'settings' ? '设置' : '搜索'}
            >
              <img src={iconMap[key === 'count' ? 'count' : key === 'settings' ? 'settings' : key === 'todo' ? 'todo' : 'search']} alt={key} />
            </div>
            )
          })}
          </aside>

        {page === 'todo' && (
          <>
        <div className={`middle ${middleCollapsed ? 'collapsed' : ''}`}>
          <div className="section-header">
            <div className="section-title collapsible" onClick={() => setGroupsCollapsed((v) => !v)}>
              <span>{groupsCollapsed ? '>' : '∨'} 我的分组</span>
            </div>
            <button
              className="icon-btn add-group-btn"
              onClick={() => setShowAddGroupModal(true)}
              title="创建新分组"
            >
              +
            </button>
          </div>
          {!groupsCollapsed && (
            <div
              className="group-list"
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedGroup && draggedGroup.parentId) {
                  // 拖到空白区域，成为顶级分组
                  setGroups(prev => {
                    const updated = prev.map(g =>
                      g.id === draggedGroup.id ? { ...g, parentId: undefined } : g
                    )
                    // 重新排序顶级分组
                    const topGroups = updated.filter(g => !g.parentId)
                    topGroups.forEach((group, index) => {
                      const actualIndex = updated.findIndex(g => g.id === group.id)
                      updated[actualIndex].order = index + 1
                    })
                    return updated
                  })
                }
                setDraggedGroup(null)
              }}
            >
              {specialItems.map((g) => (
                <div
                  key={g.id}
                  className={`group-item ${selectedGroup === g.id ? 'active' : ''}`}
                  onClick={() => setSelectedGroup(g.id)}
                >
                  <div className="group-left">
                    <div className="group-color" style={{ background: g.color }} />
                    <div className="group-name">{g.name}</div>
                  </div>
                  <div className="group-right">
                    <div className="group-count">{g.count}</div>
                  </div>
                </div>
              ))}
              <div className="divider" />
              {renderGroups()}
            </div>
          )}
          </div>

            <div className="content">
              <div className="content-header">
                <div className="header-left">
                  <button className="icon-btn" onClick={() => setMiddleCollapsed((v) => !v)}>
                    {middleCollapsed ? '>' : '<'}
                  </button>
                  <div className="section-title" style={{ margin: 0 }}>
                    {[
                      { id: 'today', name: '今天任务' },
                      { id: 'week', name: '最近七天' },
                      { id: 'all', name: '全部待办' },
                      { id: 'completed', name: '已完成' },
                      { id: 'trash', name: '最近删除' },
                    ].find((g) => g.id === selectedGroup)?.name ||
                      groups.find((g) => g.id === selectedGroup)?.name ||
                      '待办'}
                  </div>
                </div>
                <div className="muted" style={{ margin: 0, fontSize: 12 }}>
                  按截止时间从近到远展示，超时任务置顶
                </div>
              </div>

              <div className="content-main">
                {selectedGroup !== 'completed' && selectedGroup !== 'trash' && !showTaskForm && (
                  <div className="add-task" onClick={() => setShowTaskForm(true)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, color: '#2c3651' }}>＋ 添加任务</span>
                      <span className="muted">点击快速创建待办</span>
                    </div>
                  </div>
                )}
                {selectedGroup !== 'completed' && selectedGroup !== 'trash' && showTaskForm && (
                  <div className="task-form">
                    <input
                      className="input"
                      placeholder="待办名称（必填）"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                    <textarea
                      placeholder="描述（可选）"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                    <div className="task-form-row">
                      <select
                        className="input"
                        value={taskForm.groupId}
                        onChange={(e) => setTaskForm({ ...taskForm, groupId: e.target.value })}
                      >
                        <option value="inbox">未分组</option>
                        {getAvailableGroups().map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className="input"
                        value={taskForm.type}
                        onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value as TaskType })}
                      >
                        <option value="focus">专注</option>
                        <option value="habit">习惯</option>
                        <option value="goal">制定目标</option>
                        <option value="task">任务</option>
                      </select>
                    </div>
                    <div className="task-form-row">
                      <select
                        className="input"
                        value={taskForm.importance}
                        onChange={(e) => setTaskForm({ ...taskForm, importance: e.target.value as Importance })}
                      >
                        <option value="critical">非常重要</option>
                        <option value="high">重要</option>
                        <option value="normal">普通</option>
                      </select>
                      <input
                        className="input"
                        type="datetime-local"
                        value={taskForm.dueAt}
                        onChange={(e) => setTaskForm({ ...taskForm, dueAt: e.target.value })}
                      />
                    </div>
                    {taskForm.type === 'focus' && (
                      <div className="task-form-row">
                        <div style={{ flex: 1 }}>
                          <TimePicker
                            value={{
                              hours: taskForm.durationHours,
                              minutes: taskForm.durationMinutes,
                              seconds: taskForm.durationSeconds
                            }}
                            onChange={(time) => setTaskForm({
                              ...taskForm,
                              durationHours: time.hours,
                              durationMinutes: time.minutes,
                              durationSeconds: time.seconds
                            })}
                              showSeconds={false}
                          />
                        </div>
                        <select
                          className="input"
                          value={taskForm.timerMode || 'countdown'}
                          onChange={(e) => setTaskForm({ ...taskForm, timerMode: e.target.value as 'countdown' | 'countup' })}
                        >
                          <option value="countdown">倒计时</option>
                          <option value="countup">正计时</option>
                        </select>
                      </div>
                    )}
                    {taskForm.type === 'habit' && (
                      <div className="task-form-row">
                        <select
                          className="input"
                          value={taskForm.repeat}
                          onChange={(e) => setTaskForm({ ...taskForm, repeat: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                        >
                          <option value="daily">每天</option>
                          <option value="weekly">每周</option>
                          <option value="monthly">每月</option>
                        </select>
                        <input
                          className="input"
                          type="number"
                          min={1}
                          value={taskForm.targetValue}
                          onChange={(e) => setTaskForm({ ...taskForm, targetValue: Number(e.target.value) })}
                          placeholder="目标量"
                        />
                        <UnitSelector
                          value={taskForm.targetUnit}
                          onChange={(unit) => setTaskForm({ ...taskForm, targetUnit: unit })}
                          placeholder="选择单位"
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="checkbox"
                            checked={taskForm.remind}
                            onChange={(e) => setTaskForm({ ...taskForm, remind: e.target.checked })}
                          />
                          <span className="muted">每日提醒</span>
                        </label>
                        {taskForm.remind && (
                          <input
                            className="input"
                            type="number"
                            min={0}
                            max={23}
                            value={taskForm.remindHour}
                            onChange={(e) => setTaskForm({ ...taskForm, remindHour: Number(e.target.value) })}
                            placeholder="提醒小时(0-23)"
                          />
                        )}
                      </div>
                    )}
                    {taskForm.type === 'goal' && (
                      <div className="task-form-row">
                        <input
                          className="input"
                          type="number"
                          min={1}
                          value={taskForm.targetValue}
                          onChange={(e) => setTaskForm({ ...taskForm, targetValue: Number(e.target.value) })}
                          placeholder="完成量"
                        />
                        <UnitSelector
                          value={taskForm.targetUnit}
                          onChange={(unit) => setTaskForm({ ...taskForm, targetUnit: unit })}
                          placeholder="选择单位"
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="checkbox"
                            checked={taskForm.remind}
                            onChange={(e) => setTaskForm({ ...taskForm, remind: e.target.checked })}
                          />
                          <span className="muted">每日提醒</span>
                        </label>
                        {taskForm.remind && (
                          <input
                            className="input"
                            type="number"
                            min={0}
                            max={23}
                            value={taskForm.remindHour}
                            onChange={(e) => setTaskForm({ ...taskForm, remindHour: Number(e.target.value) })}
                            placeholder="提醒小时(0-23)"
                          />
                        )}
                      </div>
                    )}
                    {/* 任务背景图设置 */}
                    <div className="task-background-section">
                      <div className="task-background-label">任务背景图</div>
                      <div className="task-background-options">
                        <button
                          className={`task-bg-option ${!taskForm.backgroundImage ? 'active' : ''}`}
                          onClick={() => setTaskForm({ ...taskForm, backgroundImage: '' })}
                        >
                          随机背景
                        </button>
                        <div className="task-bg-presets">
                          {todoBackgrounds.slice(0, 4).map((bg, index) => (
                            <div
                              key={index}
                              className={`task-bg-preset ${taskForm.backgroundImage === bg ? 'active' : ''}`}
                              style={{ backgroundImage: `url(${bg})` }}
                              onClick={() => setTaskForm({ ...taskForm, backgroundImage: bg })}
                              title="选择预设背景"
                            />
                          ))}
                        </div>
                        </div>
                      {taskForm.backgroundImage && (
                        <div className="task-bg-preview">
                          <div
                            className="task-bg-preview-img"
                            style={{ backgroundImage: `url(${taskForm.backgroundImage})` }}
                          />
                          <button
                            className="task-bg-remove"
                            onClick={() => setTaskForm({ ...taskForm, backgroundImage: '' })}
                            title="移除背景图"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="task-form-actions">
                      <button className="btn secondary" onClick={() => setShowTaskForm(false)}>
                        取消
                      </button>
                      <button className="btn" onClick={handleCreateTask}>
                        创建
                      </button>
                    </div>
                  </div>
                )}

                {selectedGroup === 'trash' && (
                  <div className="task-list">
                    {trash.length === 0 && <div className="empty">最近删除为空（保留 7 天后自动清理）</div>}
                    {trash.map((item) => (
                      <div key={item.trashUniqueId || `trash-${item.id}-${item.deletedAt}`} className="trash-card">
                        <div>
                          <div className="task-title">{item.title}</div>
                          <div className="muted">
                            {groups.find((g) => g.id === item.groupId)?.name || '未分组'} · 删除于 {formatDate(item.deletedAt)}
                          </div>
                        </div>
                        <div className="trash-actions">
                          <span className="chip">{formatTrashCountdown(item.deletedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedGroup !== 'trash' && (
                  <div className="task-list">
                    {filteredTasks.length === 0 && <div className="empty">暂无任务，点击上方添加</div>}
                    {filteredTasks.map((task) => {
                      const group = groups.find((g) => g.id === task.groupId)
                      const isOverdue = overdue(task)
                      const bg = todoBackgrounds[hashIndex(task.id, todoBackgrounds.length)]
                      // 优先级：任务背景图 > 全局背景图 > 随机背景图
                      const finalBg = task.backgroundImage || taskBg || bg
                      return (
                        <div
                          key={task.id}
                          className={`task-card ${task.status === 'done' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
                          style={{
                            // @ts-ignore
                            '--group-color': group?.color || '#a7c8ff',
                            '--importance-color': importanceColor[task.importance],
                            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.85)), url(${finalBg})`,
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            setContextMenu({ taskId: task.id, x: e.clientX, y: e.clientY })
                          }}
                        >
                          <div
                            className={`circle ${task.status === 'done' ? 'completed' : ''} ${task.type === 'goal' ? 'goal-progress' : ''}`}
                            onClick={() => toggleTask(task.id)}
                            style={
                              task.type === 'goal'
                                ? {
                                    '--progress-percent': Math.min((task.progressValue || 0) / (task.targetValue || 1), 1),
                                  } as React.CSSProperties
                                : undefined
                            }
                          >
                            {task.type === 'goal' ? (
                              <span className="goal-progress-text">
                                {Math.round(((task.progressValue || 0) / (task.targetValue || 1)) * 100)}%
                              </span>
                            ) : (
                              task.status === 'done' ? '✓' : ''
                            )}
                          </div>
                          <div className="task-right">
                            <div className="task-top">
                              <h4 className="task-title">{task.title}</h4>
                              {task.dueAt && (
                                <span className="task-countdown">
                                  {getCountdownDHM(task.dueAt, currentTime)}
                                </span>
                              )}
                              <div className="task-actions">
                                <span className={`badge-importance importance-${task.importance}`}>
                                  {task.importance === 'critical' ? '非常重要' : task.importance === 'high' ? '重要' : '普通'}
                                </span>
                        {(task.type === 'focus' || task.type === 'habit' || task.type === 'goal') && (
                          <button
                            className="icon-btn"
                            onClick={() => {
                              setTimerTaskId(task.id)
                              const base = task.durationMinutes ? task.durationMinutes * 60 : 25 * 60
                              setTimerTotal(base)
                              setTimerRemaining(base)
                              setTimerMode(task.timerMode || 'countdown')
                              setTimerRunning(false)
                              setTimerReason('')
                              setTimerHistory([])
                              // 重置计时器状态
                              setTimerStartTime(null)
                              setTimerElapsedSeconds(0)
                            }}
                          >
                            ⏱
                          </button>
                        )}
                                <button className="icon-btn" onClick={() => deleteTask(task.id)}>
                                  🗑
                                </button>
                              </div>
                            </div>
                            {task.description && <div className="muted">{task.description}</div>}
                            <div className="task-meta">
                              <span>分组：{group?.name || '未分组'}</span>
                              {task.type === 'focus' && task.totalFocusMinutes && task.totalFocusMinutes > 0 && (
                                <span style={{ color: 'var(--theme-primary)', fontWeight: '600' }}>
                                  累计专注：{task.totalFocusMinutes}分钟
                                </span>
                              )}
                              {task.status === 'done' ? (
                                <>
                                  <span>完成于：{formatDate(task.completedAt)}</span>
                                  <span>用时：{getTaskDuration(task.createdAt, task.completedAt)}</span>
                                </>
                              ) : (
                                <span>截止：{formatDate(task.dueAt)}</span>
                              )}
                            </div>
                          </div>
                          <div className="bookmark" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {page === 'count' && (
          <div className="content wide">
            <div className="content-header">
              <div className="section-title" style={{ margin: 0 }}>统计分析</div>
              <div className="muted" style={{ margin: 0 }}>仿 Ant Design Pro Dashboard / 番茄 Todo 样式</div>
            </div>
            <div className="content-main stats">
              {/* 专注数据统计 */}
              <div className="stat-section">
                <h4>专注数据统计</h4>
                <div className="stat-cards">
                  <div className="stat-card">
                    <div className="muted">累计专注</div>
                    <div className="stat-number">{focusStats.totalSessions} 次</div>
                    <div className="muted">{Math.floor(focusStats.totalMinutes / 60)}小时{focusStats.totalMinutes % 60}分钟</div>
                    <div className="muted">日均：{Math.floor(focusStats.dailyAvgMinutes / 60)}小时{focusStats.dailyAvgMinutes % 60}分钟</div>
                  </div>
                  <div className="stat-card">
                    <div className="muted">当日专注</div>
                    <div className="stat-number">{dailyFocusStats.sessions} 次</div>
                    <div className="muted">{Math.floor(dailyFocusStats.minutes / 60)}小时{dailyFocusStats.minutes % 60}分钟</div>
                  </div>
                </div>

                {/* 时间设置面板 */}
                <div
                  className="date-settings"
                  style={{ padding: '12px 16px', background: 'var(--theme-gray-100)', borderRadius: '8px', margin: '8px 0', border: '1px solid var(--theme-gray-200)' }}
                >
                  <div className="muted" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    统计起始日期：<strong>{statsStartDate || '全部时间'}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="date"
                      value={statsStartDate}
                      onChange={(e) => setStatsStartDate(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid var(--theme-gray-300)',
                        borderRadius: '6px',
                        background: 'white',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={() => setStatsStartDate('')}
                      style={{
                        padding: '6px 12px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      恢复默认
                    </button>
                  </div>
                </div>
              </div>

              {/* 专注时长分布 */}
              <div className="stat-section">
                <h4>专注时长分布</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}>&lt;</button>
                  <span>{selectedDate.toLocaleDateString('zh-CN')}</span>
                  <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}>&gt;</button>
                  <div className="pill-segment">
                    <button
                      className={statsTimeRange === 'day' ? 'active' : ''}
                      onClick={() => setStatsTimeRange('day')}
                    >日</button>
                    <button
                      className={statsTimeRange === 'week' ? 'active' : ''}
                      onClick={() => setStatsTimeRange('week')}
                    >周</button>
                    <button
                      className={statsTimeRange === 'month' ? 'active' : ''}
                      onClick={() => setStatsTimeRange('month')}
                    >月</button>
                    <button
                      className={statsTimeRange === 'custom' ? 'active' : ''}
                      onClick={() => setStatsTimeRange('custom')}
                    >自定义</button>
                  </div>
                </div>

                {/* 扇形图 - 任务分布 */}
                <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', padding: '20px 0' }}>
                  <div style={{ flexShrink: 0 }}>
                    <ReactECharts
                      style={{ height: '220px', width: '220px' }}
                      option={focusTimeChartOption}
                      lazyUpdate={true}
                      notMerge={true}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div className="muted" style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>任务分布</div>
                    {getTasksByTimeRange
                      .filter(t => t.type === 'focus' && t.status === 'done')
                      .slice(0, 5)
                      .map((t) => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0', padding: '8px 0', borderBottom: '1px solid var(--theme-gray-100)' }}>
                          <span style={{ fontSize: '14px', color: '#374151' }}>{t.title}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--theme-primary)' }}>{t.totalFocusMinutes || 0}分钟</span>
                        </div>
                      ))}
                    {getTasksByTimeRange.filter(t => t.type === 'focus' && t.status === 'done').length === 0 && (
                      <div className="muted" style={{ fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>暂无专注任务数据</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 打断原因分布 */}
              <div className="stat-section">
                <h4>打断原因分布</h4>
                <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', padding: '20px 0' }}>
                  <div style={{ flexShrink: 0 }}>
                    <ReactECharts
                      style={{ height: '220px', width: '220px' }}
                      option={interruptReasonChartOption}
                      lazyUpdate={true}
                      notMerge={true}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div className="muted" style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>原因统计</div>
                    {cancelReasonStats.map((item) => (
                      <div key={item.reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0', padding: '8px 0', borderBottom: '1px solid var(--theme-gray-100)' }}>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{item.reason}</span>
                        <span style={{ fontSize: '14px' }}>
                          <strong style={{ color: 'var(--theme-primary)' }}>{item.count}次</strong>
                          <span style={{ color: '#6b7280', marginLeft: '4px' }}>({item.percentage}%)</span>
                        </span>
                      </div>
                    ))}
                    {cancelReasonStats.length === 0 && (
                      <div className="muted" style={{ fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>暂无打断原因数据</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 本月专注时段分布 */}
              <div className="stat-section">
                <h4>本月专注时段分布</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}>&lt;</button>
                  <span>{selectedMonth.getFullYear()}年{selectedMonth.getMonth() + 1}月</span>
                  <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}>&gt;</button>
                </div>
                <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                  <ReactECharts
                    style={{ height: '250px', width: Math.max(1200, monthlyFocusStats.length * 40) }}
                    option={monthlyFocusChartOption}
                    lazyUpdate={true}
                    notMerge={true}
                  />
                </div>
              </div>

              {/* 年度专注分布 */}
              <div className="stat-section">
                <h4>年度专注分布</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button onClick={() => setSelectedYear(selectedYear - 1)}>&lt;</button>
                  <span>{selectedYear}年</span>
                  <button onClick={() => setSelectedYear(selectedYear + 1)}>&gt;</button>
                </div>
                <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                  <ReactECharts
                    style={{ height: '250px', width: '100%', minWidth: '800px' }}
                    option={yearlyFocusChartOption}
                    lazyUpdate={true}
                    notMerge={true}
                  />
                </div>
              </div>

              {/* 待办任务统计 */}
              <div className="stat-section">
                <h4>待办任务统计</h4>
                <div className="stat-cards">
                  <div className="stat-card">
                    <div className="muted">任务总览</div>
                    <div className="stat-number">{totalTasks.length}</div>
                    <div className="muted">已完成：{completedTasks.length} | 未完成：{uncompletedTasks.length}</div>
                  </div>
                </div>

                {/* 任务完成饼图 */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', margin: '16px 0' }}>
                  <ReactECharts
                    style={{ height: '200px', width: '200px' }}
                    option={taskCompletionChartOption}
                    lazyUpdate={true}
                    notMerge={true}
                  />
                </div>

                {/* 分组任务进度 */}
                <h4>分组任务统计</h4>
                <div className="group-progress">
                  {groupProgress.map((g) => (
                    <div key={g.id} className="progress-row">
                      <div className="progress-name">{g.name}</div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${g.total === 0 ? 0 : (g.done / g.total) * 100}%`, background: g.color }}
                        />
                      </div>
                      <div className="progress-number">
                        <strong>{g.done}</strong>/{g.total}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 按时间统计 */}
                <h4>按时间统计</h4>
                <div className="pill-segment">
                  <button
                    className={statsTimeRange === 'day' ? 'active' : ''}
                    onClick={() => setStatsTimeRange('day')}
                  >日</button>
                  <button
                    className={statsTimeRange === 'week' ? 'active' : ''}
                    onClick={() => setStatsTimeRange('week')}
                  >周</button>
                  <button
                    className={statsTimeRange === 'month' ? 'active' : ''}
                    onClick={() => setStatsTimeRange('month')}
                  >月</button>
                  <button
                    className={statsTimeRange === 'custom' ? 'active' : ''}
                    onClick={() => setStatsTimeRange('custom')}
                  >自定义</button>
                </div>

                {/* 折线图 - 任务完成趋势 */}
                <ReactECharts
                  style={{ height: '300px', width: '100%' }}
                  option={taskTrendChartOption}
                  lazyUpdate={true}
                  notMerge={true}
                />
              </div>

              <div className="profile-footer">© 2025 right pip. All rights reserved. 本项目仅用于课程学习与演示</div>
            </div>
          </div>
        )}

        {page === 'settings' && (
          <div className="content wide">
            <div className="content-header">
              <div className="section-title" style={{ margin: 0 }}>设置</div>
              <div className="muted" style={{ margin: 0 }}>主题色 / 背景图 / 账户管理</div>
            </div>
            <div className="content-main settings">
              <div className="settings-card">
                <h4>主题色（点击切换）</h4>
                <div className="theme-list">
                  {themePresets.map((c) => (
                    <button
                      key={c}
                      className={`theme-dot ${settings.theme === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setSettings((s) => ({ ...s, theme: c }))}
                    />
                  ))}
                </div>
              </div>

              <div className="settings-card">
                <h4>个人主页背景</h4>
                <div className="bg-list">
                  {homepageBackgrounds.map((bg) => (
                    <div
                      key={bg}
                      className={`bg-item ${settings.homepageBg === bg ? 'active' : ''}`}
                      style={{ backgroundImage: `url(${bg})` }}
                      onClick={() => setSettings((s) => ({ ...s, homepageBg: bg }))}
                    />
                  ))}
                  {/* 显示自定义背景 */}
                  {settings.homepageBg && !homepageBackgrounds.includes(settings.homepageBg) && (
                    <div
                      key="custom-homepage"
                      className={`bg-item ${settings.homepageBg === settings.homepageBg ? 'active' : ''}`}
                      style={{ backgroundImage: `url(${settings.homepageBg})` }}
                      onClick={() => setSettings((s) => ({ ...s, homepageBg: settings.homepageBg }))}
                      title="自定义背景"
                    />
                  )}
                </div>
                <UploadButton
                  label="上传自定义背景"
                  onChange={(dataUrl) => {
                    setSettings((s) => ({ ...s, homepageBg: dataUrl }))
                    // 添加成功提示
                    const btn = document.querySelector('.upload-btn') as HTMLElement
                    if (btn) {
                      const originalText = btn.textContent
                      btn.textContent = '✓ 上传成功'
                      btn.style.borderColor = '#4CAF50'
                      btn.style.color = '#4CAF50'
                      setTimeout(() => {
                        btn.textContent = originalText
                        btn.style.borderColor = ''
                        btn.style.color = ''
                      }, 2000)
                    }
                  }}
                />
              </div>

              <div className="settings-card">
                <h4>待办卡片背景</h4>
                <div className="bg-list">
                  {todoBackgrounds.map((bg) => (
                    <div
                      key={bg}
                      className={`bg-item ${settings.todoBg === bg ? 'active' : ''}`}
                      style={{ backgroundImage: `url(${bg})` }}
                      onClick={() => setSettings((s) => ({ ...s, todoBg: bg }))}
                    />
                  ))}
                  {/* 显示自定义背景 */}
                  {settings.todoBg && !todoBackgrounds.includes(settings.todoBg) && (
                    <div
                      key="custom-todo"
                      className={`bg-item ${settings.todoBg === settings.todoBg ? 'active' : ''}`}
                      style={{ backgroundImage: `url(${settings.todoBg})` }}
                      onClick={() => setSettings((s) => ({ ...s, todoBg: settings.todoBg }))}
                      title="自定义背景"
                    />
                  )}
                </div>
                <UploadButton
                  label="上传自定义待办背景"
                  onChange={(dataUrl) => {
                    setSettings((s) => ({ ...s, todoBg: dataUrl }))
                    // 添加成功提示
                    const buttons = document.querySelectorAll('.upload-btn') as NodeListOf<HTMLElement>
                    if (buttons.length > 1) {
                      const btn = buttons[1] // 第二个上传按钮
                      const originalText = btn.textContent
                      btn.textContent = '✓ 上传成功'
                      btn.style.borderColor = '#4CAF50'
                      btn.style.color = '#4CAF50'
                      setTimeout(() => {
                        btn.textContent = originalText
                        btn.style.borderColor = ''
                        btn.style.color = ''
                      }, 2000)
                    }
                  }}
                />
              </div>

              <div className="settings-card danger">
                <h4>账户管理</h4>
                <div className="btn-row">
                  <button className="btn secondary" onClick={logout}>
                    退出账号（保留数据）
                  </button>
                  <button className="btn" onClick={deleteAccount}>
                    注销账号（删除数据）
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 注销账号确认弹窗 */}
        {showDeleteConfirm && (
          <div className="modal-mask">
            <div className="confirm-dialog">
              <div className="confirm-title">确认注销账号</div>
              <div className="confirm-message">
                确定要注销账号？此操作将删除所有用户信息，且无法恢复。
              </div>
              <div className="confirm-actions">
                <button className="btn secondary" onClick={() => setShowDeleteConfirm(false)}>
                  否
                </button>
                <button className="btn" onClick={confirmDeleteAccount}>
                  是
                </button>
              </div>
            </div>
          </div>
        )}

        {page === 'profile' && (
          <div
            className="profile-page"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop
              const header = document.querySelector('.profile-header') as HTMLElement
              if (header) {
                // 计算缩放比例：滚动越多，缩放越小（从 1.2 缩小到 1）
                const scale = Math.max(1, 1.2 - scrollTop / 800)
                header.style.setProperty('--header-scale', scale.toString())
              }
            }}
          >
            <div className="profile-mask">
              <div
                className="profile-header"
                style={{
                  backgroundImage: `url(${profileBg})`,
                  ['--header-scale' as any]: '1.2'
                }}
                id="profile-header"
              >
                <div className="profile-header-content">
                  <div className="avatar large">{profile.nickname.slice(0, 1).toUpperCase()}</div>
                  <div className="profile-name">
                    <div className="auth-title">{profile.nickname || '未命名用户'}</div>
                    <div className="muted">{profile.signature}</div>
                  </div>
                </div>
              </div>
              <div className="profile-info">
                <h4>个人信息</h4>
                <div className="info-row">
                  {[
                    profile.age,
                    profile.gender,
                    profile.birthday,
                    profile.zodiac,
                    profile.location,
                    profile.school,
                    profile.phone,
                    profile.email,
                  ]
                    .filter(Boolean)
                    .join(' / ') || '未填写'}
                </div>
                <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>精选照片</span>
                <label className="upload-photo-btn" title="点击上传照片">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      files.forEach(file => {
                        const reader = new FileReader()
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            const newPhoto = {
                              id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                              url: reader.result,
                              desc: '',
                              showDesc: false,
                            }
                            setProfile((prev) => ({
                              ...prev,
                              photos: [...(prev.photos || defaultProfilePhotos), newPhoto],
                            }))
                          }
                        }
                        reader.readAsDataURL(file)
                      })
                    }}
                  />
                  📷 上传
                </label>
              </h4>
                <div className="gallery">
                  {(profile.photos || []).length === 0 && <div className="empty">暂无照片</div>}
                  {(profile.photos || []).map((p) => {
                    console.log('加载照片:', p.url)
                    return (
                      <div
                        key={p.id}
                        className="gallery-card"
                        style={{ backgroundImage: `url(${p.url})` }}
                        onMouseEnter={() =>
                        setProfile((prev) => ({
                          ...prev,
                          photos: (prev.photos || []).map((ph) =>
                            ph.id === p.id ? { ...ph, showDesc: true } : ph,
                          ),
                        }))
                      }
                        onMouseLeave={() =>
                        setProfile((prev) => ({
                          ...prev,
                          photos: (prev.photos || []).map((ph) =>
                            ph.id === p.id ? { ...ph, showDesc: false } : ph,
                          ),
                        }))
                      }
                        onContextMenu={(e) => {
                          e.preventDefault()
                          const desc = prompt('编辑照片描述', p.desc || '')
                          if (desc !== null) {
                            setProfile((prev) => ({
                              ...prev,
                              photos: (prev.photos || []).map((ph) => (ph.id === p.id ? { ...ph, desc } : ph)),
                            }))
                          }
                        }}
                      >
                        {/* 毛玻璃效果遮罩 */}
                        <div className="gallery-overlay" />

                        {/* 删除按钮 */}
                        <button
                          className="gallery-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('确定要删除这张照片吗？')) {
                              setProfile((prev) => ({
                                ...prev,
                                photos: (prev.photos || []).filter(ph => ph.id !== p.id),
                              }))
                            }
                          }}
                          title="删除照片"
                        >
                          ✕
                        </button>

                        {/* 文本信息 */}
                        <div className={`gallery-desc ${p.showDesc ? 'show' : ''}`}>
                          <div className="desc-title">{p.desc}</div>
                          <div className="desc-info">
                            <div>📅 创建时间：{new Date().toLocaleDateString()}</div>
                            <div>👤 用户：{profile.nickname}</div>
                            <div>💬 描述：美丽的风景照片</div>
                          </div>
                        </div>
                      </div>
                  )
                  })}
                </div>
                <h4>编辑资料</h4>
                <div className="profile-form" id="profile-edit">
                  <input
                    className="input"
                    placeholder="昵称"
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="签名"
                    value={profile.signature}
                    onChange={(e) => setProfile({ ...profile, signature: e.target.value })}
                  />
                  <div className="task-form-row">
                    <input
                      className="input"
                      placeholder="年龄"
                      value={profile.age || ''}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder="性别"
                      value={profile.gender || ''}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    />
                  </div>
                  <div className="task-form-row">
                    <DatePicker
                      value={profile.birthday || ''}
                      onChange={(date) => setProfile({ ...profile, birthday: date })}
                      placeholder="生日"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <input
                      className="input"
                      placeholder="星座"
                      value={profile.zodiac || ''}
                      onChange={(e) => setProfile({ ...profile, zodiac: e.target.value })}
                    />
                  </div>
                  <div className="task-form-row">
                    <input
                      className="input"
                      placeholder="所在地"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder="学校"
                      value={profile.school || ''}
                      onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                    />
                  </div>
                  <div className="task-form-row">
                    <input
                      className="input"
                      placeholder="电话"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder="邮箱"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="profile-footer">
                © 2025 right pip. All rights reserved. 本项目仅用于课程学习与演示
              </div>
            </div>
          </div>

        )}

  
  
        {contextMenu && (
          <div className="context-mask" onClick={() => setContextMenu(null)}>
            <div
              className="context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="context-item"
                onClick={() => {
                  const target = tasks.find((t) => t.id === contextMenu.taskId)
                  if (target) startEdit(target)
                }}
              >
                编辑
              </button>
              <div className="context-sub">
                <div className="context-sub-title">移动分组</div>
                {[...groups].map((g) => (
                  <button key={g.id} className="context-item" onClick={() => { moveTask(contextMenu.taskId, g.id); setContextMenu(null) }}>
                    {g.name}
                  </button>
                ))}
              </div>
              <button
                className="context-item danger"
                onClick={() => {
                  deleteTask(contextMenu.taskId)
                  setContextMenu(null)
                }}
              >
                删除
              </button>
            </div>
          </div>
        )}

        {groupMenu && (
          <div className="context-mask" onClick={() => setGroupMenu(null)}>
            <div
              className="context-menu"
              style={{ top: groupMenu.y, left: groupMenu.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="context-item" onClick={() => { setGroupMenu(null); handleAddChildGroup(groupMenu.groupId) }}>
                新建子分组
              </button>
              <button className="context-item" onClick={() => { setGroupMenu(null); handleEditGroup(groupMenu.groupId) }}>
                编辑分组
              </button>
              <button
                className="context-item"
                onClick={() => {
                  const g = groups.find((x) => x.id === groupMenu.groupId)
                  handlePinGroup(groupMenu.groupId, !(g?.pinned))
                  setGroupMenu(null)
                }}
              >
                {groups.find((x) => x.id === groupMenu.groupId)?.pinned ? '取消置顶' : '置顶'}
              </button>
              {groupMenu.groupId !== 'inbox' && (
                <button
                  className="context-item danger"
                  onClick={() => { setGroupMenu(null); handleDeleteGroup(groupMenu.groupId) }}
                >
                  删除分组
                </button>
              )}
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-mask" onClick={() => setEditing(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h4>编辑任务</h4>
              <input
                className="input"
                placeholder="待办名称（必填）"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
              <textarea
                placeholder="描述（可选）"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
              <div className="task-form-row">
                <select
                  className="input"
                  value={editForm.groupId}
                  onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })}
                >
                  <option value="inbox">未分组</option>
                  {getAvailableGroups().map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as TaskType })}
                >
                  <option value="focus">专注</option>
                  <option value="habit">习惯</option>
                  <option value="goal">制定目标</option>
                  <option value="task">任务</option>
                </select>
              </div>
              <div className="task-form-row">
                <select
                  className="input"
                  value={editForm.importance}
                  onChange={(e) => setEditForm({ ...editForm, importance: e.target.value as Importance })}
                >
                  <option value="critical">非常重要</option>
                  <option value="high">重要</option>
                  <option value="normal">普通</option>
                </select>
                <input
                  className="input"
                  type="datetime-local"
                  value={editForm.dueAt}
                  onChange={(e) => setEditForm({ ...editForm, dueAt: e.target.value })}
                />
              </div>
              <div className="task-form-actions">
                <button className="btn secondary" onClick={() => setEditing(null)}>
                  取消
                </button>
                <button className="btn" onClick={submitEdit}>
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {timerTaskId && (
          <div className="modal-mask" onClick={() => setTimerTaskId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h4>专注/计时</h4>
              {(() => {
                const t = tasks.find((x) => x.id === timerTaskId)
                const mm = Math.floor(timerRemaining / 60)
                const ss = timerRemaining % 60

                // 计算当前累计专注时间
                const currentRunTime = timerStartTime ? Math.floor((Date.now() - timerStartTime) / 1000) : 0
                const currentMinutes = Math.ceil((timerElapsedSeconds + currentRunTime) / 60)
                const totalFocusMinutes = (t?.totalFocusMinutes || 0) + currentMinutes

                return (
                  <>
                    <div className="task-title">{t?.title || '当前任务'}</div>
                    <div className="muted">
                      模式：{timerMode === 'countdown' ? '倒计时' : '正计时'} · 目标 {Math.floor(timerTotal / 60)} 分钟
                    </div>
                    {totalFocusMinutes > 0 && (
                      <div className="muted" style={{ color: 'var(--theme-primary)', fontWeight: '600' }}>
                        本次专注：{currentMinutes}分钟 · 总计专注：{totalFocusMinutes}分钟
                      </div>
                    )}
                    <div className="timer-display">
                      {mm.toString().padStart(2, '0')}:{ss.toString().padStart(2, '0')}
                    </div>
                    <div className="task-form-row">
                      <button className="btn" onClick={() => {
                        if (!timerRunning) {
                          // 开始计时：记录开始时间
                          if (!timerStartTime) {
                            setTimerStartTime(Date.now())
                          }
                        } else {
                          // 暂停计时：更新已过时间并重置开始时间
                          if (timerStartTime) {
                            const elapsedSoFar = Math.floor((Date.now() - timerStartTime) / 1000)
                            setTimerElapsedSeconds(prev => prev + elapsedSoFar)
                            setTimerStartTime(null)
                          }
                        }
                        setTimerRunning((v) => !v)
                      }}>
                        {timerRunning ? '暂停' : '开始'}
                      </button>
                      <button
                        className="btn secondary"
                        onClick={() => {
                          setTimerRunning(false)

                          // 计算实际专注时间（包括暂停前的累计时间）
                          const currentRunTime = timerStartTime ? Math.floor((Date.now() - timerStartTime) / 1000) : 0
                          const actualSeconds = timerElapsedSeconds + currentRunTime ||
                                             (timerMode === 'countup' ? timerRemaining : timerTotal - timerRemaining)

                          setTimerTaskId(null)

                          // 重置计时器状态
                          setTimerStartTime(null)
                          setTimerElapsedSeconds(0)

                          if (timerReason.trim()) {
                            if (!cancelReasons.includes(timerReason.trim())) {
                              setCancelReasons((prev) => [...prev, timerReason.trim()])
                            }
                            setTimerHistory((prev) => [
                              ...prev,
                              {
                                taskId: timerTaskId,
                                reason: timerReason.trim(),
                                at: new Date().toISOString(),
                                duration: actualSeconds, // 使用真实专注时间
                                mode: timerMode,
                              },
                            ])
                            // 累计专注时间但不改变任务状态
                            setTasks((prev) =>
                              prev.map((x) =>
                                x.id === timerTaskId
                                  ? {
                                      ...x,
                                      totalFocusMinutes: (x.totalFocusMinutes || 0) + Math.ceil(actualSeconds / 60), // 累计专注时间
                                      actualFocusMinutes: Math.ceil(actualSeconds / 60), // 记录最近一次专注时间
                                      cancelReasons: [...(x.cancelReasons || []), timerReason.trim()],
                                    }
                                  : x,
                              ),
                            )
                          setTimerReason('')
                          }
                        }}
                      >
                        取消
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          setTimerRunning(false)

                          // 计算实际专注时间（包括暂停前的累计时间）
                          const currentRunTime = timerStartTime ? Math.floor((Date.now() - timerStartTime) / 1000) : 0
                          const actualSeconds = timerElapsedSeconds + currentRunTime ||
                                             (timerMode === 'countup' ? timerRemaining : timerTotal - timerRemaining)
                          const actualMinutes = Math.ceil(actualSeconds / 60) // 使用真实时间，向上取整

                          setTasks((prev) =>
                            prev.map((x) =>
                              x.id === timerTaskId ? {
                                ...x,
                                status: 'done',
                                completedAt: new Date().toISOString(),
                                actualFocusMinutes: actualMinutes, // 最近一次专注时间
                                totalFocusMinutes: (x.totalFocusMinutes || 0) + actualMinutes, // 累计总专注时间
                                cancelReasons: [...(x.cancelReasons || []), '手动完成'],
                              } : x,
                            ),
                          )
                        setTimerHistory((prev) => [
                          ...prev,
                          {
                            taskId: timerTaskId,
                            reason: '手动完成',
                            at: new Date().toISOString(),
                            duration: actualSeconds, // 使用真实专注时间
                            mode: timerMode,
                          },
                        ])

                        // 重置计时器状态
                        setTimerStartTime(null)
                        setTimerElapsedSeconds(0)
                        setTimerTaskId(null)
                        }}
                      >
                        完成
                      </button>
                    </div>
                    <div className="task-form-row">
                      <select
                        className="input"
                        value={timerMode}
                        onChange={(e) => {
                          const mode = e.target.value as 'countdown' | 'countup'
                          setTimerMode(mode)
                          if (mode === 'countup') setTimerRemaining(0)
                        }}
                      >
                        <option value="countdown">倒计时</option>
                        <option value="countup">正计时</option>
                      </select>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={Math.floor(timerTotal / 60)}
                        onChange={(e) => {
                          const m = Math.max(1, Number(e.target.value))
                          setTimerTotal(m * 60)
                          setTimerRemaining(m * 60)
                        }}
                      />
                      <span className="muted">分钟</span>
                    </div>
                    <div className="task-form-row">
                      <select
                        className="input"
                        value={timerReason}
                        onChange={(e) => setTimerReason(e.target.value)}
                      >
                        <option value="">选择取消原因（可选）</option>
                        {cancelReasons.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <input
                        className="input"
                        placeholder="自定义原因"
                        value={timerReason}
                        onChange={(e) => setTimerReason(e.target.value)}
                      />
                    </div>
                  {t?.type === 'habit' && (
                    <div className="task-form-row">
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={progressDelta}
                        onChange={(e) => setProgressDelta(Number(e.target.value) || 1)}
                        placeholder="本次完成量"
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          incrementProgress(timerTaskId, progressDelta, '习惯进度')
                          setRemindToast('习惯进度 + ' + progressDelta)
                        }}
                      >
                        增加进度
                      </button>
                      <button
                        className="btn secondary"
                        onClick={() => {
                          setTasks((prev) =>
                            prev.map((x) =>
                              x.id === timerTaskId
                                ? {
                                    ...x,
                                    progressValue: 0,
                                    history: [
                                      ...(x.history || []),
                                      { at: new Date().toISOString(), action: 'reset', note: '习惯进度清零' },
                                    ],
                                  }
                                : x,
                            ),
                          )
                          setRemindToast('习惯进度已清零')
                        }}
                      >
                        清零
                      </button>
                    </div>
                  )}
                  {t?.type === 'goal' && (
                    <div className="task-form-row">
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={progressDelta}
                        onChange={(e) => setProgressDelta(Number(e.target.value) || 1)}
                        placeholder="本次完成量"
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          incrementProgress(timerTaskId, progressDelta, '目标进度')
                          setRemindToast('目标进度 + ' + progressDelta)
                        }}
                      >
                        增加进度
                      </button>
                    </div>
                  )}
                    {t?.cancelReasons && t.cancelReasons.length > 0 && (
                      <div className="line-demo">
                        <div className="muted">历史原因</div>
                        {t.cancelReasons.slice(-5).map((r, idx) => (
                          <div key={`${r}-${idx}`} className="muted">
                            {r}
                          </div>
                        ))}
                      </div>
                    )}
                    {timerHistory.length > 0 && (
                      <div className="line-demo">
                        <div className="muted">取消/完成记录（本次会话）</div>
                        {timerHistory.slice(-5).map((h) => (
                          <div key={h.at} className="muted">
                            {formatDate(h.at)} · {h.reason} · {h.mode === 'countdown' ? '倒计' : '正计'}{' '}
                            {Math.max(1, Math.floor(h.duration / 60))} 分
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="task-form-row">
                      <button className="btn secondary" onClick={() => setTimerTaskId(null)}>
                        收起
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="search-mask" onClick={() => setSearchOpen(false)}>
          <div className="search-panel" onClick={(e) => e.stopPropagation()}>
            <div className="search-row">
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="搜索待办名称，实时过滤"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                autoFocus
              />
              <div className="pill-segment">
                <button className={timeSort === 'asc' ? 'active' : ''} onClick={() => setTimeSort('asc')}>
                  时间正序
                </button>
                <button className={timeSort === 'desc' ? 'active' : ''} onClick={() => setTimeSort('desc')}>
                  时间倒序
                </button>
              </div>
              <div className="pill-segment">
                <button className={importanceSort === 'high' ? 'active' : ''} onClick={() => setImportanceSort('high')}>
                  重要性高优先
                </button>
                <button className={importanceSort === 'low' ? 'active' : ''} onClick={() => setImportanceSort('low')}>
                  重要性低优先
        </button>
              </div>
            </div>
            <div className="search-results">
              {searchResults.length === 0 && <div className="empty">没有匹配的任务</div>}
              {searchResults.map((task) => {
                const group = groups.find((g) => g.id === task.groupId)
                return (
                  <div
                    key={task.id}
                    className="search-item"
                    style={{
                      // @ts-ignore
                      '--group-color': group?.color || '#a7c8ff',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{task.title}</div>
                      <div className="muted">
                        {group?.name} · {task.type === 'focus' ? '专注' : task.type === 'habit' ? '习惯' : task.type === 'goal' ? '制定目标' : '任务'}
                      </div>
                    </div>
                    <div className="chip">
                      {formatDate(task.dueAt)} · {getCountdown(task.dueAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {remindToast && (
        <div className="toast">
          {remindToast}
        </div>
      )}

      {/* 创建分组弹框 */}
      {showAddGroupModal && (
        <div className="modal-mask" onClick={() => setShowAddGroupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>创建新分组</h4>
            <input
              className="input"
              placeholder="分组名称"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
            />
            <ColorPicker selectedColor={newGroupColor} onColorChange={setNewGroupColor} />
            <div className="task-form-actions">
              <button className="btn secondary" onClick={() => setShowAddGroupModal(false)}>
                取消
              </button>
              <button className="btn" onClick={handleCreateGroup}>
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建子分组弹框 */}
      <InputModal
        title="创建子分组"
        label="分组名称"
        value={childGroupName}
        secondValue={childGroupColor}
        placeholder="请输入子分组名称"
        type="color"
        isOpen={addChildGroupModal}
        onConfirm={confirmAddChildGroup}
        onCancel={() => setAddChildGroupModal(false)}
      />

      {/* 编辑分组弹框 */}
      <EditGroupModal
        groupName={editingGroupName}
        groupColor={editingGroupColor}
        isOpen={editGroupModal}
        onConfirm={confirmEditGroup}
        onCancel={() => setEditGroupModal(false)}
      />

      {/* 删除分组确认弹框 */}
      <DeleteGroupModal
        isOpen={deleteGroupModal}
        groupName={groups.find(g => g.id === deletingGroupId)?.name || ''}
        onCancel={() => setDeleteGroupModal(false)}
        onConfirm={confirmDeleteGroup}
        option={deleteOption}
        onOptionChange={setDeleteOption}
      />
    </div>
  )
}


// 上传按钮组件
function UploadButton({ label, onChange }: { label: string; onChange: (dataUrl: string) => void }) {
  // 处理文件上传
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('没有选择文件')
      return
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检查文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片文件大小不能超过 5MB')
      return
    }

    console.log('开始上传文件:', file.name, file.size)

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        console.log('文件读取成功，长度:', reader.result.length)
        onChange(reader.result) // 转换成base64
      }
    }
    reader.onerror = () => {
      console.error('文件读取失败')
      alert('文件读取失败，请重试')
    }
    reader.readAsDataURL(file)
  }

  return (
    <label className="upload-btn">
      {label}
      <input type="file" accept="image/*" hidden onChange={handleFile} />
    </label>
  )
}

export default App
