import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  query, updateDoc, where,
} from 'firebase/firestore'
import { db, COL } from '../firebase/config'

export function subscribeRules(userId, cb) {
  const q = query(collection(db, COL.categoryRules), where('userId', '==', userId))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.category.localeCompare(b.category, 'zh-TW')))
  }, (err) => {
    console.error('subscribeRules:', err)
    cb([])
  })
}

export async function addRule(userId, keyword, category) {
  await addDoc(collection(db, COL.categoryRules), { userId, keyword: keyword.trim(), category })
}

export async function updateRule(id, patch) {
  await updateDoc(doc(db, COL.categoryRules, id), patch)
}

export async function deleteRule(id) {
  await deleteDoc(doc(db, COL.categoryRules, id))
}

// 關鍵字比對:備註包含關鍵字即命中,多筆命中時取最長的關鍵字
export function matchCategory(note, rules) {
  const text = (note || '').toLowerCase()
  if (!text) return null
  let best = null
  for (const r of rules) {
    const kw = r.keyword.toLowerCase()
    if (kw && text.includes(kw) && (!best || kw.length > best.keyword.length)) best = r
  }
  return best // { keyword, category } 或 null
}
