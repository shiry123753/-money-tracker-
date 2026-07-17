// 分類 → 圖示 + 顏色。顏色沿用簡約品牌風格色票(暖色調,不用彩虹色)。
// 自訂的對應存在 money_users.categoryMeta(額外欄位,不影響既有結構);
// 沒設定的分類用預設表,再沒有就以名稱雜湊穩定分配,保證同名同色。
import {
  Coffee, Utensils, Soup, Bus, Fuel, Package, HandCoins,
  ShoppingCart, ShoppingBag, Home, Heart, Pill, Shirt, Gamepad2, Gift,
  Smartphone, Wifi, Zap, Droplets, Car, Bike, Plane, Film, Music,
  BookOpen, GraduationCap, Dumbbell, PawPrint, Baby, Scissors,
  CreditCard, PiggyBank, Wallet, TrendingUp, Briefcase, CakeSlice,
  Banknote, Landmark,
} from 'lucide-react'

// 帳戶圖示(現金/銀行/信用卡)
export const ACCOUNT_ICONS = { 現金: Banknote, 銀行: Landmark, 信用卡: CreditCard }

// icon 庫(自訂分類可挑選);key 存進 Firestore,元件在這裡對回來
export const ICONS = {
  coffee: Coffee, utensils: Utensils, soup: Soup, bus: Bus, fuel: Fuel,
  package: Package, handcoins: HandCoins, cart: ShoppingCart, bag: ShoppingBag,
  home: Home, heart: Heart, pill: Pill, shirt: Shirt, game: Gamepad2,
  gift: Gift, phone: Smartphone, wifi: Wifi, zap: Zap, water: Droplets,
  car: Car, bike: Bike, plane: Plane, film: Film, music: Music,
  book: BookOpen, school: GraduationCap, gym: Dumbbell, pet: PawPrint,
  baby: Baby, salon: Scissors, card: CreditCard, piggy: PiggyBank,
  wallet: Wallet, invest: TrendingUp, work: Briefcase, cake: CakeSlice,
}

// 品牌色票(tonal ramp + 輔助色)
export const COLORS = [
  '#6E665B', '#B9A789', '#9C8E78', '#847A6B', '#C2B7A4', '#5E5A4E',
  '#A98C76', '#2A2520', '#B0825A', '#6E7257', '#8C8273', '#A6483C',
]

const DEFAULT_META = {
  早餐: { icon: 'coffee', color: '#B9A789' },
  午餐: { icon: 'utensils', color: '#9C8E78' },
  晚餐: { icon: 'soup', color: '#847A6B' },
  交通: { icon: 'bus', color: '#6E665B' },
  加油: { icon: 'fuel', color: '#5E5A4E' },
  其他: { icon: 'package', color: '#C2B7A4' },
  借貸: { icon: 'handcoins', color: '#B0825A' },
  收入: { icon: 'wallet', color: '#6E7257' },
  薪資: { icon: 'work', color: '#6E7257' },
  獎金: { icon: 'gift', color: '#B0825A' },
  爸媽的愛: { icon: 'heart', color: '#A98C76' },
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

// userMeta = money_users.categoryMeta(可為 undefined)
export function getCategoryMeta(name, userMeta) {
  const custom = userMeta?.[name]
  const fallback = DEFAULT_META[name]
  const iconKey = custom?.icon || fallback?.icon
  const keys = Object.keys(ICONS)
  return {
    Icon: ICONS[iconKey] || ICONS[keys[hash(name) % keys.length]],
    color: custom?.color || fallback?.color || COLORS[hash(name) % 8],
  }
}
