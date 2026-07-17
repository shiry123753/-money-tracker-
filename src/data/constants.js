export const DEFAULT_CATEGORIES = ['早餐', '午餐', '晚餐', '交通', '加油', '其他']

// 收入專用分類(與支出分類分開)
export const INCOME_CATEGORIES = ['薪資', '獎金', '爸媽的愛']

// 帳戶選項
export const ACCOUNTS = ['現金', '銀行', '信用卡']

// 新帳號的起手式規則,之後可在「分類規則」頁自行增刪
export const SEED_RULES = [
  { keyword: '中油', category: '加油' },
  { keyword: '加油', category: '加油' },
  { keyword: '捷運', category: '交通' },
  { keyword: '公車', category: '交通' },
  { keyword: '高鐵', category: '交通' },
  { keyword: '台鐵', category: '交通' },
  { keyword: 'Uber', category: '交通' },
]

export const TYPE_LABEL = { income: '收入', expense: '支出', debt: '借貸' }

export const SHARE_LEVEL_LABEL = {
  all: '全部（含借貸）',
  income_expense: '收入＋支出',
  expense_only: '僅支出',
}

export const TX_SHARE_LABEL = {
  all: '可分享',
  expense_only: '僅支出可見',
  hidden: '不分享',
}
