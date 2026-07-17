import { useMemo, useState } from 'react'
import { addTransaction } from '../data/transactions'
import { matchCategory } from '../data/rules'
import { fmtMoney } from '../data/format'
import { ACCOUNTS } from '../data/constants'
import { ACCOUNT_ICONS } from '../data/categoryMeta'
import CategoryGrid from './CategoryGrid'
import Keypad from './Keypad'
import { evalExpr, hasPendingOp } from '../data/calc'

// 快速記帳底部面板:計算機鍵盤 + 分類圖示網格 + 帳戶,點「完成」即存
export default function AddSheet({ userId, rules, categories, incomeCategories, meta, defaultDate, onSaved, onClose }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('') // 可含 +−×÷ 的算式字串
  const [note, setNote] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [manualCat, setManualCat] = useState(null)
  const [account, setAccount] = useState(ACCOUNTS[0])
  const [direction, setDirection] = useState('iOwe')
  const [counterparty, setCounterparty] = useState('')
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)

  // 關鍵字自動分類:預先選好,點其他圖示即可覆蓋
  const matched = useMemo(() => matchCategory(note, rules), [note, rules])
  const autoCat = matched?.category
  const isDebt = type === 'debt'
  const isIncome = type === 'income'
  const category = manualCat ?? (isIncome ? incomeCategories[0] : autoCat || '其他')

  const result = evalExpr(amount)
  const pending = hasPendingOp(amount)
  const valid = Number.isFinite(result) && result > 0 && date && (!isDebt || counterparty.trim())

  function switchType(t) {
    setType(t)
    setManualCat(null) // 切換收支時分類重新預設
  }

  async function save() {
    if (!valid || busy) return
    setBusy(true)
    await addTransaction({
      userId,
      type,
      category: isDebt ? '借貸' : category,
      amount: result,
      date,
      note: note.trim(),
      account,
      shareLevel: hidden ? 'hidden' : 'all',
      debtInfo: isDebt
        ? { direction, counterparty: counterparty.trim(), status: 'unpaid', paidDate: null }
        : null,
    })
    // 回報給首頁:顯示 toast 與「新增規則?」提示
    onSaved({
      toast: `已記一筆${isDebt ? '借貸' : category} ${fmtMoney(result)} 元`,
      rulePrompt: type === 'expense' && !matched && note.trim()
        ? { keyword: note.trim(), category }
        : null,
    })
  }

  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet add-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="seg" style={{ marginBottom: 12 }}>
          <button className={type === 'expense' ? 'on' : ''} onClick={() => switchType('expense')}>支出</button>
          <button className={type === 'income' ? 'on' : ''} onClick={() => switchType('income')}>收入</button>
          <button className={type === 'debt' ? 'on' : ''} onClick={() => switchType('debt')}>借貸</button>
        </div>

        <div className="amount-display">
          {pending && Number.isFinite(result) && (
            <span className="eq-hint">= {fmtMoney(result)}</span>
          )}
          <span className="cur">$</span>
          <span className="num" style={{ fontSize: amount.length > 9 ? 28 : 40 }}>
            {amount || '0'}
          </span>
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
            categories={isIncome ? incomeCategories : categories}
            kind={isIncome ? 'income' : 'expense'}
            meta={meta}
            value={category}
            autoTag={!isIncome && manualCat == null ? autoCat : null}
            onChange={setManualCat}
            userId={userId}
          />
        )}

        <div className="acct-row">
          {ACCOUNTS.map((a) => {
            const Icon = ACCOUNT_ICONS[a]
            return (
              <button key={a} type="button"
                className={`acct-pill${account === a ? ' on' : ''}`}
                onClick={() => setAccount(a)}>
                <Icon size={14} />{a}
              </button>
            )
          })}
        </div>

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
