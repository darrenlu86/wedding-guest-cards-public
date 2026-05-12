import ExcelJS from 'exceljs'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface GuestEntry {
  id: string
  name: string
  phone: string
  venue: string
  guestWish: string
  customization: {
    message: string
    images: readonly string[]
    templateId: string
  }
}

async function generateXlsx(): Promise<void> {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
  const jsonPath = path.join(projectRoot, 'lib', 'guests.json')
  const outputPath = path.join(projectRoot, 'data', 'guests.xlsx')

  const guests: GuestEntry[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('賓客資料')

  // Define columns
  worksheet.columns = [
    { header: '桌次', key: 'venue', width: 25 },
    { header: '姓名', key: 'name', width: 18 },
    { header: '電話', key: 'phone', width: 15 },
    { header: '祝福訊息（卡片內容）', key: 'message', width: 60 },
    { header: '主題', key: 'templateId', width: 12 },
    { header: '圖片', key: 'images', width: 35 },
    { header: '賓客祝福（不顯示於卡片）', key: 'guestWish', width: 50 },
  ]

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, size: 12 }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5F0E6' },
  }
  headerRow.alignment = { vertical: 'middle' }

  // Add guest data
  for (const guest of guests) {
    worksheet.addRow({
      venue: guest.venue ?? '',
      name: guest.name,
      phone: guest.phone,
      message: guest.customization.message,
      templateId: guest.customization.templateId,
      images: guest.customization.images.join(', '),
      guestWish: guest.guestWish ?? '',
    })
  }

  // Style data columns
  worksheet.getColumn('message').alignment = { wrapText: true, vertical: 'top' }
  worksheet.getColumn('guestWish').alignment = { wrapText: true, vertical: 'top' }
  worksheet.getColumn('name').alignment = { vertical: 'middle' }
  worksheet.getColumn('phone').alignment = { vertical: 'middle' }
  worksheet.getColumn('venue').alignment = { vertical: 'middle' }

  // Data validation for theme column (col E, rows 2-300)
  for (let row = 2; row <= 300; row++) {
    worksheet.getCell(`E${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"classic,rose,midnight,spring,luxe"'],
      showErrorMessage: true,
      errorTitle: '無效主題',
      error: '請選擇：classic, rose, midnight, spring, luxe',
    }
  }

  // Highlight the default card row (last row)
  const defaultRowIndex = guests.length + 1
  const defaultRow = worksheet.getRow(defaultRowIndex)
  defaultRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFDE7' },
  }
  worksheet.getCell(`B${defaultRowIndex}`).note = '公版卡片：搜尋不到賓客時顯示此卡片內容'

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]

  await workbook.xlsx.writeFile(outputPath)

  process.stdout.write(`\n已產生 ${outputPath}\n`)
  process.stdout.write(`共 ${guests.length} 筆資料（含 1 筆公版卡片）\n`)
}

generateXlsx().catch((err: unknown) => {
  process.stderr.write(`產生失敗：${(err as Error).message}\n`)
  process.exit(1)
})
