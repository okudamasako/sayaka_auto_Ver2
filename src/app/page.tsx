'use client'

import { useState } from 'react'
import styles from './page.module.css'

const PLATFORMS = ['X (Twitter)', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Threads']
const TONES = ['カジュアル', 'ビジネス', 'フレンドリー', 'プロフェッショナル', 'ユーモラス', 'インスピレーション']

interface Result {
  post: string
  hashtags: string[]
  fullText: string
  tips: string
  meta: {
    theme: string
    platform: string
    tone: string
    generatedAt: string
    charCount: number
  }
  notifications: {
    sheet: { sent: boolean; error: string }
    slack: { sent: boolean; error: string }
    gmail: { sent: boolean; error: string }
  }
}

export default function Home() {
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('X (Twitter)')
  const [tone, setTone] = useState('カジュアル')
  const [charLimit, setCharLimit] = useState(140)
  const [hashtagCount, setHashtagCount] = useState(3)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    console.log("clicked")
    if (!theme.trim()) { setError('テーマを入力してください'); return }
    setLoading(true)
    setError('')
    setResult(null)

    try {
      console.log("fetch start")
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, platform, tone, charLimit, hashtags: hashtagCount }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('API Error Response:', data)
        setError(data.error || '生成に失敗しました')
        return
      }
      setResult(data)
    } catch (e) {
      console.error('Fetch error:', e)
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result.fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className={styles.main}>
      {/* Background effects */}
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGrid} />

      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerBadge}>AI POWERED · DEMO</div>
          <h1 className={styles.title}>
            SNS投稿文<br />
            <span className={styles.titleAccent}>ジェネレーター</span>
          </h1>
          <p className={styles.subtitle}>
            テーマを入力するだけで、AIが最適な投稿文を生成。<br />
            Google Sheets への保存・Slack / Gmail 通知まで自動化。
          </p>
          <div className={styles.headerPills}>
            <span className={styles.pill}>OpenAI GPT-4o</span>
            <span className={styles.pill}>Google Sheets</span>
            <span className={styles.pill}>Slack</span>
            <span className={styles.pill}>Gmail</span>
          </div>
        </header>

        {/* Form */}
        <section className={styles.card}>
          <div className={styles.cardLabel}>STEP 01 — 入力</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>投稿テーマ <span className={styles.required}>必須</span></label>
            <input
              className={styles.input}
              type="text"
              placeholder="例: 生成AIを活用した業務効率化のコツ"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>プラットフォーム</label>
              <select className={styles.select} value={platform} onChange={e => setPlatform(e.target.value)}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>文体</label>
              <select className={styles.select} value={tone} onChange={e => setTone(e.target.value)}>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>文字数上限: <strong>{charLimit}文字</strong></label>
              <input type="range" className={styles.range} min={80} max={500} step={10}
                value={charLimit} onChange={e => setCharLimit(Number(e.target.value))} />
              <div className={styles.rangeLabels}><span>80</span><span>500</span></div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>ハッシュタグ数: <strong>{hashtagCount}個</strong></label>
              <input type="range" className={styles.range} min={1} max={8} step={1}
                value={hashtagCount} onChange={e => setHashtagCount(Number(e.target.value))} />
              <div className={styles.rangeLabels}><span>1</span><span>8</span></div>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={`${styles.btn} ${loading ? styles.btnLoading : ''}`}
            onClick={generate}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.btnInner}>
                <span className={styles.spinner} />
                生成中...
              </span>
            ) : (
              <span className={styles.btnInner}>
                <span className={styles.btnIcon}>✦</span>
                投稿文を生成する
              </span>
            )}
          </button>
        </section>

        {/* Result */}
        {result && (
          <section className={`${styles.card} ${styles.resultCard}`}>
            <div className={styles.cardLabel}>STEP 02 — 結果</div>

            <div className={styles.resultMeta}>
              <span className={styles.metaBadge}>{result.meta.platform}</span>
              <span className={styles.metaBadge}>{result.meta.tone}</span>
              <span className={styles.metaBadge}>{result.meta.charCount}文字</span>
              <span className={styles.metaTime}>{result.meta.generatedAt}</span>
            </div>

            <div className={styles.postBox}>
              <p className={styles.postText}>{result.post}</p>
              <p className={styles.postHashtags}>
                {result.hashtags.map((h, i) => (
                  <span key={i} className={styles.hashtag}>#{h.replace(/^#/, '')}</span>
                ))}
              </p>
            </div>

            {result.tips && (
              <div className={styles.tipsBox}>
                <span className={styles.tipsIcon}>💡</span>
                <span>{result.tips}</span>
              </div>
            )}

            <button className={styles.copyBtn} onClick={copyToClipboard}>
              {copied ? '✓ コピーしました！' : '全文をコピー'}
            </button>

            {/* Notification Status */}
            <div className={styles.notifGrid}>
              <StatusCard label="Google Sheets" icon="📊" status={result.notifications.sheet} />
              <StatusCard label="Slack" icon="💬" status={result.notifications.slack} />
              <StatusCard label="Gmail" icon="📧" status={result.notifications.gmail} />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          <p>Built with Next.js · OpenAI · Google Sheets · Slack · Gmail · Deployed on Vercel</p>
        </footer>
      </div>
    </main>
  )
}

function StatusCard({ label, icon, status }: {
  label: string
  icon: string
  status: { sent: boolean; error: string }
}) {
  return (
    <div className={`${styles.notifCard} ${status.sent ? styles.notifOk : styles.notifErr}`}>
      <span className={styles.notifIcon}>{icon}</span>
      <span className={styles.notifLabel}>{label}</span>
      <span className={styles.notifStatus}>{status.sent ? '✓ 完了' : '✗ 未設定'}</span>
    </div>
  )
}
