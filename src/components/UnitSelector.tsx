interface UnitSelectorProps {
  value?: string
  onChange: (unit: string) => void
  placeholder?: string
  options?: { value: string; label: string }[]
}

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