import { useState } from 'react'
import { setSession } from '../hooks/useSession'
import { createUser } from '../data/users'
import { BrushMark } from '../components/Layout'

export default function SetupScreen() {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    if (!name.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const user = await createUser(name.trim())
      setSession(user)
    } catch (e) {
      console.error(e)
      setError('建立失敗,請檢查網路後再試一次')
      setBusy(false)
    }
  }

  return (
    <div className="app" style={{ display: 'flex', alignItems: 'center', paddingBottom: 40 }}>
      <div className="card" style={{ width: '100%', padding: 28 }}>
        <BrushMark width={96} />
        <div className="kicker" style={{ margin: '14px 0 2px' }}>Personal Ledger</div>
        <h1 style={{ fontSize: 34, lineHeight: 1.1 }}>LEDGER</h1>
        <h2 style={{ fontSize: 17, marginBottom: 22 }}>記帳本 · 借貸追蹤</h2>

        <div className="field">
          <label>你的名字 Name</label>
          <input value={name} maxLength={10} autoFocus placeholder="輸入名字開始使用"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()} />
        </div>
        {error && <div className="insight bad">{error}</div>}
        <button className="btn" disabled={!name.trim() || busy} onClick={handleStart}>
          {busy ? '建立中…' : '開始記帳'}
        </button>
        <p className="muted" style={{ marginTop: 14 }}>
          建立後會產生你的專屬加入碼,之後可在「更多 → 分享設定」把帳本分享給另一個人查看。
        </p>

        <div className="footer-sig">
          <span style={{ display: 'flex', gap: 4 }}>
            <span className="badge">L</span><span className="capsule">2026</span>
          </span>
          <span className="barcode" />
        </div>
      </div>
    </div>
  )
}
