import { fmtMoney } from '../data/format'

// 品牌色階（淺→深的暖色調,不使用彩虹色）
const RAMP = ['#6E665B', '#B9A789', '#2A2520', '#9C8E78', '#847A6B', '#C2B7A4', '#5E5A4E', '#A98C76']

function arcPath(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

// 甜甜圈圖:items = [{ name, value }],由大到小排序後上色
export default function DonutChart({ items, centerLabel }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  if (!total) return <div className="empty"><span className="en">NO DATA</span>這個月還沒有資料</div>

  const sorted = [...items].sort((a, b) => b.value - a.value)
  let angle = -Math.PI / 2
  const segs = sorted.map((it, i) => {
    const sweep = (it.value / total) * Math.PI * 2
    // 避免單一分類 100% 時弧線起訖重合而消失
    const a0 = angle
    const a1 = angle + Math.min(sweep, Math.PI * 2 - 0.0001)
    angle += sweep
    return { ...it, a0, a1, color: RAMP[i % RAMP.length] }
  })

  return (
    <div>
      <svg viewBox="0 0 200 200" style={{ width: 168, display: 'block', margin: '0 auto' }}>
        {segs.map((s) => (
          <path key={s.name} d={arcPath(100, 100, 72, s.a0, s.a1)} fill="none"
            stroke={s.color} strokeWidth="34" />
        ))}
        <text x="100" y="94" textAnchor="middle"
          style={{ font: '600 22px "Times New Roman", Georgia, serif', fill: '#1A1714' }}>
          {fmtMoney(total)}
        </text>
        <text x="100" y="114" textAnchor="middle"
          style={{ font: '10px sans-serif', letterSpacing: 2, fill: '#8C8273' }}>
          {centerLabel}
        </text>
      </svg>
      <div className="legend">
        {segs.map((s) => (
          <div className="legend-row" key={s.name}>
            <span className="dot" style={{ background: s.color }} />
            <span className="lname">{s.name}</span>
            <span className="lval">{fmtMoney(s.value)}</span>
            <span className="lpct">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
