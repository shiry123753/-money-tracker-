import { useLayoutEffect, useRef } from 'react'
import CalendarView from './CalendarView'
import { shiftMonth } from '../data/format'

// 可滑動的月曆輪播:同時渲染上月/本月/下月三格,拖曳時只動 transform(跟手),
// 放開超過門檻才播過場動畫並 commit 月份;月份 state 與 ‹ › 按鈕共用。
export default function MonthCarousel({ month, dayStats, selected, onSelect, onMonthChange }) {
  const wrapRef = useRef(null)
  const trackRef = useRef(null)
  const drag = useRef(null)      // 進行中的拖曳
  const settling = useRef(false) // 過場動畫播放中,忽略新的拖曳
  const suppressClick = useRef(false)

  // 月份 commit 後(滑動結算或按 ‹ ›),軌道瞬間歸位到中間格,銜接無跳動
  useLayoutEffect(() => {
    const track = trackRef.current
    track.style.transition = 'none'
    track.style.transform = 'translate3d(-33.3333%,0,0)'
    settling.current = false
  }, [month])

  function setX(dx, animate) {
    const track = trackRef.current
    const w = wrapRef.current.clientWidth
    track.style.transition = animate ? 'transform .28s cubic-bezier(.22,.61,.36,1)' : 'none'
    track.style.transform = `translate3d(${-w + dx}px,0,0)`
  }

  function onPointerDown(e) {
    if (settling.current) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, axis: null, id: e.pointerId }
  }

  function onPointerMove(e) {
    const d = drag.current
    if (!d || settling.current) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y' // 垂直意圖交還給頁面捲動
      if (d.axis === 'x') {
        try { wrapRef.current.setPointerCapture(d.id) } catch { /* 合成事件沒有有效 pointerId */ }
      }
    }
    if (d.axis === 'x') setX(dx, false)
  }

  function onPointerUp(e) {
    const d = drag.current
    drag.current = null
    if (!d || d.axis !== 'x') return
    suppressClick.current = true // 拖過就不要觸發日期格的點擊
    const dx = e.clientX - d.x
    const w = wrapRef.current.clientWidth
    if (Math.abs(dx) > Math.max(50, w / 4)) {
      settling.current = true
      const dir = dx > 0 ? -1 : 1 // 往右滑=上個月,往左滑=下個月
      setX(dx > 0 ? w : -w, true)
      setTimeout(() => onMonthChange(dir), 290) // commit → useLayoutEffect 歸位
    } else {
      setX(0, true) // 未過門檻,平滑彈回
    }
  }

  function onClickCapture(e) {
    if (suppressClick.current) {
      suppressClick.current = false
      e.stopPropagation()
      e.preventDefault()
    }
  }

  const months = [shiftMonth(month, -1), month, shiftMonth(month, 1)]
  return (
    <div className="cal-carousel" ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}>
      <div className="cal-track" ref={trackRef}>
        {months.map((m) => (
          <div className="cal-pane" key={m}>
            <CalendarView monthKey={m} dayStats={dayStats}
              selected={m === month ? selected : null}
              onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  )
}
