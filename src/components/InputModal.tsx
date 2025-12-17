import { useState, useEffect } from 'react'

interface InputModalProps {
  title: string
  label: string
  value: string
  placeholder?: string
  type?: 'text' | 'color'
  onConfirm: (value: string, ...args: any[]) => void  // 支持多参数
  onCancel: () => void
  isOpen: boolean
  secondValue?: string  // 用于第二个值（如颜色）
}

export function InputModal({
  title,
  label,
  value: initialValue,
  placeholder,
  type = 'text',
  onConfirm,
  onCancel,
  isOpen,
  secondValue
}: InputModalProps) {
  const [value, setValue] = useState(initialValue)
  const [colorValue, setColorValue] = useState(secondValue || initialValue)

  useEffect(() => {
    setValue(initialValue)
    setColorValue(secondValue || initialValue)
  }, [initialValue, secondValue, isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    // 根据类型决定传递的参数
    if (type === 'color') {
      // 颜色类型：传递两个参数 (name, color)
      onConfirm(value, colorValue)
    } else {
      // 文本类型：传递一个参数 (value)
      onConfirm(value)
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
        <h4>{title}</h4>
        <div className="modal-field">
          <label>{label}</label>
          {type === 'color' ? (
            <>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input"
                placeholder={placeholder}
                autoFocus
              />
              <label style={{ marginTop: '12px' }}>分组颜色</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="color-input"
                />
                <input
                  type="text"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="input"
                  placeholder="#000000"
                />
              </div>
            </>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input"
              placeholder={placeholder}
              autoFocus
            />
          )}
        </div>
        <div className="modal-buttons">
          <button className="btn secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn primary" onClick={handleConfirm}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}