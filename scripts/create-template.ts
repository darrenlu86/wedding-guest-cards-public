import ExcelJS from 'exceljs'
import * as path from 'node:path'

async function createTemplate(): Promise<void> {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
  const outputPath = path.join(projectRoot, 'data', 'guests-template.xlsx')

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('賓客資料')

  // Define columns
  worksheet.columns = [
    { header: '姓名', key: 'name', width: 15 },
    { header: '電話', key: 'phone', width: 15 },
    { header: '祝福訊息', key: 'message', width: 50 },
    { header: '主題', key: 'templateId', width: 12 },
    { header: '圖片', key: 'images', width: 60 },
  ]

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5F0E6' },
  }

  // Add sample data — 圖片路徑必須是 /photos/{檔名}，檔案放在 public/photos/ 底下
  worksheet.addRow({
    name: '王小明',
    phone: '0912345678',
    message: '親愛的小明，\n感謝你的陪伴，祝福你一切順利。',
    templateId: 'classic',
    images: '/photos/01-王小明.jpg, /photos/01b-王小明.jpg',
  })

  worksheet.addRow({
    name: '李小華',
    phone: '0987654321',
    message: '親愛的小華，\n謝謝你一路上的陪伴。',
    templateId: 'rose',
    images: '/photos/02-李小華.jpg',
  })

  worksheet.addRow({
    name: 'John Doe',
    phone: '0922222222',
    message: 'Dear John,\nThank you for being a great friend.',
    templateId: 'spring',
    images: '',
  })

  // 第 5 列開始放使用說明（不會被 import-guests.ts 讀取，因為「姓名」欄空白）
  worksheet.getCell('A5').value = '👇 填寫說明（這些列不會被匯入）'
  worksheet.getCell('A5').font = { bold: true, color: { argb: 'FF8B7355' } }
  worksheet.getCell('A6').value = '圖片：路徑要用 /photos/檔名 格式，檔案放在 public/photos/ 底下'
  worksheet.getCell('A7').value = '多張圖片：用半形逗號 + 空白隔開，例 /photos/a.jpg, /photos/b.jpg'
  worksheet.getCell('A8').value = '主題五選一：classic（粉黃）/ rose（粉紅）/ midnight（粉藍）/ spring（粉綠）/ luxe（粉橘）'
  worksheet.getCell('A9').value = '祝福訊息換行：按 Alt+Enter（Win）或 Option+Enter（Mac）'

  // Enable text wrap for message column
  worksheet.getColumn('message').alignment = { wrapText: true }

  // Add data validation for theme column (rows 2-100)
  for (let row = 2; row <= 100; row++) {
    worksheet.getCell(`D${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"classic,rose,midnight,spring,luxe"'],
      showErrorMessage: true,
      errorTitle: '無效主題',
      error: '請選擇：classic, rose, midnight, spring, luxe',
    }
  }

  await workbook.xlsx.writeFile(outputPath)
  process.stdout.write(`\n範本已建立：${outputPath}\n`)
}

createTemplate().catch((err: unknown) => {
  process.stderr.write(`建立範本失敗：${(err as Error).message}\n`)
  process.exit(1)
})
