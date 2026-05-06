import { NextRequest, NextResponse } from 'next/server'
import { saveToNotion } from '@/lib/notion'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      theme, 
      threadsPost, 
      hashtags, 
      reelText, 
      bgm, 
      productName, 
      productUrl, 
      timeSlot 
    } = body

    if (!theme || !threadsPost) {
      return NextResponse.json({ error: 'テーマと投稿文は必須です' }, { status: 400 })
    }

    await saveToNotion({
      theme,
      threadsPost,
      hashtags,
      reelText,
      bgm,
      productName,
      productUrl,
      timeSlot
    })

    return NextResponse.json({ success: true, message: 'Notionに保存しました' })
  } catch (error: any) {
    console.error('Notion saving error:', error)
    const message = error?.message || '不明なエラー'
    return NextResponse.json({ error: `Notion保存に失敗しました: ${message}` }, { status: 500 })
  }
}
