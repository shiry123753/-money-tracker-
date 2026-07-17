import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import CategoryIcon from './CategoryIcon'
import { ICONS, COLORS } from '../data/categoryMeta'
import { addCategory, addIncomeCategory, saveCategoryMeta } from '../data/users'

// 分類圖示網格:一次顯示全部分類,點選切換;可新增自訂分類(挑圖示+顏色)
// kind='income' 時新增的分類存到收入分類清單
export default function CategoryGrid({ categories, meta, value, onChange, userId, autoTag, kind = 'expense' }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('cart')
  const [color, setColor] = useState(COLORS[0])
  const [busy, setBusy] = useState(false)

  async function createCategory() {
    const n = name.trim()
    if (!n || busy) return
    setBusy(true)
    if (!categories.includes(n)) {
      await (kind === 'income' ? addIncomeCategory(userId, n) : addCategory(userId, n))
    }
    await saveCategoryMeta(userId, n, { icon, color })
    onChange(n)
    setAdding(false)
    setName('')
    setBusy(false)
  }

  return (
    <div>
      <div className="cat-grid">
        {categories.map((c) => (
          <button key={c} type="button"
            className={`cat-cell${value === c ? ' on' : ''}`}
            onClick={() => onChange(c)}>
            <CategoryIcon name={c} meta={meta} active={value === c} />
            <span className="cat-name">
              {c}
              {autoTag === c && <em className="auto-tag">自動</em>}
            </span>
          </button>
        ))}
        {userId && (
          <button type="button" className="cat-cell" onClick={() => setAdding(!adding)}>
            <span className="cat-icon add"><Plus size={19} /></span>
            <span className="cat-name">新增</span>
          </button>
        )}
      </div>

      {adding && (
        <div className="cat-creator">
          <div className="field">
            <label>分類名稱 Name</label>
            <input value={name} maxLength={6} placeholder="例如:娛樂" autoFocus
              onChange={(e) => setName(e.target.value)} />
          </div>
          <label className="kicker" style={{ display: 'block', marginBottom: 5 }}>挑個圖示 Icon</label>
          <div className="icon-lib">
            {Object.entries(ICONS).map(([key, Ic]) => (
              <button key={key} type="button"
                className={`icon-pick${icon === key ? ' on' : ''}`}
                onClick={() => setIcon(key)}>
                <Ic size={17} />
              </button>
            ))}
          </div>
          <label className="kicker" style={{ display: 'block', margin: '10px 0 5px' }}>顏色 Colour</label>
          <div className="color-row">
            {COLORS.map((c) => (
              <button key={c} type="button"
                className={`color-pick${color === c ? ' on' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}>
                {color === c && <Check size={13} color="#F4EFE6" />}
              </button>
            ))}
          </div>
          <div className="row2" style={{ marginTop: 12 }}>
            <button type="button" className="btn sm" disabled={!name.trim() || busy}
              onClick={createCategory}>建立分類</button>
            <button type="button" className="btn ghost sm" onClick={() => setAdding(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
