import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { subscribeSharesByViewer, visibleToViewer } from '../data/share'
import { fetchTransactions, sumIncome, sumExpense } from '../data/transactions'
import { monthKey, thisMonthKey, shiftMonth, monthLabel, fmtMoney } from '../data/format'
import { SHARE_LEVEL_LABEL } from '../data/constants'
import TxList from '../components/TxList'
import DonutChart from '../components/DonutChart'

export default function PartnerPage() {
  const session = useSession()
  const [shares, setShares] = useState(null)
  const [active, setActive] = useState(null) // 選中的分享
  const [txs, setTxs] = useState(null)
  const [month, setMonth] = useState(thisMonthKey())

  useEffect(() => subscribeSharesByViewer(session.userId, (list) => {
    const act = list.filter((s) => s.status === 'active')
    setShares(act)
    setActive((cur) => act.find((s) => s.id === cur?.id) || act[0] || null)
  }), [session.userId])

  // 唯讀:一次性抓取對方交易,依權限過濾
  useEffect(() => {
    if (!active) return
    setTxs(null)
    let cancelled = false
    fetchTransactions(active.ownerId).then((list) => {
      if (!cancelled) setTxs(list.filter((t) => visibleToViewer(t, active.level)))
    })
    return () => { cancelled = true }
  }, [active])

  const monthTxs = useMemo(
    () => (txs || []).filter((t) => monthKey(t.date) === month), [txs, month])

  const pieItems = useMemo(() => {
    const map = new Map()
    for (const t of monthTxs) {
      if (t.type !== 'expense') continue
      map.set(t.category, (map.get(t.category) || 0) + t.amount)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [monthTxs])

  if (shares === null) return <div className="empty">載入中…</div>

  if (!shares.length) {
    return (
      <div>
        <div className="section-head">
          <span className="en">Partner</span>
          <span className="kicker">對方的帳本</span>
        </div>
        <div className="empty">
          <span className="en">NOT SHARED YET</span>
          還沒有人分享帳本給你。<br />請對方到「分享設定」輸入你的加入碼發出邀請。
        </div>
        <Link className="menu-link" to="/share"><span>前往分享設定</span><span className="en">Share</span></Link>
      </div>
    )
  }

  return (
    <div>
      <div className="section-head">
        <span className="en">Partner</span>
        <span className="kicker">唯讀 · 不可編輯</span>
      </div>

      {shares.length > 1 && (
        <div className="filter-row">
          <select value={active?.id || ''} onChange={(e) => setActive(shares.find((s) => s.id === e.target.value))}>
            {shares.map((s) => <option key={s.id} value={s.id}>{s.ownerName} 的帳本</option>)}
          </select>
        </div>
      )}

      <div className="card" style={{ padding: 14 }}>
        <h2 style={{ fontSize: 18 }}>{active.ownerName} 的帳本</h2>
        <div className="muted">權限:{SHARE_LEVEL_LABEL[active.level]}</div>
      </div>

      <div className="month-nav">
        <button onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
        <span className="m">{monthLabel(month)}</span>
        <button onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
      </div>

      <div className="kpi-row" style={{ marginBottom: 12 }}>
        {active.level !== 'expense_only' && (
          <div className="kpi">
            <div className="kpi-label">Income 收入</div>
            <div className="kpi-value">{fmtMoney(sumIncome(monthTxs))}</div>
          </div>
        )}
        <div className="kpi ink">
          <div className="kpi-label">Expense 支出</div>
          <div className="kpi-value">{fmtMoney(sumExpense(monthTxs))}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-head" style={{ margin: '0 0 10px' }}>
          <span className="en" style={{ fontSize: 17 }}>Categories</span>
          <span className="kicker">分類佔比</span>
        </div>
        {txs === null ? <div className="empty">載入中…</div>
          : <DonutChart items={pieItems} centerLabel="當月支出" />}
      </div>

      {txs === null ? <div className="empty">載入中…</div> : <TxList list={monthTxs} />}
    </div>
  )
}
