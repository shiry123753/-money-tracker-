import { useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import {
  subscribeSharesByOwner, subscribeSharesByViewer,
  createShare, acceptShare, updateShareLevel, removeShare,
} from '../data/share'
import { SHARE_LEVEL_LABEL } from '../data/constants'

export default function SharePage() {
  const session = useSession()
  const [outgoing, setOutgoing] = useState([]) // 我分享出去的
  const [incoming, setIncoming] = useState([]) // 別人分享給我的
  const [code, setCode] = useState('')
  const [level, setLevel] = useState('expense_only')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { ok, text }

  useEffect(() => subscribeSharesByOwner(session.userId, setOutgoing), [session.userId])
  useEffect(() => subscribeSharesByViewer(session.userId, setIncoming), [session.userId])

  async function invite() {
    if (!code.trim() || busy) return
    setBusy(true)
    setMsg(null)
    try {
      const viewer = await createShare(session, code, level)
      setMsg({ ok: true, text: `已邀請 ${viewer.name},等對方在這頁按「接受」後生效。` })
      setCode('')
    } catch (e) {
      setMsg({ ok: false, text: e.message || '邀請失敗' })
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="section-head">
        <span className="en">Share</span>
        <span className="kicker">帳本分享</span>
      </div>

      <div className="card">
        <div className="kicker" style={{ marginBottom: 6 }}>My Code 我的加入碼</div>
        <div className="code-box">{session.code}</div>
        <p className="muted" style={{ marginTop: 8 }}>
          把這組碼給對方,對方就能邀請你看他的帳本;要分享你的帳本,則在下面輸入「對方的」加入碼。
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 10 }}>把我的帳本分享給對方</h2>
        <div className="field">
          <label>對方的加入碼 Code</label>
          <input value={code} placeholder="例如:AB3K9F" maxLength={6}
            style={{ textTransform: 'uppercase', letterSpacing: 4 }}
            onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="field">
          <label>權限層級 Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="expense_only">僅支出 — 只給支出資料</option>
            <option value="income_expense">收入＋支出 — 不含借貸</option>
            <option value="all">全部 — 所有交易(含借貸)</option>
          </select>
        </div>
        <button className="btn" disabled={!code.trim() || busy} onClick={invite}>送出邀請</button>
        {msg && <div className={`insight ${msg.ok ? 'good' : 'bad'}`}>{msg.text}</div>}
      </div>

      {incoming.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: 8 }}>分享給我的帳本</h2>
          {incoming.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
              <span style={{ flex: 1 }}>
                <b>{s.ownerName}</b>
                <span className="muted"> · {SHARE_LEVEL_LABEL[s.level]}</span>
              </span>
              {s.status === 'pending' ? (
                <>
                  <button className="btn sm" onClick={() => acceptShare(s.id)}>接受</button>
                  <button className="btn ghost sm" onClick={() => removeShare(s.id)}>拒絕</button>
                </>
              ) : (
                <span className="pill paid">已生效</span>
              )}
            </div>
          ))}
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: 8 }}>我分享出去的</h2>
          {outgoing.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
              <span style={{ flex: 1 }}>
                <b>{s.viewerName}</b>
                {s.status === 'pending' && <span className="pill unpaid" style={{ marginLeft: 6 }}>待接受</span>}
              </span>
              <select value={s.level} style={{ width: 128, flex: 'none', fontSize: 12.5 }}
                onChange={(e) => updateShareLevel(s.id, e.target.value)}>
                <option value="expense_only">僅支出</option>
                <option value="income_expense">收入＋支出</option>
                <option value="all">全部(含借貸)</option>
              </select>
              <button className="btn danger sm"
                onClick={() => window.confirm(`取消分享給 ${s.viewerName}?`) && removeShare(s.id)}>
                取消
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
