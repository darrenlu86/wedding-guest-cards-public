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
    { header: '圖片', key: 'images', width: 30 },
  ]

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5F0E6' },
  }

  // Add sample data
  worksheet.addRow({
    name: '王小明',
    phone: '0912345678',
    message: '親愛的小明，\n感謝你的陪伴，祝福你一切順利。',
    templateId: 'classic',
    images: 'photo1.jpg, photo2.jpg',
  })

  worksheet.addRow({
    name: 'John Doe',
    phone: '0922222222',
    message: 'Dear John,\nThank you for being a great friend.',
    templateId: 'spring',
    images: '',
  })

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
