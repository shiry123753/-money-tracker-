import { Fragment } from 'react'
import { fmtMoney, dateLabel, weekdayLabel } from '../data/format'

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
export default function TxList({ list, onSelect }) {
  if (!list.length) {
    return <div className="empty"><span className="en">EMPTY</span>沒有符合的紀錄</div>
  }
  let lastDate = null
  return (
    <div>
      {list.map((tx) => {
        const meta = rowMeta(tx)
        const head = tx.date !== lastDate && (
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
              <span className="cat">{meta.cat}</span>
              <span className="note">
                {tx.note || '—'}
                {meta.sub && <span className="sub">{meta.sub}</span>}
                {tx.shareLevel === 'hidden' && <span className="sub">🔒 不分享</span>}
              </span>
              <span className={`amt ${meta.amtClass}`}>{meta.sign}{fmtMoney(tx.amount)}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
