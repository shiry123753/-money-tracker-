import {
  collection, deleteDoc, doc, onSnapshot, query,
  serverTimestamp, setDoc, updateDoc, where,
} from 'firebase/firestore'
import { db, COL } from '../firebase/config'
import { findUserByCode } from './users'

// 我分享出去的（我是帳本擁有者）
export function subscribeSharesByOwner(userId, cb) {
  const q = query(collection(db, COL.shareSettings), where('ownerId', '==', userId))
  return onSnapshot(q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => { console.error('subscribeSharesByOwner:', err); cb([]) })
}

// 分享給我的（我是查看者）
export function subscribeSharesByViewer(userId, cb) {
  const q = query(collection(db, COL.shareSettings), where('viewerId', '==', userId))
  return onSnapshot(q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => { console.error('subscribeSharesByViewer:', err); cb([]) })
}

// 擁有者輸入對方加入碼發出邀請,等對方接受後生效
export async function createShare(owner, viewerCode, level) {
  const viewer = await findUserByCode(viewerCode)
  if (!viewer) throw new Error('找不到這個加入碼')
  if (viewer.id === owner.userId) throw new Error('不能分享給自己')
  await setDoc(doc(db, COL.shareSettings, `${owner.userId}_${viewer.id}`), {
    ownerId: owner.userId,
    ownerName: owner.name,
    viewerId: viewer.id,
    viewerName: viewer.name,
    level,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return viewer
}

export async function acceptShare(id) {
  await updateDoc(doc(db, COL.shareSettings, id), { status: 'active' })
}

export async function updateShareLevel(id, level) {
  await updateDoc(doc(db, COL.shareSettings, id), { level })
}

export async function removeShare(id) {
  await deleteDoc(doc(db, COL.shareSettings, id))
}

// 依權限層級 + 單筆 shareLevel 過濾對方能看到的交易
export function visibleToViewer(tx, level) {
  if (tx.shareLevel === 'hidden') return false
  if (tx.shareLevel === 'expense_only' && tx.type !== 'expense') return false
  if (level === 'expense_only') return tx.type === 'expense'
  if (level === 'income_expense') return tx.type === 'income' || tx.type === 'expense'
  return true // all:含借貸
}
