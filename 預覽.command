#!/bin/bash
# 本機預覽：啟動開發伺服器並自動開瀏覽器,雙擊即可執行。

cd "$(dirname "$0")" || { echo "❌ 找不到專案資料夾"; read -n 1 -s; exit 1; }

echo "👀 本機預覽（npm run dev）"
echo "📁 專案：$(pwd)"
echo "════════════════════════════════════"

if [ ! -d node_modules ]; then
  echo "📦 第一次使用,先安裝套件（npm install）…"
  npm install || { echo "❌ 安裝失敗"; read -n 1 -s; exit 1; }
fi

( sleep 2 && open "http://localhost:5173" ) &
npm run dev
