import { Delete } from 'lucide-react'

// 天天記帳式數字鍵盤:直接編輯金額字串,「完成」交給 onDone
// onChange 需支援 setState 的 updater 寫法,快速連點也不會吃字
export default function Keypad({ value, onChange, onDone, doneDisabled }) {
  function press(k) {
    onChange((v) => {
      if (k === 'del') return v.slice(0, -1)
      if (k === '.') return v.includes('.') ? v : (v || '0') + '.'
      if (v === '0') return k
      if (v.includes('.') && v.split('.')[1].length >= 2) return v // 最多兩位小數
      if (v.replace('.', '').length >= 9) return v
      return v + k
    })
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']
  return (
    <div className="keypad">
      <div className="keypad-keys">
        {keys.map((k) => (
          <button key={k} type="button" className="key" onClick={() => press(k)}>
            {k === 'del' ? <Delete size={20} /> : k}
          </button>
        ))}
      </div>
      <button type="button" className="key done" disabled={doneDisabled} onClick={onDone}>
        完成
      </button>
    </div>
  )
}
