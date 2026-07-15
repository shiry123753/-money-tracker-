import { useState } from 'react'
import { updateTransaction, deleteTransaction } from '../data/transactions'
import { TX_SHARE_LABEL } from '../data/constants'

// 編輯既有交易的底部面板（點清單列開啟）
export default function TxEditor({ tx, categories, onClose }) {
  const [amount, setAmount] = useState(String(tx.amount))
  const [note, setNote] = useState(tx.note || '')
  const [date, setDate] = useState(tx.date)
  const [category, setCategory] = useState(tx.category)
  const [shareLevel, setShareLevel] = useState(tx.shareLevel || 'all')
  const [counterparty, setCounterparty] = useState(tx.debtInfo?.counterparty || '')
  const [direction, setDirection] = useState(tx.debtInfo?.direction || 'iOwe')
  const [busy, setBusy] = useState(false)

  const isDebt = tx.type === 'debt'
  const valid = Number(amount) > 0 && date && (!isDebt || counterparty.trim())

  async function save() {
    setBusy(true)
    const patch = { amount: Number(amount), note: note.trim(), date, shareLevel }
    if (isDebt) {
      patch.debtInfo = { ...tx.debtInfo, counterparty: counterparty.trim(), direction }
    } else {
      patch.category = category
    }
    await updateTransaction(tx.id, patch)
    onClose()
  }

  async function remove() {
    if (!window.confirm('確定要刪除這筆紀錄嗎?')) return
    setBusy(true)
    await deleteTransaction(tx.id)
    onClose()
  }

  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>編輯{isDebt ? '借貸' : tx.type === 'income' ? '收入' : '支出'}</h2>

        <div className="field amount-input">
          <label>金額 Amount</label>
          <input type="number" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value)} />
        </div>

        {isDebt ? (
          <>
            <div className="field">
              <label>方向 Direction</label>
              <div className="seg">
                <button type="button" className={direction === 'iOwe' ? 'on' : ''}
                  onClick={() => setDirection('iOwe')}>我欠別人</button>
                <button type="button" className={direction === 'owedToMe' ? 'on' : ''}
                  onClick={() => setDirection('owedToMe')}>別人欠我</button>
              </div>
            </div>
            <div className="field">
              <label>對象 Counterparty</label>
              <input value={counterparty} onChange={(e) => setCounterparty(e.target.value)} />
            </div>
          </>
        ) : (
          <div className="field">
            <label>分類 Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div className="row2">
          <div className="field">
            <label>日期 Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>分享 Visibility</label>
            <select value={shareLevel} onChange={(e) => setShareLevel(e.target.value)}>
              {Object.entries(TX_SHARE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>備註 Note</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="店名/品項" />
        </div>

        <button className="btn" disabled={!valid || busy} onClick={save}>儲 存</button>
        <div style={{ height: 8 }} />
        <div className="row2">
          <button className="btn ghost sm" onClick={onClose} disabled={busy}>取消</button>
          <button className="btn danger sm" onClick={remove} disabled={busy}>刪除這筆</button>
        </div>
      </div>
    </div>
  )
}
