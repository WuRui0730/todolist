/**
 * 文件功能：时间选择器
 * 支持时、分、秒选择的组件，用于设置专注时长或提醒时间。
 */
import { useState } from 'react'

type TimePickerProps = {
  value: { hours: number; minutes: number; seconds: number }
  onChange: (time: { hours: number; minutes: number; seconds: number }) => void
  label?: string
  showSeconds?: boolean
}

/**
 * 时间选择器组件
 * 支持时分秒选择，提供常用时间快捷选项
 */
export function TimePicker({ value, onChange, label, showSeconds = false }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleHoursChange = (delta: number) => {
    const newHours = Math.max(0, Math.min(23, value.hours + delta))
    onChange({ ...value, hours: newHours })
  }

  const handleMinutesChange = (delta: number) => {
    const newMinutes = Math.max(0, Math.min(59, value.minutes + delta))
    onChange({ ...value, minutes: newMinutes })
  }

  const handleSecondsChange = (delta: number) => {
    if (!showSeconds) return
    const newSeconds = Math.max(0, Math.min(59, value.seconds + delta))
    onChange({ ...value, seconds: newSeconds })
  }

  const formatTime = (num: number) => num.toString().padStart(2, '0')

  return (
    <div className="time-picker">
      {label && <label className="input-label">{label}</label>}
      <div className="time-picker-display" onClick={() => setIsOpen(!isOpen)}>
        <span className="time-unit">
          {formatTime(value.hours)}
        </span>
        <span className="time-separator">:</span>
        <span className="time-unit">
          {formatTime(value.minutes)}
        </span>
        {showSeconds && (
          <>
            <span className="time-separator">:</span>
            <span className="time-unit">
              {formatTime(value.seconds)}
            </span>
          </>
        )}
      </div>

      {isOpen && (
        <div className="time-picker-panel">
          <div className="time-picker-controls">
            <div className="time-column">
              <div className="time-column-label">时</div>
              <button className="time-btn" onClick={() => handleHoursChange(1)}>▲</button>
              <div className="time-value">{formatTime(value.hours)}</div>
              <button className="time-btn" onClick={() => handleHoursChange(-1)}>▼</button>
            </div>

            <div className="time-column">
              <div className="time-column-label">分</div>
              <button className="time-btn" onClick={() => handleMinutesChange(1)}>▲</button>
              <div className="time-value">{formatTime(value.minutes)}</div>
              <button className="time-btn" onClick={() => handleMinutesChange(-1)}>▼</button>
            </div>

            {showSeconds && (
              <div className="time-column">
                <div className="time-column-label">秒</div>
                <button className="time-btn" onClick={() => handleSecondsChange(1)}>▲</button>
                <div className="time-value">{formatTime(value.seconds)}</div>
                <button className="time-btn" onClick={() => handleSecondsChange(-1)}>▼</button>
              </div>
            )}
          </div>

          <div className="time-picker-shortcuts">
            <div className="time-shortcuts-label">快速选择</div>
            <div className="time-shortcuts-grid">
              <button className="time-shortcut" onClick={() => onChange({ hours: 0, minutes: 25, seconds: 0 })}>
                25分钟
              </button>
              <button className="time-shortcut" onClick={() => onChange({ hours: 0, minutes: 30, seconds: 0 })}>
                30分钟
              </button>
              <button className="time-shortcut" onClick={() => onChange({ hours: 0, minutes: 45, seconds: 0 })}>
                45分钟
              </button>
              <button className="time-shortcut" onClick={() => onChange({ hours: 1, minutes: 0, seconds: 0 })}>
                1小时
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}