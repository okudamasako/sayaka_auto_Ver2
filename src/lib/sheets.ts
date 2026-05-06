import { google } from 'googleapis'

interface SheetRow {
  date: string
  theme: string
  platform: string
  tone: string
  post: string
  status: string
}

function getAuth() {
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || ''
  if (!base64) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON が設定されていません')

  const json = Buffer.from(base64, 'base64').toString('utf-8')
  const credentials = JSON.parse(json)

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function appendToSheet(row: SheetRow) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const sheetId = process.env.GOOGLE_SHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'SNS投稿履歴'

  if (!sheetId) throw new Error('GOOGLE_SHEET_ID が設定されていません')

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:F`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.date,
        row.theme,
        row.platform,
        row.tone,
        row.post,
        row.status,
      ]],
    },
  })
}
