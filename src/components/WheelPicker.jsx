import { useEffect, useLayoutEffect, useRef } from 'react'

export const WHEEL_ITEM_H = 40

// iOS 風格滾輪(CSS scroll-snap 輕量版):上下滑動,停在中間高亮格即選中
export default function WheelPicker({ items, value, onChange, format }) {
  const ref = useRef(null)
  const timer = useRef(null)
  const latest = useRef({ items, onChange })
  latest.current = { items, onChange }

  // 開啟時捲到目前選中的值(不帶動畫);之後由捲動主導,不再反向同步
  const initial = useRef(value)
  useLayoutEffect(() => {
    const idx = items.indexOf(initial.current)
    if (idx >= 0) ref.current.scrollTop = idx * WHEEL_ITEM_H
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 用原生 scroll 事件(passive),捲動停止後把中間格回報給父層
  useEffect(() => {
    const el = ref.current
    const onScroll = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        const { items: its, onChange: cb } = latest.current
        const idx = Math.max(0, Math.min(its.length - 1,
          Math.round(el.scrollTop / WHEEL_ITEM_H)))
        cb(its[idx])
      }, 110)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      clearTimeout(timer.current)
    }
  }, [])

  function tap(it) {
    onChange(it)
    ref.current.scrollTo({ top: items.indexOf(it) * WHEEL_ITEM_H, behavior: 'smooth' })
  }

  return (
    <div className="wheel" ref={ref}>
      <div className="wheel-pad" />
      {items.map((it) => (
        <div key={it} className={`wheel-item${it === value ? ' on' : ''}`} onClick={() => tap(it)}>
          {format ? format(it) : it}
        </div>
      ))}
      <div className="wheel-pad" />
    </div>
  )
}
