import { useMemo, useState } from 'react'
import { addTransaction } from '../data/transactions'
import { matchCategory } from '../data/rules'
import { fmtMoney } from '../data/format'
import CategoryGrid from './CategoryGrid'
import Keypad from './Keypad'

// 快速記帳底部面板:金額鍵盤 + 分類圖示網格,點「完成」即存
export default function AddSheet({ userId, rules, categories, meta, defaultDate, onSaved, onClose }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [manualCat, setManualCat] = useState(null)
  const [direction, setDirection] = useState('iOwe')
  const [counterparty, setCounterparty] = useState('')
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)

  // 關鍵字自動分類:預先選好,點其他圖示即可覆蓋
  const matched = useMemo(() => matchCategory(note, rules), [note, rules])
  const autoCat = matched?.category
  const category = manualCat ?? (type === 'income' ? '收入' : autoCat || '其他')
  const isDebt = type === 'debt'
  const valid = Number(amount) > 0 && date && (!isDebt || counterparty.trim())

  async function save() {
    if (!valid || busy) return
    setBusy(true)
    await addTransaction({
      userId,
      type,
      category: isDebt ? '借貸' : category,
      amount: Number(amount),
      date,
      note: note.trim(),
      shareLevel: hidden ? 'hidden' : 'all',
      debtInfo: isDebt
        ? { direction, counterparty: counterparty.trim(), status: 'unpaid', paidDate: null }
        : null,
    })
    // 回報給首頁:顯示 toast 與「新增規則?」提示
    onSaved({
      toast: `已記一筆${isDebt ? '借貸' : category} ${fmtMoney(Number(amount))} 元`,
      rulePrompt: !isDebt && !matched && note.trim()
        ? { keyword: note.trim(), category }
        : null,
    })
  }

  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet add-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="seg" style={{ marginBottom: 12 }}>
          <button className={type === 'expense' ? 'on' : ''} onClick={() => setType('expense')}>支出</button>
          <button className={type === 'income' ? 'on' : ''} onClick={() => setType('income')}>收入</button>
          <button className={type === 'debt' ? 'on' : ''} onClick={() => setType('debt')}>借貸</button>
        </div>

        <div className="amount-display">
          <span className="cur">$</span>
          <span className="num">{amount || '0'}</span>
        </div>

        <div className="row2" style={{ marginBottom: 10 }}>
          <input value={note} placeholder={isDebt ? '備註(選填)' : '品項/店名,例:中油'}
            onChange={(e) => setNote(e.target.value)} />
          <input type="date" value={date} style={{ maxWidth: 150 }}
            onChange={(e) => setDate(e.target.value)} />
        </div>

        {isDebt ? (
          <>
            <div className="seg" style={{ marginBottom: 10 }}>
              <button className={direction === 'iOwe' ? 'on' : ''} onClick={() => setDirection('iOwe')}>我欠別人</button>
              <button className={direction === 'owedToMe' ? 'on' : ''} onClick={() => setDirection('owedToMe')}>別人欠我</button>
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <input value={counterparty} placeholder="對象,例:小明"
                onChange={(e) => setCounterparty(e.target.value)} />
            </div>
          </>
        ) : (
          <CategoryGrid
            categories={type === 'income' ? ['收入', ...categories] : categories}
            meta={meta}
            value={category}
            autoTag={manualCat == null ? autoCat : null}
            onChange={setManualCat}
            userId={userId}
          />
        )}

        <div className="switch-row" style={{ margin: '4px 0 8px' }}>
          <span style={{ fontSize: 13 }}>這筆不分享給對方 🔒</span>
          <span className="switch">
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
            <span className="knob" />
          </span>
        </div>

        <Keypad value={amount} onChange={setAmount} onDone={save} doneDisabled={!valid || busy} />
      </div>
    </div>
  )
}
