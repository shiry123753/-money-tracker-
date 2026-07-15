import { fmtMoney } from '../data/format'

// 近幾個月收支長條圖:months = [{ key: 'YYYY-MM', income, expense }]
export default function TrendChart({ months }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]))
  const W = 320
  const H = 150
  const chartH = 112
  const groupW = W / months.length
  const barW = Math.min(16, groupW / 3)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
        <line x1="0" y1={chartH + 0.5} x2={W} y2={chartH + 0.5} stroke="#D8D0C2" />
        {months.map((m, i) => {
          const cx = i * groupW + groupW / 2
          const hIn = (m.income / max) * (chartH - 14)
          const hEx = (m.expense / max) * (chartH - 14)
          return (
            <g key={m.key}>
              <rect x={cx - barW - 1.5} y={chartH - hIn} width={barW} height={hIn} fill="#B9A789" />
              <rect x={cx + 1.5} y={chartH - hEx} width={barW} height={hEx} fill="#6E665B" />
              <text x={cx} y={H - 22} textAnchor="middle"
                style={{ font: '10px "Times New Roman", Georgia, serif', fill: '#8C8273' }}>
                {Number(m.key.slice(5))}月
              </text>
              <text x={cx} y={H - 8} textAnchor="middle"
                style={{ font: '9px "Times New Roman", Georgia, serif', fill: '#1A1714' }}>
                {m.expense ? fmtMoney(m.expense) : ''}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="legend-row" style={{ justifyContent: 'center', gap: 16, marginTop: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="dot" style={{ background: '#B9A789', width: 10, height: 10, borderRadius: 2 }} />收入
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span className="dot" style={{ background: '#6E665B', width: 10, height: 10, borderRadius: 2 }} />支出
        </span>
      </div>
    </div>
  )
}
