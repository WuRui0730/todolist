/**
 * 文件功能：编辑分组弹窗
 * 专门用于修改现有分组名称和颜色的模态框组件。
 */
import { useState, useEffect } from 'react'

interface EditGroupModalProps {
  groupName: string
  groupColor: string
  onConfirm: (name: string, color: string) => void
  onCancel: () => void
  isOpen: boolean
}

/**
 * 编辑分组弹窗组件
 * 允许修改分组名称和颜色，提供预设颜色快速选择
 */
export function EditGroupModal({
  groupName,
  groupColor,
  onConfirm,
  onCancel,
  isOpen
}: EditGroupModalProps) {
  const [name, setName] = useState(groupName)
  const [color, setColor] = useState(groupColor)

  useEffect(() => {
    setName(groupName)
    setColor(groupColor)
  }, [groupName, groupColor, isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim(), color)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <h4>编辑分组</h4>

        <div className="modal-field">
          <label>分组名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="请输入分组名称"
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label>分组颜色</label>
          <div className="color-input-wrapper">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-input"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* 预设颜色 */}
        <div className="modal-field">
          <label>快速选择</label>
          <div className="color-presets">
            {['#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ffff00', '#ff00ff',
              '#ffffff', '#000000', '#7cc4a3', '#a7c8ff', '#f5c26b', '#c9b7ff',
              '#ffb7c5', '#93c5fd', '#fde68a', '#a7f3d0'].map((presetColor) => (
              <button
                key={presetColor}
                className={`color-preset ${color === presetColor ? 'active' : ''}`}
                style={{ background: presetColor }}
                onClick={() => setColor(presetColor)}
                title={presetColor}
              />
            ))}
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn primary" onClick={handleConfirm}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}