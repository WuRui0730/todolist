/**
 * 文件功能：删除分组确认弹窗
 * 提供删除分组的选项，允许用户选择仅删除分组（保留任务）或完全删除。
 */
interface DeleteGroupModalProps {
  isOpen: boolean
  groupName: string
  onCancel: () => void
  onConfirm: () => void
  option: 'move' | 'delete'
  onOptionChange: (option: 'move' | 'delete') => void
}

/**
 * 删除分组确认弹窗
 * 提供两种删除模式：
 * 1. 仅删除分组，任务移入未分组
 * 2. 完全删除分组及其下所有任务
 */
export function DeleteGroupModal({ isOpen, groupName, onCancel, onConfirm, option, onOptionChange }: DeleteGroupModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal danger" onClick={(e) => e.stopPropagation()}>
        <h4>删除分组</h4>
        <p>确定要删除分组 "{groupName}" 吗？请选择删除方式：</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="deleteOption"
              value="move"
              checked={option === 'move'}
              onChange={(e) => onOptionChange(e.target.value as 'move' | 'delete')}
            />
            <span>移入未分组：只删除分组，任务移入"未分组"</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="deleteOption"
              value="delete"
              checked={option === 'delete'}
              onChange={(e) => onOptionChange(e.target.value as 'move' | 'delete')}
            />
            <span>完全删除：删除分组及所有任务（任务移入"最近删除"）</span>
          </label>
        </div>

        <div className="modal-buttons">
          <button className="btn secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn" onClick={onConfirm}>
            确定删除
          </button>
        </div>
      </div>
    </div>
  )
}