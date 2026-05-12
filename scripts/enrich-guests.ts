import ExcelJS from 'exceljs'
import * as fs from 'node:fs'
import * as path from 'node:path'

// --- Types ---

interface GuestEntry {
  id: string
  name: string
  phone: string
  venue: string
  guestWish: string // 賓客祝福（RSVP 回覆）
  customization: {
    message: string
    images: readonly string[]
    templateId: string
  }
}

interface RSVPRecord {
  nickname: string
  realName: string
  phone: string
  wish: string
}

// --- Card Message Templates ---

const CARD_MESSAGES: readonly string[] = [
  `謝謝你在我們最重要的日子裡，給我們最溫暖的祝福。

你的出席讓這一天更加完整，也讓我們感受到滿滿的幸福。

願我們的友誼像這份喜悅一樣，歷久彌新。`,

  `能在這個特別的日子見到你，是我們最開心的事。

感謝你一路以來的關心和支持，讓我們更有勇氣攜手走下去。

期待未來的日子，我們繼續一起創造美好回憶。`,

  `你的到來，讓我們的婚禮更加溫馨。

一路走來，感謝有你的陪伴與祝福，這些都是我們珍藏的寶物。

願幸福不只屬於我們，也永遠圍繞著你。`,

  `謝謝你見證我們的幸福，也謝謝你一直以來的陪伴。

人生路上有你同行，是我們最大的幸運。

希望這張小卡能傳遞我們滿滿的感謝，願你也一直被愛包圍。`,

  `在這個充滿愛的日子裡，最想感謝的就是你。

你的真心祝福是我們最珍貴的禮物，我們會好好珍惜。

未來的每一天，都期待與你分享更多生活的喜悅。`,

  `感謝你排除萬難來到現場，你的心意我們都收到了。

回想一路上的點點滴滴，有你的日子總是特別溫暖。

願這份幸福的能量也傳遞給你，祝你一切順心。`,

  `今天能和你一起慶祝，我們真的很感動。

謝謝你用最真摯的笑容和祝福，為我們的新生活揭開序幕。

這份情誼，我們會一直放在心裡，好好珍惜。`,

  `有你的祝福，讓我們更加確信彼此的選擇。

謝謝你一直在身邊，見證我們從相遇到相守。

未來的路，期待你繼續陪我們走，一起享受生活中的小確幸。`,

  `能邀請到你一起見證這個時刻，我們感到無比榮幸。

你的溫暖與真誠，是我們一直珍惜的。

願我們的幸福也能為你帶來一絲微笑，感謝有你。`,

  `這張卡片裝著我們對你滿滿的感謝。

謝謝你在百忙之中來到我們身邊，你的出現讓一切更加圓滿。

人生很長，願我們一直保持這樣美好的連結。`,

  `謝謝你帶著祝福來到我們的婚禮，你的笑容讓現場更加溫暖。

一直以來的情誼，是我們最珍貴的財富。

願我們都能被幸福環繞，繼續彼此守護。`,

  `能在人生最幸福的一天看到你，沒有什麼比這更讓人開心了。

感謝你一路上的支持與鼓勵，讓我們有勇氣走到今天。

希望我們的喜悅也能感染你，祝你天天開心。`,
]

// --- RSVP Reading ---

function getCellText(cell: ExcelJS.Cell): string {
  const value = cell.value
  if (value === null || value === undefined) return ''
  if (typeof value === 'object' && 'richText' in value) {
    return (value as ExcelJS.CellRichTextValue).richText
      .map((rt) => rt.text)
      .join('')
  }
  return String(value).trim()
}

async function readRSVP(filePath: string, phoneCol: number): Promise<RSVPRecord[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const worksheet = workbook.getWorksheet(1)
  if (!worksheet) return []

  const records: RSVPRecord[] = []

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return

    const nickname = getCellText(row.getCell(1)) // A: 名稱
    const realName = getCellText(row.getCell(2)) // B: 您的大名
    const phone = getCellText(row.getCell(phoneCol))
    const wish = getCellText(row.getCell(12)) // L: 想對我們說的話

    if (!nickname && !realName) return

    records.push({
      nickname: cleanName(nickname),
      realName: cleanName(realName),
      phone: normalizePhone(phone),
      wish,
    })
  })

  return records
}

function cleanName(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2702}-\u{27B0}\u{FE00}-\u{FEFF}]/gu, '') // remove emoji
    .replace(/[（(][^）)]*[）)]/g, '') // remove parenthetical
    .trim()
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()（）+]/g, '')
  if (/^\d{9,11}$/.test(cleaned)) return cleaned
  return ''
}

// --- Name Matching ---

function buildNameIndex(guests: GuestEntry[]): Map<string, number> {
  const index = new Map<string, number>()

  guests.forEach((guest, i) => {
    // Exact name
    index.set(guest.name.toLowerCase(), i)

    // Also index without spaces/special chars for fuzzy matching
    const simplified = guest.name.replace(/[\s\-_]/g, '').toLowerCase()
    if (!index.has(simplified)) {
      index.set(simplified, i)
    }
  })

  return index
}

function findGuestIndex(
  nameIndex: Map<string, number>,
  guests: GuestEntry[],
  rsvp: RSVPRecord
): number {
  // 1. Exact match on realName
  const realLower = rsvp.realName.toLowerCase()
  if (realLower && nameIndex.has(realLower)) {
    return nameIndex.get(realLower)!
  }

  // 2. Exact match on nickname
  const nickLower = rsvp.nickname.toLowerCase()
  if (nickLower && nameIndex.has(nickLower)) {
    return nameIndex.get(nickLower)!
  }

  // 3. Guest name contains RSVP realName or vice versa
  if (rsvp.realName.length >= 2) {
    for (let i = 0; i < guests.length; i++) {
      const gName = guests[i].name.toLowerCase()
      if (gName.includes(realLower) || realLower.includes(gName)) {
        return i
      }
    }
  }

  // 4. Guest name contains RSVP nickname or vice versa
  if (rsvp.nickname.length >= 2) {
    for (let i = 0; i < guests.length; i++) {
      const gName = guests[i].name.toLowerCase()
      if (gName.includes(nickLower) || nickLower.includes(gName)) {
        return i
      }
    }
  }

  return -1
}

// --- Main ---

async function main(): Promise<void> {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
  const guestsPath = path.join(projectRoot, 'lib', 'guests.json')
  const taipeiRSVP = '/Users/lvshaomin/Desktop/台北.xlsx'
  const kaohsiungRSVP = '/Users/lvshaomin/Desktop/高雄.xlsx'

  // Load guest list
  const rawGuests = JSON.parse(fs.readFileSync(guestsPath, 'utf-8'))
  const guests: GuestEntry[] = rawGuests.map((g: any) => ({
    ...g,
    guestWish: g.guestWish ?? '',
  }))

  const nameIndex = buildNameIndex(guests)

  // Read RSVP data
  // Taipei: phone = col C (3), message = col L (12)
  // Kaohsiung: phone = col H (8), message = col L (12)
  const taipeiRecords = await readRSVP(taipeiRSVP, 3)
  const kaohsiungRecords = await readRSVP(kaohsiungRSVP, 8)
  const allRSVP = [...taipeiRecords, ...kaohsiungRecords]

  let matched = 0
  let unmatched = 0
  const unmatchedNames: string[] = []

  for (const rsvp of allRSVP) {
    const idx = findGuestIndex(nameIndex, guests, rsvp)

    if (idx === -1) {
      // Skip entries that are clearly not guests (empty names, test entries)
      const displayName = rsvp.realName || rsvp.nickname
      if (displayName && displayName.length >= 2) {
        unmatched++
        unmatchedNames.push(`${rsvp.nickname} / ${rsvp.realName}`)
      }
      continue
    }

    matched++
    const guest = guests[idx]

    // Fill phone if empty
    if (!guest.phone && rsvp.phone) {
      guest.phone = rsvp.phone
    }

    // Fill guest wish if empty
    if (!guest.guestWish && rsvp.wish) {
      guest.guestWish = rsvp.wish
    }
  }

  // Generate card messages for all guests (except default)
  let msgIndex = 0
  for (const guest of guests) {
    if (guest.id === 'guest-default') continue
    if (!guest.customization.message) {
      guest.customization = {
        ...guest.customization,
        message: CARD_MESSAGES[msgIndex % CARD_MESSAGES.length],
      }
      msgIndex++
    }
  }

  // Write updated guests.json
  fs.writeFileSync(guestsPath, JSON.stringify(guests, null, 2) + '\n', 'utf-8')

  // Summary
  process.stdout.write('\n=== RSVP 配對結果 ===\n\n')
  process.stdout.write(`RSVP 總數：${allRSVP.length} 筆\n`)
  process.stdout.write(`成功配對：${matched} 筆\n`)
  process.stdout.write(`未配對：${unmatched} 筆\n`)

  if (unmatchedNames.length > 0) {
    process.stdout.write('\n未配對名單（可能是未列入桌次的人）：\n')
    for (const name of unmatchedNames) {
      process.stdout.write(`  - ${name}\n`)
    }
  }

  const withPhone = guests.filter((g) => g.phone).length
  const withWish = guests.filter((g) => g.guestWish).length
  const withMessage = guests.filter((g) => g.customization.message).length

  process.stdout.write(`\n=== 賓客資料統計 ===\n\n`)
  process.stdout.write(`已有電話：${withPhone} / ${guests.length}\n`)
  process.stdout.write(`已有賓客祝福：${withWish} / ${guests.length}\n`)
  process.stdout.write(`已有卡片訊息：${withMessage} / ${guests.length}\n`)
  process.stdout.write(`\n已更新 ${guestsPath}\n`)
}

main().catch((err: unknown) => {
  process.stderr.write(`\n失敗：${(err as Error).message}\n`)
  process.exit(1)
})
