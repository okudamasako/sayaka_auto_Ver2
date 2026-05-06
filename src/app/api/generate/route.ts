import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { theme, platform, tone, charLimit, hashtags } = body

    if (!theme || !platform) {
      return NextResponse.json({ error: 'テーマとプラットフォームは必須です' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI APIキーが設定されていません' }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })

    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    
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
ハッシュタグ数: ${hashtags || 5}個
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
      }
    })
  } catch (error: any) {
    console.error('Generate API error details:', error)
    const message = error?.message || '不明なエラー'
    return NextResponse.json({ error: `生成に失敗しました: ${message}` }, { status: 500 })
  }
}
