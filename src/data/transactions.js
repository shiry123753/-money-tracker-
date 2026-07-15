import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot,
  query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore'
import { db, COL } from '../firebase/config'

function sortByDateDesc(list) {
  return list.sort((a, b) =>
    b.date.localeCompare(a.date) ||
    (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

// 即時訂閱某使用者的全部交易（不用 orderBy,避免建立複合索引;數量級小,前端排序即可）
export function subscribeTransactions(userId, cb) {
  const q = query(collection(db, COL.transactions), where('userId', '==', userId))
  return onSnapshot(q, (snap) => {
    cb(sortByDateDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, (err) => {
    console.error('subscribeTransactions:', err)
    cb([])
  })
}

// 唯讀查看對方帳本用,一次性讀取
export async function fetchTransactions(userId) {
  const snap = await getDocs(query(
    collection(db, COL.transactions), where('userId', '==', userId)))
  return sortByDateDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
}

export async function addTransaction(data) {
  await addDoc(collection(db, COL.transactions), {
    debtInfo: null,
    shareLevel: 'all',
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateTransaction(id, patch) {
  await updateDoc(doc(db, COL.transactions, id), patch)
}

export async function deleteTransaction(id) {
  await deleteDoc(doc(db, COL.transactions, id))
}

// 借貸不計入一般收支
export function sumIncome(list) {
  return list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
}
export function sumExpense(list) {
  return list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
}
