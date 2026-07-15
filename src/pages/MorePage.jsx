import { Link } from 'react-router-dom'
import { useSession, clearSession } from '../hooks/useSession'

export default function MorePage() {
  const session = useSession()

  function logout() {
    if (window.confirm('確定要登出嗎?資料都在雲端,重新輸入名字會建立「新帳本」而不是回到現在這本。')) {
      clearSession()
    }
  }

  return (
    <div>
      <div className="section-head">
        <span className="en">More</span>
        <span className="kicker">更多</span>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div className="kicker" style={{ marginBottom: 2 }}>Account 帳號</div>
        <h2 style={{ fontSize: 18 }}>{session.name}</h2>
        <div className="muted">我的加入碼:<b className="serif" style={{ letterSpacing: 3 }}>{session.code}</b></div>
      </div>

      <Link className="menu-link" to="/rules">
        <span>分類規則管理</span><span className="en">Rules</span>
      </Link>
      <Link className="menu-link" to="/share">
        <span>帳本分享設定</span><span className="en">Share</span>
      </Link>
      <Link className="menu-link" to="/partner">
        <span>查看對方的帳本</span><span className="en">Partner</span>
      </Link>

      <button className="btn ghost" style={{ marginTop: 14 }} onClick={logout}>登出</button>
    </div>
  )
}
