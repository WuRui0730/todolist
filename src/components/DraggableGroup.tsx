/**
 * 文件功能：可拖拽分组组件
 * 渲染单个分组项，支持拖拽排序、嵌套、点击选中以及右键菜单操作。
 */
import { useState } from 'react'
import type { Group } from '../types'
import { iconMap } from '../constants'

interface DraggableGroupProps {
  group: Group
  onDragStart: (group: Group) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, targetGroup: Group) => void
  onDragEnd: () => void
  isSelected: boolean
  onClick: () => void
  taskCount: number
  onMenuClick: (e: React.MouseEvent, groupId: string) => void
  hasChildren?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

//主界面布局 - 中间分组栏 (自定义分组)
//关键技术实现 - 拖拽排序 (Drag & Drop)
/**
 * 可拖拽的分组组件
 * 支持拖拽排序、嵌套、点击选中、右键菜单等交互
 */
export function DraggableGroup({
  group,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isSelected,
  onClick,
  taskCount,
  onMenuClick,
  hasChildren = false,
  isExpanded = false,
  onToggleExpand
}: DraggableGroupProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(group)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', group.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)

    // 根据鼠标位置添加视觉提示类
    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const isOnTop = e.clientY < midY

    // 移除之前的提示类
    e.currentTarget.classList.remove('drag-over-sort', 'drag-over-nest')

    // 添加对应的提示类
    if (isOnTop) {
      e.currentTarget.classList.add('drag-over-sort')
    } else {
      e.currentTarget.classList.add('drag-over-nest')
    }

    onDragOver(e)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // 清理视觉提示类
    e.currentTarget.classList.remove('drag-over-sort', 'drag-over-nest')

    // 只有当真正离开元素时才移除高亮
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
    }
  }


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // 清理视觉提示类
    e.currentTarget.classList.remove('drag-over-sort', 'drag-over-nest')
    setIsDragOver(false)
    onDrop(e, group)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setIsDragOver(false)
    onDragEnd()
  }

  return (
    <div
      className={`group-item ${isSelected ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      title="拖拽到上方进行排序，拖拽到下方移动到该分组下；拖到空白区域成为顶级分组"
    >
      <div className="group-left">
        <div className="group-color" style={{ background: group.color }} />
        <div className="group-name">{group.name}</div>
      </div>
      <div className="group-right">
        {hasChildren && (
          <button
            className="expand-toggle"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand?.()
            }}
            title={isExpanded ? '收起分组' : '展开分组'}
          >
            {isExpanded ? '∨' : '>'}
          </button>
        )}
        <div className="count-and-menu">
          <div className="group-count">{taskCount}</div>
          <button
            className="icon-btn ghost"
            onClick={(e) => {
              e.stopPropagation()
              onMenuClick(e, group.id)
            }}
          >
            ⋮
          </button>
        </div>
      </div>
    </div>
  )
}