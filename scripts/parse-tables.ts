import * as fs from 'node:fs'
import * as path from 'node:path'
import { pinyin } from 'pinyin-pro'

// --- Types ---

interface GuestEntry {
  id: string
  name: string
  phone: string
  venue: string // 場次 + 桌次，例如 "台北-主桌" 或 "台北-第16桌 / 高雄-第3桌"
  customization: {
    message: string
    images: readonly string[]
    templateId: string
  }
}

// --- Constants ---

const TEMPLATES = ['classic', 'rose', 'midnight', 'spring', 'luxe'] as const

const DEFAULT_MESSAGE = `親愛的朋友，

感謝你撥冗出席我們的婚禮，你的到來是我們最珍貴的祝福。

希望今天的喜悅能讓你感受到我們的感激之情。未來的日子裡，期待我們能繼續分享彼此生命中的美好時刻。

謝謝你，願幸福常伴你左右。`

// --- CSV Parsing ---

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

function parseCSV(content: string): string[][] {
  return content
    .split('\n')
    .map(parseCSVLine)
}

// --- Name Processing ---

function extractBaseName(raw: string): string | null {
  let trimmed = raw.trim()
  if (!trimmed) return null

  // Skip row labels
  if (/^(桌次|桌名|別名|人員|女方|男方)/.test(trimmed)) return null

  // Convert "民 - 大姑姑" style entries to base name (prefix added later)
  const minPrefixMatch = trimmed.match(/^民\s*-\s*(.+)$/)
  if (minPrefixMatch) {
    trimmed = minPrefixMatch[1].trim()
  }

  // Strip parenthetical notes: "（可能主桌）", "（兒）" etc.
  trimmed = trimmed.replace(/[（(][^）)]*[）)]/g, '').trim()
  if (!trimmed) return null

  // Remove trailing number suffix with space: "王小明 2" → "王小明"
  // But keep: "顏偉家 老師", "林其樺(Ariel)", "楊雅鈞Yang"
  const match = trimmed.match(/^(.+?)\s+(\d+)$/)
  if (match) {
    return match[1].trim()
  }

  // Remove trailing number without space: "張瓊月2", "陳鳳秋5" → base name
  const match2 = trimmed.match(/^(.+[^\d])(\d+)$/)
  if (match2 && /[\u4e00-\u9fa5]/.test(match2[1])) {
    const base = match2[1].trim()
    if (base.length >= 2) {
      return base
    }
  }

  return trimmed
}

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

function generateGuestId(name: string): string {
  const slug = containsChinese(name)
    ? chineseNameToPinyinSlug(name)
    : slugify(name)
  return `guest-${slug}`
}

// --- Section Parsing ---

// Names that exist in both 民 and 珊 family — need prefix to differentiate
const CROSS_FAMILY_NAMES = new Set(['大姑姑', '二姑姑', '三姑姑'])

interface Section {
  tableNumbers: (string | number)[] // column index → table number/name
  tableAliases: string[]            // column index → alias (e.g. "民 - 呂家")
  rows: string[][]
}

function splitIntoSections(csvRows: string[][]): Section[] {
  const sections: Section[] = []
  let currentStart = -1

  for (let i = 0; i < csvRows.length; i++) {
    if (csvRows[i][0]?.trim() === '桌次') {
      if (currentStart >= 0) {
        sections.push(buildSection(csvRows, currentStart, i))
      }
      currentStart = i
    }
  }

  if (currentStart >= 0) {
    sections.push(buildSection(csvRows, currentStart, csvRows.length))
  }

  return sections
}

function buildSection(csvRows: string[][], start: number, end: number): Section {
  const headerRow = csvRows[start]
  const tableNumbers: (string | number)[] = []
  const tableAliases: string[] = []

  // Find alias row (別名) — usually 1 or 2 rows after header
  for (let offset = 1; offset <= 2; offset++) {
    const row = csvRows[start + offset]
    if (row && row[0]?.trim() === '別名') {
      for (let col = 0; col < row.length; col++) {
        tableAliases[col] = (row[col] ?? '').trim()
      }
      break
    }
  }

  for (let col = 0; col < headerRow.length; col++) {
    const val = headerRow[col].trim()
    if (val === '主桌') {
      tableNumbers[col] = '主桌'
    } else if (/^\d+$/.test(val)) {
      tableNumbers[col] = parseInt(val)
    }
  }

  return {
    tableNumbers,
    tableAliases,
    rows: csvRows.slice(start, end),
  }
}

interface GuestTableInfo {
  name: string
  tableLabel: string   // e.g. "主桌", "第16桌"
  tableSort: number    // for sorting: 主桌=0, otherwise table number
}

function getFamilySide(alias: string, tableNum: string | number): 'min' | 'shan' | null {
  const minKeywords = ['民', '呂家', '盧家']
  const shanKeywords = ['珊', '珊家', '珊爸', '珊媽']

  if (minKeywords.some((k) => alias.includes(k))) return 'min'
  if (shanKeywords.some((k) => alias.includes(k))) return 'shan'

  // Main table defaults to 民 side for these family names
  if (tableNum === '主桌') return 'min'

  return null
}

function extractNamesFromSection(
  section: Section,
  maxTable?: number
): GuestTableInfo[] {
  const results: GuestTableInfo[] = []
  const seen = new Set<string>()

  for (const row of section.rows) {
    const firstCell = row[0]?.trim() ?? ''
    if (!firstCell.startsWith('人員')) continue

    for (let col = 1; col < row.length; col++) {
      const tableNum = section.tableNumbers[col]
      if (tableNum === undefined) continue

      // Apply table filter
      if (maxTable !== undefined && typeof tableNum === 'number' && tableNum > maxTable) {
        continue
      }

      let baseName = extractBaseName(row[col])
      if (!baseName) continue

      // Add family prefix for cross-family conflicting names
      if (CROSS_FAMILY_NAMES.has(baseName)) {
        const alias = section.tableAliases[col] ?? ''
        const side = getFamilySide(alias, tableNum)
        if (side === 'min') {
          baseName = `呂家${baseName}`
        } else if (side === 'shan') {
          baseName = `陳家${baseName}`
        }
      }

      if (!seen.has(baseName)) {
        seen.add(baseName)
        const tableLabel = tableNum === '主桌' ? '主桌' : `第${tableNum}桌`
        const tableSort = tableNum === '主桌' ? 0 : (tableNum as number)
        results.push({ name: baseName, tableLabel, tableSort })
      }
    }
  }

  return results
}

// --- Main ---

interface GuestWithVenue {
  name: string
  venue: string       // "台北-主桌" or "台北-第16桌 / 高雄-第3桌"
  sortKey: number     // for ordering: taipei tables first, then kaohsiung
}

function main(): void {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
  const taipeiPath = path.join(projectRoot, 'data', '婚禮桌次統計 - 台北場桌次安排.csv')
  const kaohsiungPath = path.join(projectRoot, 'data', '婚禮桌次統計 - 高雄場桌次安排.csv')
  const outputPath = path.join(projectRoot, 'lib', 'guests.json')

  // Parse Taipei — collect name → table info
  const taipeiCSV = parseCSV(fs.readFileSync(taipeiPath, 'utf-8'))
  const taipeiSections = splitIntoSections(taipeiCSV)
  const taipeiMap = new Map<string, GuestTableInfo>()
  for (const section of taipeiSections) {
    for (const info of extractNamesFromSection(section)) {
      if (!taipeiMap.has(info.name)) {
        taipeiMap.set(info.name, info)
      }
    }
  }

  // Parse Kaohsiung (up to table 11)
  const kaohsiungCSV = parseCSV(fs.readFileSync(kaohsiungPath, 'utf-8'))
  const kaohsiungSections = splitIntoSections(kaohsiungCSV)
  const kaohsiungMap = new Map<string, GuestTableInfo>()
  for (const section of kaohsiungSections) {
    for (const info of extractNamesFromSection(section, 11)) {
      if (!kaohsiungMap.has(info.name)) {
        kaohsiungMap.set(info.name, info)
      }
    }
  }

  // Merge: build venue string and sort key for each guest
  const allGuestNames = new Set([...taipeiMap.keys(), ...kaohsiungMap.keys()])
  const guestsWithVenue: GuestWithVenue[] = []

  for (const name of allGuestNames) {
    const tp = taipeiMap.get(name)
    const ks = kaohsiungMap.get(name)

    const parts: string[] = []
    if (tp) parts.push(`台北-${tp.tableLabel}`)
    if (ks) parts.push(`高雄-${ks.tableLabel}`)
    const venue = parts.join(' / ')

    // Sort key: prioritize Taipei tables, then Kaohsiung-only
    // Taipei guests: sortKey = tableSort (0 for 主桌, then table number)
    // Kaohsiung-only: sortKey = 1000 + tableSort
    const sortKey = tp
      ? tp.tableSort
      : 1000 + (ks?.tableSort ?? 0)

    guestsWithVenue.push({ name, venue, sortKey })
  }

  // Sort by table order (主桌 first, then table 1, 2, 3...)
  guestsWithVenue.sort((a, b) => {
    if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey
    return a.name.localeCompare(b.name, 'zh-Hant')
  })

  // Generate guest entries
  const guests: GuestEntry[] = []
  const idSet = new Set<string>()
  let templateIndex = 0

  for (const { name, venue } of guestsWithVenue) {
    let id = generateGuestId(name)

    if (idSet.has(id)) {
      let suffix = 2
      while (idSet.has(`${id}-${suffix}`)) {
        suffix++
      }
      id = `${id}-${suffix}`
    }
    idSet.add(id)

    guests.push({
      id,
      name,
      phone: '',
      venue,
      customization: {
        message: '',
        images: [],
        templateId: TEMPLATES[templateIndex % TEMPLATES.length],
      },
    })
    templateIndex++
  }

  // Add default public card
  guests.push({
    id: 'guest-default',
    name: '貴賓',
    phone: '',
    venue: '公版',
    customization: {
      message: DEFAULT_MESSAGE,
      images: [],
      templateId: 'classic',
    },
  })

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(guests, null, 2) + '\n', 'utf-8')

  // Print summary
  const taipeiCount = taipeiMap.size
  const kaohsiungCount = kaohsiungMap.size
  const overlapCount = [...taipeiMap.keys()].filter(n => kaohsiungMap.has(n)).length

  process.stdout.write('\n=== 桌次名單解析結果 ===\n\n')
  process.stdout.write(`台北場：${taipeiCount} 位賓客\n`)
  process.stdout.write(`高雄場（至第 11 桌）：${kaohsiungCount} 位賓客\n`)
  process.stdout.write(`兩場重複：${overlapCount} 位\n`)
  process.stdout.write(`合計（去重後）：${allGuestNames.size} 位賓客 + 1 公版卡片\n`)
  process.stdout.write(`已寫入：${outputPath}\n\n`)

  // Print sorted list
  for (const g of guests) {
    process.stdout.write(`  ${g.name.padEnd(12)} ${g.venue}\n`)
  }
}

main()
