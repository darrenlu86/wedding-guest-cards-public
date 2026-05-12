/**
 * 初始化測試資料
 * 執行: npx tsx scripts/init-data.ts
 */

import { seedTestData } from '../lib/db';

async function main() {
  console.log('開始初始化資料...');

  await seedTestData();

  console.log('✅ 資料初始化完成!');
  console.log('');
  console.log('測試賓客:');
  console.log('- 小明 (classic), 小婷 (classic)');
  console.log('- 玫君 (rose), 思賢 (rose), Alex Chen (midnight)');
  console.log('- 佳穎 (midnight), 志豪 (spring), Jamie Lee (spring), 怡君 (luxe), 宏達 (luxe)');
  console.log('');
  console.log('請訪問: http://localhost:3000');
}

main().catch(console.error);
