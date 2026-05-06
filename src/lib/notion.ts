export interface NotionPageData {
  theme: string
  threadsPost: string
  hashtags: string
  reelText: string
  bgm: string
  productName: string
  productUrl: string
  timeSlot: string
}

export async function saveToNotion(data: NotionPageData) {
  const apiKey = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!apiKey || !databaseId) {
    throw new Error('Notion API Key or Database ID is missing')
  }

  const now = new Date().toISOString()

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        'Name': {
          title: [{ text: { content: `${data.theme} (${data.timeSlot})` } }]
        },
        '投稿日時': {
          date: { start: now }
        },
        '投稿テーマ': {
          rich_text: [{ text: { content: data.theme } }]
        },
        'Threads投稿文': {
          rich_text: [{ text: { content: data.threadsPost } }]
        },
        'ハッシュタグ': {
          rich_text: [{ text: { content: data.hashtags } }]
        },
        'Instagramリール文': {
          rich_text: [{ text: { content: data.reelText } }]
        },
        'BGM候補': {
          rich_text: [{ text: { content: data.bgm } }]
        },
        '商品名': {
          rich_text: [{ text: { content: data.productName } }]
        },
        '商品URL': {
          url: data.productUrl || null
        },
        '投稿時間帯': {
          select: { name: data.timeSlot }
        }
      }
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Notion saving failed')
  }

  return await response.json()
}
