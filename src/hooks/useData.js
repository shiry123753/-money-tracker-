import { useEffect, useState } from 'react'
import { subscribeTransactions } from '../data/transactions'
import { subscribeRules } from '../data/rules'
import { subscribeUser } from '../data/users'
import { DEFAULT_CATEGORIES } from '../data/constants'

export function useTransactions(userId) {
  const [list, setList] = useState(null) // null = 載入中
  useEffect(() => {
    if (!userId) return undefined
    return subscribeTransactions(userId, setList)
  }, [userId])
  return list
}

export function useRules(userId) {
  const [rules, setRules] = useState([])
  useEffect(() => {
    if (!userId) return undefined
    return subscribeRules(userId, setRules)
  }, [userId])
  return rules
}

export function useCategories(userId) {
  const [cats, setCats] = useState(DEFAULT_CATEGORIES)
  useEffect(() => {
    if (!userId) return undefined
    return subscribeUser(userId, (u) => {
      if (u?.categories?.length) setCats(u.categories)
    })
  }, [userId])
  return cats
}

// 分類 + 自訂圖示/顏色對應(money_users.categoryMeta)
export function useCategoryMeta(userId) {
  const [state, setState] = useState({ categories: DEFAULT_CATEGORIES, categoryMeta: {} })
  useEffect(() => {
    if (!userId) return undefined
    return subscribeUser(userId, (u) => {
      if (u) setState({
        categories: u.categories?.length ? u.categories : DEFAULT_CATEGORIES,
        categoryMeta: u.categoryMeta || {},
      })
    })
  }, [userId])
  return state
}
