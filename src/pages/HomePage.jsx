import { useMemo, useRef, useState } from 'react'
import { CalendarDays, List, Plus, ChevronDown } from 'lucide-react'
import { useSession } from '../hooks/useSession'
import { useTransactions, useRules, useCategoryMeta } from '../hooks/useData'
import { addRule } from '../data/rules'
import { sumIncome, sumExpense } from '../data/transactions'
import { todayStr, monthKey, thisMonthKey, shiftMonth, monthLabel, fmtMoney, dateLabel, weekdayLabel } from '../data/format'
import CalendarView from '../components/CalendarView'
import MonthPicker from '../components/MonthPicker'
import AddSheet from '../components/AddSheet'
import TxList from '../components/TxList'
import TxEditor from '../components/TxEditor'

export default function HomePage() {
  const session = useSession()
  const txs = useTransactions(session.userId)
  const rules = useRules(session.userId)
  const { categories, incomeCategories, categoryMeta } = useCategoryMeta(session.userId)

  const [month, setMonth] = useState(thisMonthKey())
  const [view, setView] = useState('calendar') // 'calendar' | 'list'
  const [selectedDay, setSelectedDay] = useState(todayStr())
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [picking, setPicking] = useState(false)
  const [toast, setToast] = useState('')
  const [rulePrompt, setRulePrompt] = useState(null)
  const touchRef = useRef(null)

  const monthTxs = useMemo(
    () => (txs || []).filter((t) => monthKey(t.date) === month), [txs, month])

  // 月曆每日統計:支出總額 + 是否有其他類型(收入/借貸 → 色點)
  const dayStats = useMemo(() => {
    const map = {}
    for (const t of monthTxs) {
      const s = map[t.date] || (map[t.date] = { expense: 0, other: false })
      if (t.type === 'expense') s.expense += t.amount
      else s.other = true
    }
    return map
  }, [monthTxs])

  const dayTxs = useMemo(
    () => monthTxs.filter((t) => t.date === selectedDay), [monthTxs, selectedDay])

  function applyMonth(next) {
    setMonth(next)
    setSelectedDay(next === thisMonthKey() ? todayStr() : `${next}-01`)
  }

  function changeMonth(delta) {
    applyMonth(shiftMonth(month, delta))
  }

  // 日曆左右滑動換月:往右滑=上一月,往左滑=下一月
  function onTouchStart(e) {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e) {
    const t = touchRef.current
    touchRef.current = null
    if (!t) return
    const dx = e.changedTouches[0].clientX - t.x
    const dy = e.changedTouches[0].clientY - t.y
    if (Math.abs(dx) > 50 && Math.abs(dy) < 60) changeMonth(dx > 0 ? -1 : 1)
  }

  function handleSaved({ toast: t, rulePrompt: rp }) {
    setAdding(false)
    setToast(t)
    if (rp) setRulePrompt(rp)
    setTimeout(() => setToast(''), 3000)
  }

  async function confirmRule() {
    await addRule(session.userId, rulePrompt.keyword, rulePrompt.category)
    setRulePrompt(null)
  }

  return (
    <div>
      <div className="month-nav">
        <button onClick={() => changeMonth(-1)}>‹</button>
        <button className="m month-title" onClick={() => setPicking(true)}>
          {monthLabel(month)}<ChevronDown size={15} />
        </button>
        <span style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => changeMonth(1)}>›</button>
          <button className={view === 'calendar' ? 'view-on' : ''} title="日曆檢視"
            onClick={() => setView('calendar')}><CalendarDays size={15} /></button>
          <button className={view === 'list' ? 'view-on' : ''} title="當月摘要"
            onClick={() => setView('list')}><List size={15} /></button>
        </span>
      </div>

      <div className="month-hero">
        <div className="kicker">Monthly Expense 本月支出</div>
        <div className="hero-amt">{fmtMoney(sumExpense(monthTxs))}</div>
        <div className="hero-sub">收入 {fmtMoney(sumIncome(monthTxs))}</div>
      </div>

      {toast && <div className="insight good">✓ {toast}</div>}
      {rulePrompt && (
        <div className="insight">
          要新增規則「<b>{rulePrompt.keyword}</b> → {rulePrompt.category}」嗎?之後輸入相同關鍵字會自動分類。
          <div className="row2" style={{ marginTop: 8 }}>
            <button className="btn sm" onClick={confirmRule}>新增規則</button>
            <button className="btn ghost sm" onClick={() => setRulePrompt(null)}>先不要</button>
          </div>
        </div>
      )}

      {txs === null ? (
        <div className="empty">載入中…</div>
      ) : view === 'calendar' ? (
        <>
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <CalendarView monthKey={month} dayStats={dayStats}
              selected={selectedDay} onSelect={setSelectedDay} />
          </div>
          <div className="tx-date-head">
            {dateLabel(selectedDay)}
            <span className="wd">週{weekdayLabel(selectedDay)}</span>
          </div>
          {dayTxs.length
            ? <TxList list={dayTxs} meta={categoryMeta} onSelect={setEditing} showDateHead={false} />
            : <div className="empty" style={{ padding: '18px 0' }}>這天沒有紀錄</div>}
        </>
      ) : (
        <TxList list={monthTxs} meta={categoryMeta} onSelect={setEditing} />
      )}

      <button className="fab" aria-label="記一筆" onClick={() => setAdding(true)}>
        <Plus size={26} />
      </button>

      {picking && (
        <MonthPicker value={month} onChange={applyMonth} onClose={() => setPicking(false)} />
      )}

      {adding && (
        <AddSheet
          userId={session.userId}
          rules={rules}
          categories={categories}
          incomeCategories={incomeCategories}
          meta={categoryMeta}
          defaultDate={view === 'calendar' ? selectedDay : todayStr()}
          onSaved={handleSaved}
          onClose={() => setAdding(false)}
        />
      )}

      {editing && (
        <TxEditor tx={editing} categories={categories} incomeCategories={incomeCategories}
          meta={categoryMeta} userId={session.userId} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
