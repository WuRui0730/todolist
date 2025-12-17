import { useState } from 'react'
import { presetColors } from '../constants'

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState('#ff6b6b')

  const handlePresetColorClick = (color: string) => {
    onColorChange(color)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    onColorChange(color)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    // 允许输入#和十六进制字符
    if (/^#[0-9A-Fa-f]*$/.test(value) && value.length <= 7) {
      // 如果是完整的HEX颜色代码，应用它
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        handleCustomColorChange(value)
      }
      setCustomColor(value)
    }
  }

  // 常用颜色
  const popularColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f',
    '#fa8c16', '#9b59b6', '#5dade2', '#48c774',
    '#e74c3c', '#3498db', '#e91e63', '#8bc34a',
    '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe',
    '#00b894', '#00cec9', '#0984e3', '#74b9ff'
  ]

  return (
    <div className="color-picker-wrapper">
      {/* 预设基础颜色 */}
      <div className="preset-colors-section">
        <div className="section-title">基础颜色</div>
        <div className="color-grid">
          {presetColors.map((color) => (
            <div
              key={color}
              className={`color-item ${selectedColor === color ? 'selected' : ''} ${color === '#ffffff' ? 'white-border' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetColorClick(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* 自定义颜色输入 */}
      <div className="custom-color-section">
        <div className="section-title">自定义颜色</div>
        <div className="custom-color-container">
          <div className="color-input-group">
            <div className="color-input-wrapper">
              <input
                type="color"
                value={customColor.startsWith('#') ? customColor : '#ff6b6b'}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="color-input"
                title="选择自定义颜色"
              />
              <div className="color-input-label">点击选择</div>
            </div>
            <div className="hex-input-wrapper">
              <input
                type="text"
                value={customColor}
                onChange={handleHexInputChange}
                placeholder="#FF6B6B"
                className="hex-input"
                maxLength={7}
              />
              <div className="hex-input-label">HEX颜色值</div>
            </div>
          </div>
          <div
            className="current-color-preview"
            style={{
              backgroundColor: customColor.startsWith('#') && customColor.length === 7 ? customColor : '#ff6b6b'
            }}
          />
        </div>
      </div>

      {/* 常用颜色快捷选择 */}
      <div className="popular-colors-section">
        <div className="section-title">常用颜色</div>
        <div className="popular-colors-grid">
          {popularColors.map((color) => (
            <div
              key={color}
              className={`popular-color ${selectedColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleCustomColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}