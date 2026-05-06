import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SNS投稿文ジェネレーター | AI Powered',
  description: 'AIがSNS投稿文を自動生成し、Google スプレッドシートへ保存。Slack・Gmail へ即時通知。',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
