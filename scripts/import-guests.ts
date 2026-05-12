import ExcelJS from 'exceljs'
import { pinyin } from 'pinyin-pro'
import * as fs from 'node:fs'
import * as path from 'node:path'

// --- Types ---

interface RawRow {
  name: string
  phone: string
  message: string
  templateId: string
  images: string
}

interface GuestData {
  id: string
  name: string
  phone: string
  customization: {
    message: string
    images: readonly string[]
    templateId: string
  }
}

interface ImportResult {
  readonly guests: readonly GuestData[]
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
}

// --- Constants ---

const VALID_TEMPLATES = ['classic', 'rose', 'midnight', 'spring', 'luxe'] as const
const DEFAULT_TEMPLATE = 'classic'
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif']

const COLUMN_MAP: Record<string, keyof RawRow> = {
  '姓名': 'name',
  '電話': 'phone',
  '祝福訊息': 'message',
  '祝福訊息（卡片內容）': 'message',
  '主題': 'templateId',
  '圖片': 'images',
}

// Only name is truly required — phone and message can be empty
const REQUIRED_COLUMNS = ['姓名']

// --- ID Generation ---

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text)
}

function chineseNameToPinyinSlug(name: string): string {
  const pinyinResult = pinyin(name, { toneType: 'none', type: 'array' })
  const surname = pinyinResult[0]
  const givenName = pinyinResult.slice(1).join('')
  return givenName
    ? `${surname}-${givenName}`.toLowerCase()
    : surname.toLowerCase()
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// 特殊名稱 → 固定 ID 對應
const FIXED_ID_MAP: Record<string, string> = {
  '貴賓': 'guest-default',
}

function generateGuestId(name: string): string {
  const fixed = FIXED_ID_MAP[name.trim()]
  if (fixed) return fixed

  const slug = containsChinese(name)
    ? chineseNameToPinyinSlug(name)
    : slugify(name)
  return `guest-${slug}`
}

// --- Phone Normalization ---

function validatePhone(phone: string, rowIndex: number, name: string): string {
  const normalized = phone.replace(/[\s\-()（）]/g, '')

  if (!/^\d+$/.test(normalized)) {
    throw new Error(`第 ${rowIndex} 列（${name}）：電話號碼包含無效字符 "${phone}"`)
  }

  if (normalized.length < 9 || normalized.length > 15) {
    throw new Error(`第 ${rowIndex} 列（${name}）：電話號碼長度不正確 "${phone}"`)
  }

  return normalized
}

// --- Image Resolution ---

// Map from basename (without extension) -> relative path from public/
let publicFileIndex: Map<string, string> | null = null

function getPublicFileIndex(projectRoot: string): Map<string, string> {
  if (publicFileIndex) return publicFileIndex

  publicFileIndex = new Map()
  const publicDir = path.join(projectRoot, 'public')
  if (!fs.existsSync(publicDir)) return publicFileIndex

  function scan(dir: string, prefix: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        scan(path.join(dir, entry.name), `${prefix}${entry.name}/`)
      } else {
        const relativePath = `${prefix}${entry.name}`
        // Index by full relative path, basename, and lowercase variants
        publicFileIndex!.set(relativePath, relativePath)
        publicFileIndex!.set(relativePath.toLowerCase(), relativePath)
        publicFileIndex!.set(entry.name, relativePath)
        publicFileIndex!.set(entry.name.toLowerCase(), relativePath)
      }
    }
  }

  scan(publicDir, '')
  return publicFileIndex
}

function resolveImageName(
  rawName: string,
  projectRoot: string,
  rowIndex: number,
  guestName: string
): { path: string; warning?: string } {
  const trimmed = rawName.trim()
  if (trimmed.includes('..')) {
    throw new Error(`圖片路徑不安全："${trimmed}"`)
  }

  const index = getPublicFileIndex(projectRoot)

  // If already has extension, try to find in public/
  const hasExtension = IMAGE_EXTENSIONS.some((ext) =>
    trimmed.toLowerCase().endsWith(ext)
  )
  if (hasExtension) {
    const found = index.get(trimmed) ?? index.get(trimmed.toLowerCase())
    if (found) return { path: `/${found}` }
    // Not found — use as-is but warn
    const filePath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return {
      path: filePath,
      warning: `第 ${rowIndex} 列（${guestName}）：在 public/ 找不到圖片 "${trimmed}"`,
    }
  }

  // No extension — try each extension by basename (case-insensitive)
  for (const ext of IMAGE_EXTENSIONS) {
    const candidate = `${trimmed}${ext}`
    const found = index.get(candidate) ?? index.get(candidate.toLowerCase())
    if (found) return { path: `/${found}` }
  }

  // Not found — still include but warn
  return {
    path: `/${trimmed}`,
    warning: `第 ${rowIndex} 列（${guestName}）：在 public/ 找不到圖片 "${trimmed}"（支援格式：${IMAGE_EXTENSIONS.join(', ')}）`,
  }
}

function parseImages(
  raw: string,
  projectRoot: string,
  rowIndex: number,
  guestName: string
): { images: readonly string[]; warnings: string[] } {
  if (!raw || raw.trim() === '') return { images: [], warnings: [] }

  const warnings: string[] = []
  const images = raw
    .split(',')
    .map((img) => img.trim())
    .filter((img) => img !== '')
    .map((img) => {
      const result = resolveImageName(img, projectRoot, rowIndex, guestName)
      if (result.warning) warnings.push(result.warning)
      return result.path
    })

  return { images, warnings }
}

// --- Parsing ---

function validateTemplate(templateId: string): string {
  const trimmed = templateId.trim().toLowerCase()
  if (trimmed === '') return DEFAULT_TEMPLATE

  if (!(VALID_TEMPLATES as readonly string[]).includes(trimmed)) {
    throw new Error(
      `無效的主題 "${templateId}"，可用選項：${VALID_TEMPLATES.join(', ')}`
    )
  }
  return trimmed
}

function getCellText(cell: ExcelJS.Cell): string {
  const value = cell.value
  if (value === null || value === undefined) return ''

  if (typeof value === 'object' && 'richText' in value) {
    return (value as ExcelJS.CellRichTextValue).richText
      .map((rt) => rt.text)
      .join('')
  }

  return String(value)
}

function parseColumnHeaders(
  headerRow: ExcelJS.Row
): { columnMapping: Map<number, keyof RawRow>; missingColumns: string[] } {
  const columnMapping = new Map<number, keyof RawRow>()

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerText = getCellText(cell).trim()
    const fieldName = COLUMN_MAP[headerText]
    if (fieldName) {
      columnMapping.set(colNumber, fieldName)
    }
  })

  const foundHeaders = new Set(columnMapping.values())
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !foundHeaders.has(COLUMN_MAP[col])
  )

  return { columnMapping, missingColumns }
}

function parseRow(
  row: ExcelJS.Row,
  rowIndex: number,
  columnMapping: Map<number, keyof RawRow>,
  projectRoot: string
): { guest: GuestData | null; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const raw: Partial<RawRow> = {}

  columnMapping.forEach((fieldName, colNumber) => {
    const cell = row.getCell(colNumber)
    raw[fieldName] = getCellText(cell)
  })

  const name = (raw.name ?? '').trim()
  const phone = (raw.phone ?? '').trim()
  const message = (raw.message ?? '').trim()

  if (!name) {
    return { guest: null, errors: [], warnings: [] } // skip empty rows
  }

  let templateId: string
  try {
    templateId = validateTemplate(raw.templateId ?? '')
  } catch (e) {
    errors.push(`第 ${rowIndex} 列（${name}）：${(e as Error).message}`)
    return { guest: null, errors, warnings }
  }

  let normalizedPhone = ''
  if (phone) {
    try {
      normalizedPhone = validatePhone(phone, rowIndex, name)
    } catch (e) {
      errors.push((e as Error).message)
      return { guest: null, errors, warnings }
    }
  }

  const imageResult = parseImages(raw.images ?? '', projectRoot, rowIndex, name)
  warnings.push(...imageResult.warnings)

  const id = generateGuestId(name)

  return {
    guest: {
      id,
      name,
      phone: normalizedPhone,
      customization: {
        message,
        images: imageResult.images,
        templateId,
      },
    },
    errors: [],
    warnings,
  }
}

async function importGuests(xlsxPath: string, projectRoot: string): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(xlsxPath)

  const worksheet = workbook.getWorksheet(1)
  if (!worksheet) {
    return { guests: [], errors: ['Excel 檔案中沒有工作表'], warnings: [] }
  }

  const headerRow = worksheet.getRow(1)
  const { columnMapping, missingColumns } = parseColumnHeaders(headerRow)

  if (missingColumns.length > 0) {
    return {
      guests: [],
      errors: [`缺少必要欄位：${missingColumns.join(', ')}`],
      warnings: [],
    }
  }

  const allGuests: GuestData[] = []
  const allErrors: string[] = []
  const allWarnings: string[] = []
  const idSet = new Set<string>()

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return

    const result = parseRow(row, rowNumber, columnMapping, projectRoot)

    allErrors.push(...result.errors)
    allWarnings.push(...result.warnings)

    if (result.guest) {
      if (idSet.has(result.guest.id)) {
        allErrors.push(
          `第 ${rowNumber} 列（${result.guest.name}）：ID 重複 "${result.guest.id}"，請確認是否有同名賓客`
        )
      } else {
        idSet.add(result.guest.id)
        allGuests.push(result.guest)
      }
    }
  })

  return { guests: allGuests, errors: allErrors, warnings: allWarnings }
}

// --- CLI Entry ---

async function main(): Promise<void> {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
  const xlsxPath = path.join(projectRoot, 'data', 'guests.xlsx')
  const outputPath = path.join(projectRoot, 'lib', 'guests.json')

  if (!fs.existsSync(xlsxPath)) {
    process.stderr.write(
      `\n錯誤：找不到 ${xlsxPath}\n請將賓客 Excel 檔案放在 data/guests.xlsx\n`
    )
    process.exit(1)
  }

  process.stdout.write('\n匯入賓客資料中...\n')
  process.stdout.write(`來源：${xlsxPath}\n`)
  process.stdout.write(`輸出：${outputPath}\n\n`)

  const { guests, errors, warnings } = await importGuests(xlsxPath, projectRoot)

  if (errors.length > 0) {
    process.stderr.write('--- 錯誤 ---\n')
    for (const err of errors) {
      process.stderr.write(`  ✗ ${err}\n`)
    }
    process.stderr.write('\n')
  }

  if (warnings.length > 0) {
    process.stderr.write('--- 警告 ---\n')
    for (const w of warnings) {
      process.stderr.write(`  ⚠ ${w}\n`)
    }
    process.stderr.write('\n')
  }

  if (guests.length === 0) {
    process.stderr.write('沒有成功匯入任何賓客，請檢查 Excel 資料。\n')
    process.exit(1)
  }

  fs.writeFileSync(outputPath, JSON.stringify(guests, null, 2) + '\n', 'utf-8')

  process.stdout.write('--- 匯入結果 ---\n')
  process.stdout.write(`  成功：${guests.length} 位賓客\n`)
  process.stdout.write(`  錯誤：${errors.length} 筆\n`)
  process.stdout.write(`  警告：${warnings.length} 筆\n\n`)

  process.stdout.write('賓客清單：\n')
  for (const guest of guests) {
    const imgCount = guest.customization.images.length
    const imgLabel = imgCount > 0 ? `${imgCount} 張圖片` : ''
    const msgLabel = guest.customization.message ? '' : '(未填訊息)'
    process.stdout.write(
      `  ${guest.name.padEnd(12)} ${guest.customization.templateId.padEnd(10)} ${imgLabel} ${msgLabel}\n`
    )
  }
  process.stdout.write(`\n已寫入 ${outputPath}\n`)
}

main().catch((err: unknown) => {
  process.stderr.write(`\n匯入失敗：${(err as Error).message}\n`)
  process.exit(1)
})
