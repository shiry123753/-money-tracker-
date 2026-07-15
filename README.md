# 記帳本 — 個人記帳 + 借貸追蹤 PWA

整合一般記帳與借貸追蹤,支援與另一人互相查看帳本(依權限層級)。
技術棧:React + Vite + Firebase (Firestore) + Vercel,比照釜山旅行 PWA。

## 日常使用

- 開發預覽:雙擊 `預覽.command`(或 `npm run dev`)
- 部署上線:雙擊 `部署.command`(build 通過才會 push,Vercel 自動部署)

## Firebase

沿用釜山 PWA 的 Firebase 專案(`korea-trip-13c7a`),所有 collection 加 `money_` 前綴避免衝突:
`money_users`、`money_transactions`、`money_categoryRules`、`money_shareSettings`。

之後若想改用獨立的 Firebase 專案,只要在 Firebase Console 建新專案,把六個
`VITE_FIREBASE_*` 值換到 `.env`(本機)和 Vercel 環境變數即可,程式不用改。

⚠️ Firestore 規則需允許上述四個 collection 的讀寫(比照釜山 PWA 的開放式規則即可)。

## 首次部署設定(只需做一次)

1. 在 GitHub (shiry123753) 建立 repo,並在本資料夾:
   `git remote add origin https://github.com/shiry123753/<repo>.git`
2. Vercel → Add New Project → 匯入該 repo(Framework 選 Vite)
3. Vercel → Settings → Environment Variables → 貼上 `.env` 內的六個 `VITE_FIREBASE_*`
4. 之後雙擊 `部署.command` 即可更新

## 資料模型速記

- `transactions.type`:`income` / `expense` / `debt`(借貸不計入一般收支)
- `transactions.shareLevel`:`all` / `expense_only` / `hidden`(單筆是否給對方看)
- `shareSettings.level`:`all`(含借貸)/ `income_expense` / `expense_only`
- 分享採邀請制:擁有者輸入對方加入碼 → `pending` → 對方接受 → `active`
