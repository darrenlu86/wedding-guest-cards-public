#!/usr/bin/env bash
# 修復 iCloud Drive 把同步衝突檔案改名造成的 node_modules 損壞
#
# 症狀：dev server 報 `Cannot find module './XXX'`，但檔案明明存在；
#       實際上 iCloud 把 `XXX.js` 改成 `XXX [conflicted].js`。
#
# 此腳本：
#   1. 找出所有 node_modules 內含 `[conflicted]` 的檔案
#   2. 將內容複製回原本應有的檔名（只新增，不刪除）
#   3. 列出修復數量
#
# 用法：
#   ./scripts/repair-icloud-conflicts.sh
#   或   npm run repair:icloud
#
# 適用情境：把專案放在 ~/Desktop 或其他 iCloud 同步路徑時觸發。

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_MODULES="${ROOT_DIR}/node_modules"

if [ ! -d "${NODE_MODULES}" ]; then
  echo "ERROR: ${NODE_MODULES} not found. Run 'npm install' first." >&2
  exit 1
fi

restored=0
skipped=0

while IFS= read -r -d '' conflicted; do
  target="${conflicted/ \[conflicted\]/}"
  if [ -e "${target}" ]; then
    skipped=$((skipped + 1))
  else
    cp "${conflicted}" "${target}"
    restored=$((restored + 1))
    echo "RESTORED: ${target#${ROOT_DIR}/}"
  fi
done < <(find "${NODE_MODULES}" -type f -name '*\[conflicted\]*' -print0)

echo ""
echo "Done. Restored: ${restored}   Already-OK: ${skipped}"

if [ "${restored}" -gt 0 ]; then
  echo ""
  echo "建議下一步："
  echo "  1. 把 .next/ 移到備份再重建：mv .next .next.bak.\$(date +%s)"
  echo "  2. 重啟 dev server：npm run dev"
fi
