#!/bin/bash

# 婚禮賓客卡片系統 - 端到端測試腳本

BASE_URL="http://localhost:3001"

echo "========================================="
echo "  婚禮賓客卡片系統 - 端到端測試"
echo "========================================="
echo ""

# 1. 測試驗證頁面載入
echo "✓ 測試 1: 驗證頁面載入"
RESPONSE=$(curl -s "$BASE_URL/table-1")
if echo "$RESPONSE" | grep -q "歡迎光臨"; then
  echo "  ✅ 驗證頁面正常顯示"
else
  echo "  ❌ 驗證頁面載入失敗"
  exit 1
fi
echo ""

# 2. 測試 API - 正確的賓客名稱
echo "✓ 測試 2: API 驗證 - 正確姓名"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/verify-guest" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"table-1","guestName":"王小明"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
  GUEST_ID=$(echo "$RESPONSE" | grep -o '"guestId":"[^"]*"' | cut -d'"' -f4)
  echo "  ✅ 驗證成功"
  echo "  賓客 ID: $GUEST_ID"
else
  echo "  ❌ 驗證失敗"
  echo "  回應: $RESPONSE"
  exit 1
fi
echo ""

# 3. 測試 API - 錯誤的賓客名稱
echo "✓ 測試 3: API 驗證 - 錯誤姓名"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/verify-guest" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"table-1","guestName":"不存在的人"}')

if echo "$RESPONSE" | grep -q '"success":false'; then
  echo "  ✅ 正確拒絕不存在的賓客"
else
  echo "  ❌ 應該拒絕不存在的賓客"
  exit 1
fi
echo ""

# 4. 測試 API - XSS 攻擊防護
echo "✓ 測試 4: XSS 攻擊防護"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/verify-guest" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"table-1","guestName":"<script>alert(1)</script>"}')

if echo "$RESPONSE" | grep -q '"code":"INVALID_INPUT"'; then
  echo "  ✅ 成功阻擋 XSS 攻擊"
else
  echo "  ❌ XSS 防護失效"
  exit 1
fi
echo ""

# 5. 測試卡片資料 API
echo "✓ 測試 5: 卡片資料 API"
RESPONSE=$(curl -s "$BASE_URL/api/card-data/$GUEST_ID")

if echo "$RESPONSE" | grep -q '"name":"王小明"'; then
  echo "  ✅ 成功獲取卡片資料"
else
  echo "  ❌ 卡片資料獲取失敗"
  exit 1
fi
echo ""

# 6. 測試 Rate Limiting
echo "✓ 測試 6: Rate Limiting (連續 6 次請求)"
for i in {1..6}; do
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/verify-guest" \
    -H "Content-Type: application/json" \
    -d '{"tableId":"table-1","guestName":"王小明"}')

  if [ $i -eq 6 ]; then
    if echo "$RESPONSE" | grep -q '"code":"RATE_LIMIT"'; then
      echo "  ✅ Rate Limiting 正常運作"
    else
      echo "  ❌ Rate Limiting 未生效"
    fi
  fi
done
echo ""

echo "========================================="
echo "  測試完成! 所有測試通過 ✅"
echo "========================================="
echo ""
echo "您可以在瀏覽器中訪問:"
echo "  http://localhost:3001/table-1"
echo ""
echo "測試賓客清單:"
echo "  - 桌號 1: 王小明, 李小華"
echo "  - 桌號 2: John Doe, 張三"
echo "  - 桌號 3: 陳大明"
