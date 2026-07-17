// 記帳金額的小算式引擎:支援 + − × ÷,先乘除後加減
export const OPS = ['+', '-', '×', '÷']
export const isOp = (c) => OPS.includes(c)

// 計算「45+20×2」這類算式;算不出來回傳 NaN
export function evalExpr(expr) {
  if (!expr) return 0
  const tokens = expr.match(/[0-9.]+|[+\-×÷]/g) || []
  while (tokens.length && isOp(tokens[tokens.length - 1])) tokens.pop()
  if (!tokens.length) return 0
  // 先乘除
  const flat = [Number(tokens[0])]
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const n = Number(tokens[i + 1])
    if (op === '×') flat[flat.length - 1] *= n
    else if (op === '÷') flat[flat.length - 1] /= n
    else flat.push(op === '-' ? -n : n)
  }
  const sum = flat.reduce((s, n) => s + n, 0)
  return Math.round(sum * 100) / 100
}

// 是否還有沒算完的運算(有 → 「完成」鍵先變「=」)
export function hasPendingOp(expr) {
  return OPS.some((op) => expr.slice(0, -1).includes(op) || expr.endsWith(op))
}
