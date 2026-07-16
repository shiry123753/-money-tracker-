import { Fragment } from 'react'
import { fmtMoney, dateLabel, weekdayLabel } from '../data/format'
import CategoryIcon from './CategoryIcon'

function rowMeta(tx) {
  if (tx.type === 'debt') {
    const d = tx.debtInfo || {}
    const dir = d.direction === 'iOwe' ? `我欠 ${d.counterparty}` : `${d.counterparty} 欠我`
    return {
      cat: '借貸',
      sub: `${dir}${d.status === 'paid' ? ' · 已還清' : ''}`,
      amtClass: 'debt',
      sign: '',
    }
  }
  if (tx.type === 'income') return { cat: tx.category, sub: '', amtClass: 'income', sign: '+' }
  return { cat: tx.category, sub: '', amtClass: '', sign: '−' }
}

// 依日期分組的交易清單;onSelect 省略時為唯讀
export default function TxList({ list, meta, onSelect, showDateHead = true }) {
  if (!list.length) {
    return <div className="empty"><span className="en">EMPTY</span>沒有符合的紀錄</div>
  }
  let lastDate = null
  return (
    <div>
      {list.map((tx) => {
        const m = rowMeta(tx)
        const head = showDateHead && tx.date !== lastDate && (
          <div className="tx-date-head" key={`h-${tx.date}`}>
            {dateLabel(tx.date)}
            <span className="wd">週{weekdayLabel(tx.date)}</span>
          </div>
        )
        lastDate = tx.date
        return (
          <Fragment key={tx.id}>
            {head}
            <div className="tx-row" onClick={onSelect ? () => onSelect(tx) : undefined}
              style={onSelect ? undefined : { cursor: 'default' }}>
              <CategoryIcon name={m.cat} meta={meta} size={34} />
              <span className="note">
                {tx.note || m.cat}
                <span className="sub">
                  {m.cat}
                  {m.sub && ` · ${m.sub}`}
                  {tx.shareLevel === 'hidden' && ' · 🔒 不分享'}
                </span>
              </span>
              <span className={`amt ${m.amtClass}`}>{m.sign}{fmtMoney(tx.amount)}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
