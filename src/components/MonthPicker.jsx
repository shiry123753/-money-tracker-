import { useState } from 'react'
import WheelPicker from './WheelPicker'

const YEARS = (() => {
  const y = new Date().getFullYear()
  return Array.from({ length: 12 }, (_, i) => y - 10 + i) // 前 10 年到明年
})()
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

// 點首頁月份標題開啟:iOS 滾輪式年/月選擇,按「確定」套用並跳轉
export default function MonthPicker({ value, onChange, onClose }) {
  const [y, m] = value.split('-').map(Number)
  const [selYear, setSelYear] = useState(y)
  const [selMonth, setSelMonth] = useState(m)

  function confirm() {
    onChange(`${selYear}-${String(selMonth).padStart(2, '0')}`)
    onClose()
  }

  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>選擇月份</h2>
        <div className="wheel-wrap">
          <WheelPicker items={YEARS} value={selYear} onChange={setSelYear}
            format={(v) => `${v} 年`} />
          <WheelPicker items={MONTHS} value={selMonth} onChange={setSelMonth}
            format={(v) => `${v} 月`} />
          <div className="wheel-hl" />
          <div className="wheel-fade top" />
          <div className="wheel-fade bottom" />
        </div>
        <div className="row2" style={{ marginTop: 14 }}>
          <button className="btn ghost sm" onClick={onClose}>取消</button>
          <button className="btn sm" onClick={confirm}>確 定</button>
        </div>
      </div>
    </div>
  )
}
