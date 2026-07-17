import {
  addDoc, collection, doc, getDoc, getDocs, limit, onSnapshot,
  query, serverTimestamp, updateDoc, where, arrayUnion, writeBatch,
} from 'firebase/firestore'
import { db, COL } from '../firebase/config'
import { DEFAULT_CATEGORIES, SEED_RULES } from './constants'

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉易混淆的 I O 0 1
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createUser(name) {
  const code = genCode()
  const ref = await addDoc(collection(db, COL.users), {
    name,
    code,
    categories: DEFAULT_CATEGORIES,
    createdAt: serverTimestamp(),
  })
  // 起手式分類規則
  const batch = writeBatch(db)
  for (const rule of SEED_RULES) {
    batch.set(doc(collection(db, COL.categoryRules)), { ...rule, userId: ref.id })
  }
  await batch.commit()
  return { userId: ref.id, name, code }
}

export async function findUserByCode(code) {
  const snap = await getDocs(query(
    collection(db, COL.users),
    where('code', '==', code.trim().toUpperCase()),
    limit(1),
  ))
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function getUser(userId) {
  const snap = await getDoc(doc(db, COL.users, userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function subscribeUser(userId, cb) {
  return onSnapshot(doc(db, COL.users, userId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  }, (err) => {
    console.error('subscribeUser:', err)
    cb(null)
  })
}

export async function addCategory(userId, name) {
  await updateDoc(doc(db, COL.users, userId), { categories: arrayUnion(name) })
}

// 自訂「收入」分類(存 money_users.incomeCategories,與支出分類分開)
export async function addIncomeCategory(userId, name) {
  await updateDoc(doc(db, COL.users, userId), { incomeCategories: arrayUnion(name) })
}

// 儲存分類的圖示與顏色(money_users.categoryMeta.<分類名>)
export async function saveCategoryMeta(userId, name, meta) {
  await updateDoc(doc(db, COL.users, userId), { [`categoryMeta.${name}`]: meta })
}
