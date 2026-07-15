import { useMemo, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useTransactions } from '../hooks/useData'
import { monthKey, thisMonthKey, shiftMonth, monthLabel, fmtMoney } from '../data/format'
import DonutChart from '../components/DonutChart'
import TrendChart from '../components/TrendChart'

export default function DashboardPage() {
  const session = useSession()
  const txs = useTransactions(session.userId)
  const [month, setMonth] = useState(thisMonthKey())
  const [includeDebt, setIncludeDebt] = useState(false) // 預設不將借貸納入圖表

  const monthTxs = useMemo(
    () => (txs || []).filter((t) => monthKey(t.date) === month), [txs, month])

  // 圓餅:支出各分類佔比;開關打開時,借貸以「借貸」分類一併呈現
  const pieItems = useMemo(() => {
    const map = new Map()
    for (const t of monthTxs) {
      if (t.type === 'expense') {
        map.set(t.category, (map.get(t.category) || 0) + t.amount)
      } else if (t.type === 'debt' && includeDebt) {
        map.set('借貸', (map.get('借貸') || 0) + t.amount)
      }
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [monthTxs, includeDebt])

  const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // 趨勢:近 6 個月收支;開關打開時把借貸依方向計入(我欠→視為流入,欠我→視為流出)
  const trend = useMemo(() => {
    const keys = Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5))
    return keys.map((key) => {
      let inc = 0, exp = 0
      for (const t of txs || []) {
        if (monthKey(t.date) !== key) continue
        if (t.type === 'income') inc += t.amount
        else if (t.type === 'expense') exp += t.amount
        else if (t.type === 'debt' && includeDebt) {
          if (t.debtInfo?.direction === 'iOwe') inc += t.amount
          else exp += t.amount
        }
      }
      return { key, income: inc, expense: exp }
    })
  }, [txs, month, includeDebt])

  return (
    <div>
      <div className="section-head">
        <span className="en">Dashboard</span>
        <span className="kicker">分析</span>
      </div>

      <div className="month-nav">
        <button onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
        <span className="m">{monthLabel(month)}</span>
        <button onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
      </div>

      <div className="kpi-row" style={{ marginBottom: 14 }}>
        <div className="kpi">
          <div className="kpi-label">Income 收入</div>
          <div className="kpi-value">{fmtMoney(income)}</div>
        </div>
        <div className="kpi ink">
          <div className="kpi-label">Expense 支出</div>
          <div className="kpi-value">{fmtMoney(expense)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Balance 結餘</div>
          <div className="kpi-value" style={{ color: income - expense < 0 ? 'var(--bad)' : undefined }}>
            {fmtMoney(income - expense)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-head" style={{ margin: '0 0 10px' }}>
          <span className="en" style={{ fontSize: 17 }}>Categories</span>
          <span className="kicker">分類佔比</span>
        </div>
        {txs === null ? <div className="empty">載入中…</div>
          : <DonutChart items={pieItems} centerLabel={includeDebt ? '支出＋借貸' : '本月支出'} />}
      </div>

      <div className="card">
        <div className="section-head" style={{ margin: '0 0 10px' }}>
          <span className="en" style={{ fontSize: 17 }}>Trend</span>
          <span className="kicker">近六個月</span>
        </div>
        <TrendChart months={trend} />
      </div>

      <div className="card" style={{ padding: '10px 16px' }}>
        <div className="switch-row">
          <span>將借貸納入圖表</span>
          <span className="switch">
            <input type="checkbox" checked={includeDebt}
              onChange={(e) => setIncludeDebt(e.target.checked)} />
            <span className="knob" />
          </span>
        </div>
      </div>
    </div>
  )
}
