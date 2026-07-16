import { fmtMoney } from '../data/format'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

// 月曆檢視:每天顯示當日支出小字;點某天由父層列出明細
// dayStats: { 'YYYY-MM-DD': { expense, other } }
export default function CalendarView({ monthKey, dayStats, selected, onSelect }) {
  const [y, m] = monthKey.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="calendar">
      <div className="cal-week">
        {WEEKDAYS.map((w) => <span key={w} className="cal-wd">{w}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} className="cal-cell empty" />
          const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`
          const stat = dayStats[dateStr]
          return (
            <button key={dateStr} type="button"
              className={`cal-cell${selected === dateStr ? ' on' : ''}`}
              onClick={() => onSelect(dateStr)}>
              <span className="cal-day">{day}</span>
              {stat?.expense
                ? <span className="cal-amt">{fmtMoney(stat.expense)}</span>
                : stat?.other
                  ? <span className="cal-dot" />
                  : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
