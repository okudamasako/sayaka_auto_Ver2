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
  const envValue = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || ''
  if (!envValue) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON が設定されていません')

  let json = ''
  try {
    // まずBase64としてデコードを試みる
    json = Buffer.from(envValue, 'base64').toString('utf-8')
    // 正しいJSONかチェック。失敗すれば例外へ。
    JSON.parse(json)
  } catch {
    // Base64でなければ、プレーンなJSONとして扱う
    json = envValue
  }

  const credentials = JSON.parse(json)
  console.log('Google Service Account Email:', credentials.client_email)

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function appendToSheet(row: SheetRow) {
  console.log('Google Sheets: Start appending row...')
  try {
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
    console.log('Google Sheets: Success')
  } catch (error: any) {
    console.error('Google Sheets: Error details:', error.message || error)
    throw error
  }
}
