/**
 * 文件功能：单位选择器
 * 下拉选择组件，用于选择习惯或目标任务的计量单位（如次、分钟）。
 */
interface UnitSelectorProps {
  value?: string
  onChange: (unit: string) => void
  placeholder?: string
  options?: { value: string; label: string }[]
}

/**
 * 单位选择器组件
 * 用于目标设定中的单位选择（如：次、分钟、小时等）
 */
export function UnitSelector({ value, onChange, placeholder, options }: UnitSelectorProps) {
  const defaultOptions = [
    { value: '次', label: '次' },
    { value: '分钟', label: '分钟' },
    { value: '小时', label: '小时' },
    { value: '自定义', label: '自定义' }
  ]

  const unitOptions = options || defaultOptions

  return (
    <select
      className="input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>{placeholder || '选择单位'}</option>
      {unitOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}