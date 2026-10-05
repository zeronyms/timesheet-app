import { createServerFn } from '@tanstack/react-start'
import fs from 'node:fs/promises'
import path from 'node:path'
import JSZip from 'jszip'
import { z } from 'zod'
import { MAX_TICKETS, monthLabel, ticketNo } from '~/lib/timesheet'
import { saveReportedCommits, type ReportedCommit } from './storage'

const OUTPUT_DIR = '/mnt/c/Users/suriyadharma/Documents/Timesheet MSI'
const TEMPLATE_PATH = path.resolve(process.cwd(), 'src/assets/template.xlsx')

// Fixed layout of the official template's sharedStrings.xml:
// 15..39 ticket numbers, 40 month name, 41..65 task messages.
const SST_TICKET = 15
const SST_MONTH = 40
const SST_TASK = 41
// sheet1.xml: dates in B11..B35, workday total in C38, ticket total in C39.
const FIRST_ROW = 11

const input = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  ticketPrefix: z.string().trim().min(1),
  commits: z
    .array(
      z.object({
        hash: z.string(),
        repo: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        message: z.string(),
      }),
    )
    .min(1, 'Pilih minimal 1 commit.')
    .max(MAX_TICKETS, `Maksimal ${MAX_TICKETS} tiket.`),
})

export const generateTimesheet = createServerFn({ method: 'POST' })
  .validator(input)
  .handler(({ data }) => buildTimesheet(data))

const escapeXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos' }[c]};`)

// Excel serial date, day 0 = 1899-12-30
const toExcelSerial = (date: string) =>
  Math.round((Date.parse(`${date}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / 86_400_000)

const setCellValue = (xml: string, cell: string, value: string | number) =>
  xml.replace(new RegExp(`(<c r="${cell}"[^>]*>(?:<f>[^<]*</f>)?<v>).*?(</v></c>)`), `$1${value}$2`)

async function buildTimesheet({ month, ticketPrefix, commits }: z.infer<typeof input>) {
  const label = monthLabel(month) // "September 2026"
  const fileName = `Kristian Suriyadharma - Timesheet ${label} - IT Service & Maintenance.xlsx`
  const outputPath = path.join(OUTPUT_DIR, fileName)

  const zip = await JSZip.loadAsync(await fs.readFile(TEMPLATE_PATH))
  const sstFile = zip.file('xl/sharedStrings.xml')
  const sheetFile = zip.file('xl/worksheets/sheet1.xml')
  if (!sstFile || !sheetFile) throw new Error('Template rusak: sharedStrings.xml atau sheet1.xml tidak ada.')

  const sstXml = await sstFile.async('string')
  let sheetXml = await sheetFile.async('string')

  const strings = sstXml.match(/<si>[\s\S]*?<\/si>/g) ?? []
  if (strings.length < SST_TASK + MAX_TICKETS) throw new Error('Template tidak sesuai: jumlah sharedStrings kurang.')

  const si = (text: string) => `<si><t>${escapeXml(text)}</t></si>`
  strings[SST_MONTH] = si(label.split(' ')[0])

  for (let i = 0; i < MAX_TICKETS; i++) {
    strings[SST_TICKET + i] = si(ticketNo(ticketPrefix, i))
    strings[SST_TASK + i] = si(commits[i]?.message ?? '')
    if (commits[i]) sheetXml = setCellValue(sheetXml, `B${FIRST_ROW + i}`, toExcelSerial(commits[i].date))
  }

  const workdays = new Set(commits.map((c) => c.date)).size
  sheetXml = setCellValue(sheetXml, 'A1', escapeXml(`Timesheet Bulan ${label}`))
  sheetXml = setCellValue(sheetXml, 'C38', workdays)
  sheetXml = setCellValue(sheetXml, 'C39', commits.length)

  zip.file('xl/sharedStrings.xml', sstXml.slice(0, sstXml.indexOf('<si>')) + strings.join('') + '</sst>')
  zip.file('xl/worksheets/sheet1.xml', sheetXml)

  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.writeFile(
    outputPath,
    await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } }),
  )

  const reportedAt = new Date().toISOString()
  await saveReportedCommits(
    commits.map(
      (c, i): ReportedCommit => ({ ...c, ticketNo: ticketNo(ticketPrefix, i), timesheetFile: fileName, reportedAt }),
    ),
  )

  return { filePath: outputPath, tickets: commits.length, workdays }
}
