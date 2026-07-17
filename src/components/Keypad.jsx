import { Delete } from 'lucide-react'
import { isOp, evalExpr, hasPendingOp } from '../data/calc'

// 天天記帳式計算機鍵盤;onChange 需支援 setState 的 updater 寫法
export default function Keypad({ value, onChange, onDone, doneDisabled }) {
  const pending = hasPendingOp(value)

  function press(k) {
    onChange((v) => {
      if (k === 'del') return v.slice(0, -1)
      if (isOp(k)) {
        if (!v) return v
        if (isOp(v.at(-1))) return v.slice(0, -1) + k // 連按運算子 → 換成新的
        if (v.at(-1) === '.') return v
        return v + k
      }
      const seg = v.split(/[+\-×÷]/).pop() // 目前輸入中的數字
      if (k === '.') {
        if (seg.includes('.')) return v
        return v + (seg === '' ? '0.' : '.')
      }
      if (seg === '0') return v.slice(0, -1) + k
      if (seg.includes('.') && seg.split('.')[1].length >= 2) return v // 最多兩位小數
      if (seg.replace('.', '').length >= 9) return v
      return v + k
    })
  }

  function equals() {
    onChange((v) => {
      const r = evalExpr(v)
      return Number.isFinite(r) ? String(r) : ''
    })
  }

  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '.', '0', 'del', '+']
  return (
    <div className="keypad">
      <div className="keypad-keys four">
        {keys.map((k) => (
          <button key={k} type="button" className={`key${isOp(k) ? ' op' : ''}`}
            onClick={() => press(k)}>
            {k === 'del' ? <Delete size={20} /> : k === '-' ? '−' : k}
          </button>
        ))}
      </div>
      <button type="button" className={`key done${pending ? ' eq' : ''}`}
        disabled={!pending && doneDisabled}
        onClick={pending ? equals : onDone}>
        {pending ? '=' : '完成'}
      </button>
    </div>
  )
}
