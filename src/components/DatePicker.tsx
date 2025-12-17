/**
 * 文件功能：日期选择器
 * 自定义日历组件，支持按月切换和日期选择，用于设置任务截止时间或生日。
 */
import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  max?: string
}

/**
 * 日期选择器组件
 * 支持按月切换、选择日期，可设置最大可选日期
 */
export function DatePicker({ value, onChange, placeholder, max }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // 添加空白格子
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // 添加日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const selectedDate = new Date(year, month, day)

    // 检查是否超过最大日期
    if (max && selectedDate > new Date(max)) {
      return
    }

    onChange(formatDate(selectedDate.toISOString()))
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!value) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return formatDate(date.toISOString()) === value
  }

  const isDisabled = (day: number) => {
    if (!max) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date > new Date(max)
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const monthYear = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`

  return (
    <div className="date-picker-wrapper" ref={pickerRef}>
      <div
        className="date-picker-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          className="input"
          value={value || ''}
          placeholder={placeholder || '请选择日期'}
          readOnly
          style={{ cursor: 'pointer' }}
        />
        <span className="date-picker-icon">📅</span>
      </div>

      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="date-picker-header">
            <button className="date-picker-nav" onClick={handlePrevMonth}>‹</button>
            <div className="date-picker-title">{monthYear}</div>
            <button className="date-picker-nav" onClick={handleNextMonth}>›</button>
          </div>

          <div className="date-picker-weekdays">
            {weekDays.map(day => (
              <div key={day} className="date-picker-weekday">{day}</div>
            ))}
          </div>

          <div className="date-picker-days">
            {getDaysInMonth(currentMonth).map((day, index) => (
              <div key={index} className="date-picker-day-empty">
                {day && (
                  <button
                    className={`date-picker-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${isDisabled(day) ? 'disabled' : ''}`}
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled(day)}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}