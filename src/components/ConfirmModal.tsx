/**
 * 文件功能：通用确认对话框
 * 用于执行危险操作（如删除任务、注销账号）前的二次确认提示。
 */
import { useEffect } from 'react'

interface ConfirmModalProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
  type?: 'warning' | 'danger' | 'info'
}

/**
 * 通用确认对话框组件
 * 用于执行危险操作前的二次确认
 */
export function ConfirmModal({
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  isOpen,
  type = 'warning'
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Enter') {
        onConfirm()
      } else if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className={`modal modal-${type}`} onClick={(e) => e.stopPropagation()}>
        <h4>{title}</h4>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="btn secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${type === 'danger' ? 'danger' : 'primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}