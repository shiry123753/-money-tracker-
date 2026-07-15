import { useMemo, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useTransactions, useCategories } from '../hooks/useData'
import { monthKey, thisMonthKey, shiftMonth, monthLabel, fmtMoney } from '../data/format'
import { sumIncome, sumExpense } from '../data/transactions'
import TxList from '../components/TxList'
import TxEditor from '../components/TxEditor'

export default function TransactionsPage() {
  const session = useSession()
  const txs = useTransactions(session.userId)
  const categories = useCategories(session.userId)
  const [month, setMonth] = useState(thisMonthKey())
  const [type, setType] = useState('all')
  const [cat, setCat] = useState('all')
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => (txs || []).filter((t) =>
    monthKey(t.date) === month &&
    (type === 'all' || t.type === type) &&
    (cat === 'all' || t.category === cat)), [txs, month, type, cat])

  const income = sumIncome(filtered)
  const expense = sumExpense(filtered)

  return (
    <div>
      <div className="section-head">
        <span className="en">Transactions</span>
        <span className="kicker">交易明細</span>
      </div>

      <div className="month-nav">
        <button onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
        <span className="m">{monthLabel(month)}</span>
        <button onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
      </div>

      <div className="filter-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">全部類型</option>
          <option value="expense">支出</option>
          <option value="income">收入</option>
          <option value="debt">借貸</option>
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">全部分類</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          <option value="借貸">借貸</option>
        </select>
      </div>

      <div className="kpi-row" style={{ marginBottom: 6 }}>
        <div className="kpi">
          <div className="kpi-label">Income 收入</div>
          <div className="kpi-value">{fmtMoney(income)}</div>
        </div>
        <div className="kpi ink">
          <div className="kpi-label">Expense 支出</div>
          <div className="kpi-value">{fmtMoney(expense)}</div>
        </div>
      </div>

      {txs === null
        ? <div className="empty">載入中…</div>
        : <TxList list={filtered} onSelect={setEditing} />}

      {editing && (
        <TxEditor tx={editing} categories={categories} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
