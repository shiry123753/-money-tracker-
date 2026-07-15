import { useMemo, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useTransactions } from '../hooks/useData'
import { updateTransaction, deleteTransaction } from '../data/transactions'
import { fmtMoney, todayStr, dateLabel } from '../data/format'

export default function DebtsPage() {
  const session = useSession()
  const txs = useTransactions(session.userId)
  const [showPaid, setShowPaid] = useState(false)

  const debts = useMemo(() => (txs || []).filter((t) => t.type === 'debt'), [txs])

  // 依對象分組;淨額 = 別人欠我(未還) − 我欠別人(未還)
  const groups = useMemo(() => {
    const map = new Map()
    for (const t of debts) {
      const name = t.debtInfo?.counterparty || '(未填對象)'
      if (!map.has(name)) map.set(name, { name, net: 0, items: [] })
      const g = map.get(name)
      g.items.push(t)
      if (t.debtInfo?.status !== 'paid') {
        g.net += t.debtInfo?.direction === 'owedToMe' ? t.amount : -t.amount
      }
    }
    return [...map.values()].sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
  }, [debts])

  const totalOwedToMe = groups.reduce((s, g) => s + Math.max(0, g.net), 0)
  const totalIOwe = groups.reduce((s, g) => s + Math.max(0, -g.net), 0)

  async function markPaid(t) {
    await updateTransaction(t.id, {
      debtInfo: { ...t.debtInfo, status: 'paid', paidDate: todayStr() },
    })
  }
  async function markUnpaid(t) {
    await updateTransaction(t.id, {
      debtInfo: { ...t.debtInfo, status: 'unpaid', paidDate: null },
    })
  }
  async function remove(t) {
    if (!window.confirm('確定要刪除這筆借貸紀錄嗎?(已還清的紀錄也可以選擇保留當歷史)')) return
    await deleteTransaction(t.id)
  }

  return (
    <div>
      <div className="section-head">
        <span className="en">Debts</span>
        <span className="kicker">借貸總覽</span>
      </div>

      <div className="kpi-row" style={{ marginBottom: 12 }}>
        <div className="kpi">
          <div className="kpi-label">Owed to Me 別人欠我</div>
          <div className="kpi-value">{fmtMoney(totalOwedToMe)}</div>
        </div>
        <div className="kpi ink">
          <div className="kpi-label">I Owe 我欠別人</div>
          <div className="kpi-value">{fmtMoney(totalIOwe)}</div>
        </div>
      </div>

      <div className="switch-row" style={{ marginBottom: 8 }}>
        <span>顯示已還清的歷史紀錄</span>
        <span className="switch">
          <input type="checkbox" checked={showPaid} onChange={(e) => setShowPaid(e.target.checked)} />
          <span className="knob" />
        </span>
      </div>

      {txs === null && <div className="empty">載入中…</div>}
      {txs !== null && groups.length === 0 && (
        <div className="empty"><span className="en">ALL CLEAR</span>目前沒有借貸紀錄</div>
      )}

      {groups.map((g) => {
        const items = g.items.filter((t) => showPaid || t.debtInfo?.status !== 'paid')
        if (!items.length) return null
        return (
          <div className="card" key={g.name} style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h2 style={{ fontSize: 17 }}>{g.name}</h2>
              <span className="kpi-value" style={{ fontSize: 18, color: g.net > 0 ? 'var(--good)' : g.net < 0 ? 'var(--bad)' : 'var(--mut)' }}>
                {g.net === 0 ? '已結清' : g.net > 0 ? `欠我 ${fmtMoney(g.net)}` : `我欠 ${fmtMoney(-g.net)}`}
              </span>
            </div>
            {items.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: '1px solid var(--line)', fontSize: 13.5 }}>
                <span className="muted" style={{ width: 40 }}>{dateLabel(t.date)}</span>
                <span style={{ flex: 1 }}>
                  {t.debtInfo?.direction === 'owedToMe' ? '欠我' : '我欠'} {fmtMoney(t.amount)}
                  {t.note && <span className="muted"> · {t.note}</span>}
                  {t.debtInfo?.status === 'paid' && (
                    <span className="muted"> · {t.debtInfo.paidDate} 還清</span>
                  )}
                </span>
                {t.debtInfo?.status === 'paid' ? (
                  <>
                    <span className="pill paid">已還</span>
                    <button className="btn ghost sm" onClick={() => markUnpaid(t)}>復原</button>
                    <button className="btn danger sm" onClick={() => remove(t)}>刪除</button>
                  </>
                ) : (
                  <button className="btn sm" onClick={() => markPaid(t)}>標記已還</button>
                )}
              </div>
            ))}
          </div>
        )
      })}

      <p className="muted" style={{ marginTop: 4 }}>
        借貸金額不會計入一般收支統計;要記新的借貸請到「記帳 → 借貸」。
      </p>
    </div>
  )
}
