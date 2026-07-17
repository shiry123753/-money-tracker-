import { useState } from 'react'

// 點首頁月份標題開啟:年份橫向滑動選、月份九宮格點選即套用
export default function MonthPicker({ value, onChange, onClose }) {
  const [y] = value.split('-').map(Number)
  const [selYear, setSelYear] = useState(y)
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 8 }, (_, i) => thisYear - 6 + i)
  const curMonth = Number(value.split('-')[1])

  function pick(m) {
    onChange(`${selYear}-${String(m).padStart(2, '0')}`)
    onClose()
  }

  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>選擇月份</h2>
        <div className="year-scroll">
          {years.map((yy) => (
            <button key={yy} type="button"
              className={`year-chip${selYear === yy ? ' on' : ''}`}
              onClick={() => setSelYear(yy)}>
              {yy}
            </button>
          ))}
        </div>
        <div className="mp-grid">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <button key={m} type="button"
              className={`mp-cell${selYear === y && m === curMonth ? ' on' : ''}`}
              onClick={() => pick(m)}>
              {m} 月
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
