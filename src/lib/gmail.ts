import nodemailer from 'nodemailer'

interface GmailPayload {
  theme: string
  platform: string
  fullText: string
  now: string
  tips: string
}

export async function sendGmailNotification(payload: GmailPayload) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  const to = process.env.NOTIFY_EMAIL_TO

  if (!user || !pass || !to) throw new Error('Gmail の環境変数が未設定です')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  const sheetUrl = process.env.GOOGLE_SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
    : null

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 32px 28px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.7; font-size: 13px; }
    .body { padding: 28px; }
    .meta { display: flex; gap: 16px; margin-bottom: 24px; }
    .badge { background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 8px 14px; font-size: 13px; }
    .badge span { color: #6366f1; font-weight: 600; }
    .post-box { background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 0 8px 8px 0; padding: 20px; margin: 20px 0; white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #1e293b; }
    .tips { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #92400e; margin-bottom: 20px; }
    .cta { text-align: center; margin-top: 24px; }
    .btn { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; padding: 16px; background: #f8fafc; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ SNS投稿文が生成されました</h1>
      <p>生成日時: ${payload.now}</p>
    </div>
    <div class="body">
      <div class="meta">
        <div class="badge">テーマ: <span>${payload.theme}</span></div>
        <div class="badge">プラットフォーム: <span>${payload.platform}</span></div>
      </div>
      <div class="post-box">${payload.fullText}</div>
      ${payload.tips ? `<div class="tips">💡 <strong>ポイント:</strong> ${payload.tips}</div>` : ''}
      ${sheetUrl ? `<div class="cta"><a class="btn" href="${sheetUrl}">📊 スプレッドシートで確認</a></div>` : ''}
    </div>
    <div class="footer">SNS Post Generator | Powered by OpenAI + n8n Architecture</div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: `"SNS Generator" <${user}>`,
    to,
    subject: `【SNS Generator】${payload.platform}向け投稿文が生成されました — ${payload.theme}`,
    html,
  })
}
