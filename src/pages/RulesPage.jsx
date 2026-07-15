import { useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useRules, useCategories } from '../hooks/useData'
import { addRule, updateRule, deleteRule } from '../data/rules'

export default function RulesPage() {
  const session = useSession()
  const rules = useRules(session.userId)
  const categories = useCategories(session.userId)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('其他')

  async function add() {
    if (!keyword.trim()) return
    await addRule(session.userId, keyword, category)
    setKeyword('')
  }

  return (
    <div>
      <div className="section-head">
        <span className="en">Rules</span>
        <span className="kicker">分類規則</span>
      </div>

      <div className="card">
        <p className="muted" style={{ marginBottom: 10 }}>
          記帳時只要「品項/店名」包含關鍵字,就會自動帶出對應分類。
        </p>
        <div className="row2">
          <div className="field">
            <label>關鍵字 Keyword</label>
            <input value={keyword} placeholder="例如:7-11"
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()} />
          </div>
          <div className="field">
            <label>分類 Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button className="btn" disabled={!keyword.trim()} onClick={add}>新增規則</button>
      </div>

      {rules.length === 0 && (
        <div className="empty"><span className="en">EMPTY</span>還沒有任何規則</div>
      )}
      {rules.map((r) => (
        <div className="tx-row" key={r.id} style={{ cursor: 'default' }}>
          <span className="note"><b>{r.keyword}</b></span>
          <select value={r.category} style={{ width: 110, flex: 'none' }}
            onChange={(e) => updateRule(r.id, { category: e.target.value })}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            {!categories.includes(r.category) && <option value={r.category}>{r.category}</option>}
          </select>
          <button className="btn danger sm" onClick={() => deleteRule(r.id)}>刪除</button>
        </div>
      ))}
    </div>
  )
}
