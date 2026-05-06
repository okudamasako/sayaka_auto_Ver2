import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { appendToSheet } from '@/lib/sheets'
import { sendSlackNotification } from '@/lib/slack'
import { sendGmailNotification } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  try {
    console.log('API Request received')
    const body = await req.json()
    console.log('API Request Body:', body)
    const { theme, platform, tone, charLimit, hashtags } = body

    if (!theme || !platform) {
      return NextResponse.json({ error: 'テーマとプラットフォームは必須です' }, { status: 400 })
    }

    // ── OpenAI 初期化 ──────────────────
    const apiKey = process.env.OPENAI_API_KEY
    console.log(apiKey ? "OPENAI_API_KEY: Present" : "OPENAI_API_KEY: Missing")
    
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // ── 1. OpenAI で投稿文生成 ──────────────────────────────────
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    console.log('Starting OpenAI generation with model:', modelName)
    
    const systemPrompt = `あなたはSNS運用アシスタント「Sayaka Angel」です。
30代女性をターゲットに、やさしく寄り添い、否定しない共感のトーンで投稿文を生成します。
売り込み感や不安を煽る表現は避け、温かい言葉選びを心がけてください。
hashtagsは日本語で必ず5個出力してください。

出力は必ず以下のJSON形式で行ってください（マークダウン不要）:
{
  "post": "Threads用投稿文。180〜220文字程度。共感から始まり、必ず1回「じつは〜」という表現を自然に含めてください。",
  "hashtags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"],
  "tips": "【Instagram本文】\n（Threadsより丁寧な表現）\n\n【リール文】\n（10文字以内×4行）\n\n【BGM】\n（英語キーワード5つ、ボーカルなし）\n\n【画像生成プロンプト】\n（英語、2:3 vertical, photo realisticなどを含む詳細な指示）"
}`

    const userPrompt = `
プラットフォーム: ${platform}
テーマ: ${theme}
文体: ${tone || 'カジュアル'}
文字数上限: ${charLimit || 140}文字以内
ハッシュタグ数: ${hashtags || 3}個
`

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content || '{}'
    const result = JSON.parse(raw)

    const generatedPost: string = result.post || ''
    const generatedHashtags: string[] = result.hashtags || []
    const tips: string = result.tips || ''
    const fullText = `${generatedPost}\n\n${generatedHashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')}`

    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })

    // ── 2. Google Sheets に保存 ────────────────────────────────
    let sheetSaved = false
    let sheetError = ''
    try {
      await appendToSheet({
        date: now,
        theme,
        platform,
        tone: tone || 'カジュアル',
        post: fullText,
        status: '未確認',
      })
      sheetSaved = true
    } catch (e: unknown) {
      sheetError = e instanceof Error ? e.message : '不明なエラー'
      console.error('Sheets error:', sheetError)
    }

    // ── 3. Slack 通知 ──────────────────────────────────────────
    let slackSent = false
    let slackError = ''
    try {
      await sendSlackNotification({ theme, platform, fullText, now, tips })
      slackSent = true
    } catch (e: unknown) {
      slackError = e instanceof Error ? e.message : '不明なエラー'
      console.error('Slack error:', slackError)
    }

    // ── 4. Gmail 通知 ──────────────────────────────────────────
    let gmailSent = false
    let gmailError = ''
    try {
      await sendGmailNotification({ theme, platform, fullText, now, tips })
      gmailSent = true
    } catch (e: unknown) {
      gmailError = e instanceof Error ? e.message : '不明なエラー'
      console.error('Gmail error:', gmailError)
    }

    return NextResponse.json({
      success: true,
      post: generatedPost,
      hashtags: generatedHashtags,
      fullText,
      tips,
      meta: {
        theme,
        platform,
        tone: tone || 'カジュアル',
        generatedAt: now,
        charCount: fullText.length,
      },
      notifications: {
        sheet: { sent: sheetSaved, error: sheetError },
        slack: { sent: slackSent, error: slackError },
        gmail: { sent: gmailSent, error: gmailError },
      },
    })
  } catch (error: any) {
    console.error('Generate API error details:', error)
    const message = error?.message || '不明なエラー'
    const name = error?.name || 'Error'
    const stack = error?.stack || ''
    console.error('Full Error Message:', message)
    console.error('Full Error Stack:', stack)

    return NextResponse.json({ 
      error: `生成に失敗しました: ${message} (${name})`,
      debug: { message, name, stack }
    }, { status: 500 })
  }
}
