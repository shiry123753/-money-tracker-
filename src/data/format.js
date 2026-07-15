// 日期一律以 'YYYY-MM-DD' 字串儲存,可直接按字典序排序
export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function monthKey(dateStr) {
  return (dateStr || '').slice(0, 7) // 'YYYY-MM'
}

export function thisMonthKey() {
  return monthKey(todayStr())
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  const [y, m] = key.split('-')
  return `${y} 年 ${Number(m)} 月`
}

export function fmtMoney(n) {
  return Number(n || 0).toLocaleString('zh-TW')
}

export function dateLabel(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${Number(m)}/${Number(d)}`
}

export function weekdayLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
}
