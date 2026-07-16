import { getCategoryMeta } from '../data/categoryMeta'

// 圓底分類圖示;size 為外圈直徑
export default function CategoryIcon({ name, meta, size = 38, active = false }) {
  const { Icon, color } = getCategoryMeta(name, meta)
  return (
    <span
      className={`cat-icon${active ? ' on' : ''}`}
      style={{ width: size, height: size, background: color }}
    >
      <Icon size={size * 0.5} strokeWidth={2} />
    </span>
  )
}
