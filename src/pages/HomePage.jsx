import { useMemo, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useTransactions, useRules, useCategories } from '../hooks/useData'
import { addTransaction } from '../data/transactions'
import { matchCategory, addRule } from '../data/rules'
import { addCategory } from '../data/users'
import { todayStr, fmtMoney } from '../data/format'
import TxList from '../components/TxList'

const NEW_CAT = '__new__'

export default function HomePage() {
  const session = useSession()
  const rules = useRules(session.userId)
  const categories = useCategories(session.userId)
  const txs = useTransactions(session.userId)

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayStr())
  const [manualCat, setManualCat] = useState(null) // 使用者手動覆蓋的分類
  const [direction, setDirection] = useState('iOwe')
  const [counterparty, setCounterparty] = useState('')
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [rulePrompt, setRulePrompt] = useState(null) // { keyword, category }

  // 備註即時比對規則,自動帶出分類;手動選擇優先
  const matched = useMemo(() => matchCategory(note, rules), [note, rules])
  const autoCat = matched?.category || '其他'
  const category = manualCat ?? autoCat
  const isDebt = type === 'debt'
  const valid = Number(amount) > 0 && date && (!isDebt || counterparty.trim())

  function onPickCategory(v) {
    if (v === NEW_CAT) {
      const name = window.prompt('新分類名稱:')?.trim()
      if (name && !categories.includes(name)) {
        addCategory(session.userId, name)
        setManualCat(name)
      }
      return
    }
    setManualCat(v)
  }

  async function save() {
    if (!valid || busy) return
    setBusy(true)
    const tx = {
      userId: session.userId,
      type,
      category: isDebt ? '借貸' : category,
      amount: Number(amount),
      date,
      note: note.trim(),
      shareLevel: hidden ? 'hidden' : 'all',
      debtInfo: isDebt
        ? { direction, counterparty: counterparty.trim(), status: 'unpaid', paidDate: null }
        : null,
    }
    await addTransaction(tx)

    // 沒有規則命中、又是有備註的支出 → 提示建立關鍵字規則,讓分類表越用越準
    if (!isDebt && !matched && note.trim()) {
      setRulePrompt({ keyword: note.trim(), category })
    }
    setToast(`已記一筆${isDebt ? '借貸' : category} ${fmtMoney(Number(amount))} 元`)
    setAmount('')
    setNote('')
    setCounterparty('')
    setManualCat(null)
    setBusy(false)
    setTimeout(() => setToast(''), 3000)
  }

  async function confirmRule() {
    await addRule(session.userId, rulePrompt.keyword, rulePrompt.category)
    setRulePrompt(null)
  }

  const recent = (txs || []).slice(0, 5)

  return (
    <div>
      <div className="section-head">
        <span className="en">Quick Add</span>
        <span className="kicker">記一筆</span>
      </div>

      <div className="card">
        <div className="field">
          <div className="seg">
            <button className={type === 'expense' ? 'on' : ''} onClick={() => setType('expense')}>支出</button>
            <button className={type === 'income' ? 'on' : ''} onClick={() => setType('income')}>收入</button>
            <button className={type === 'debt' ? 'on' : ''} onClick={() => setType('debt')}>借貸</button>
          </div>
        </div>

        <div className="field amount-input">
          <label>金額 Amount</label>
          <input type="number" inputMode="decimal" placeholder="0" value={amount}
            onChange={(e) => setAmount(e.target.value)} />
        </div>

        {isDebt && (
          <>
            <div className="field">
              <label>方向 Direction</label>
              <div className="seg">
                <button className={direction === 'iOwe' ? 'on' : ''} onClick={() => setDirection('iOwe')}>我欠別人</button>
                <button className={direction === 'owedToMe' ? 'on' : ''} onClick={() => setDirection('owedToMe')}>別人欠我</button>
              </div>
            </div>
            <div className="field">
              <label>對象 Counterparty</label>
              <input value={counterparty} placeholder="例如:小明"
                onChange={(e) => setCounterparty(e.target.value)} />
            </div>
          </>
        )}

        <div className="field">
          <label>品項 / 店名 Note</label>
          <input value={note} placeholder={isDebt ? '備註(選填)' : '例如:7-11、中油、麥當勞'}
            onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="row2">
          {!isDebt && (
            <div className="field">
              <label>分類 {manualCat == null && matched ? '(自動)' : 'Category'}</label>
              <select value={category} onChange={(e) => onPickCategory(e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                {!categories.includes(category) && <option value={category}>{category}</option>}
                <option value={NEW_CAT}>＋ 新增分類…</option>
              </select>
            </div>
          )}
          <div className="field">
            <label>日期 Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="switch-row" style={{ marginBottom: 10 }}>
          <span>這筆不分享給對方 🔒</span>
          <span className="switch">
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
            <span className="knob" />
          </span>
        </div>

        <button className="btn" disabled={!valid || busy} onClick={save}>記 一 筆</button>
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

      <div className="section-head" style={{ marginTop: 22 }}>
        <span className="en">Recent</span>
        <span className="kicker">最近五筆</span>
      </div>
      {txs === null ? <div className="empty">載入中…</div> : <TxList list={recent} />}
    </div>
  )
}
