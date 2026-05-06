import { WebClient } from '@slack/web-api'

interface SlackPayload {
  theme: string
  platform: string
  fullText: string
  now: string
  tips: string
}

export async function sendSlackNotification(payload: SlackPayload) {
  const token = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_CHANNEL_ID

  if (!token || !channel) throw new Error('Slack の環境変数が未設定です')

  const client = new WebClient(token)

  await client.chat.postMessage({
    channel,
    text: `✅ SNS投稿文が生成されました`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '✅ SNS投稿文が生成されました', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*テーマ:*\n${payload.theme}` },
          { type: 'mrkdwn', text: `*プラットフォーム:*\n${payload.platform}` },
          { type: 'mrkdwn', text: `*生成日時:*\n${payload.now}` },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*生成された投稿文:*\n\`\`\`${payload.fullText}\`\`\`` },
      },
      ...(payload.tips ? [{
        type: 'context' as const,
        elements: [{ type: 'mrkdwn' as const, text: `💡 *ポイント:* ${payload.tips}` }],
      }] : []),
    ],
  })
}
