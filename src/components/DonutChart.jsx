import { fmtMoney } from '../data/format'
import { getCategoryMeta } from '../data/categoryMeta'

function arcPath(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

// 甜甜圈圖:每一塊用分類自己的顏色;下方為金額排行(由高到低)
export default function DonutChart({ items, meta, centerLabel }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  if (!total) return <div className="empty"><span className="en">NO DATA</span>這個區間還沒有資料</div>

  const sorted = [...items].sort((a, b) => b.value - a.value)
  let angle = -Math.PI / 2
  const segs = sorted.map((it) => {
    const { Icon, color } = getCategoryMeta(it.name, meta)
    const sweep = (it.value / total) * Math.PI * 2
    const a0 = angle
    // 避免單一分類 100% 時弧線起訖重合而消失
    const a1 = angle + Math.min(sweep, Math.PI * 2 - 0.0001)
    angle += sweep
    return { ...it, a0, a1, color, Icon, pct: (it.value / total) * 100 }
  })

  return (
    <div>
      <svg viewBox="0 0 200 200" style={{ width: 186, display: 'block', margin: '0 auto' }}>
        {segs.map((s) => (
          <path key={s.name} d={arcPath(100, 100, 72, s.a0, s.a1)} fill="none"
            stroke={s.color} strokeWidth="34" />
        ))}
        {segs.filter((s) => s.pct >= 8).map((s) => {
          const mid = (s.a0 + s.a1) / 2
          return (
            <text key={`p-${s.name}`} textAnchor="middle"
              x={100 + 72 * Math.cos(mid)} y={100 + 72 * Math.sin(mid) + 3}
              style={{ font: '700 10.5px sans-serif', fill: '#F4EFE6' }}>
              {Math.round(s.pct)}%
            </text>
          )
        })}
        <text x="100" y="94" textAnchor="middle"
          style={{ font: '600 21px "Times New Roman", Georgia, serif', fill: '#1A1714' }}>
          {fmtMoney(total)}
        </text>
        <text x="100" y="114" textAnchor="middle"
          style={{ font: '10px sans-serif', letterSpacing: 2, fill: '#8C8273' }}>
          {centerLabel}
        </text>
      </svg>
      <div className="legend">
        {segs.map((s, i) => (
          <div className="legend-row" key={s.name}>
            <span className="rank serif">{i + 1}</span>
            <span className="cat-icon" style={{ width: 26, height: 26, background: s.color }}>
              <s.Icon size={14} />
            </span>
            <span className="lname">{s.name}</span>
            <span className="lval">{fmtMoney(s.value)}</span>
            <span className="lpct">{Math.round(s.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
