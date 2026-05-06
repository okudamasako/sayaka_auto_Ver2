# SNS投稿文ジェネレーター

> AIがSNS投稿文を自動生成し、Google Sheets保存・Slack/Gmail通知まで自動化するWebアプリ

## 🖥 デモ構成

```
[ブラウザ UI]
     ↓ (テーマ・プラットフォーム・文体を入力)
[Next.js API Route /api/generate]
     ↓
  ┌──────────────────────────────────────┐
  │ 1. OpenAI GPT-4o-mini で投稿文生成   │
  │ 2. Google Sheets へ行追記            │
  │ 3. Slack チャンネルへ通知            │
  │ 4. Gmail で通知メール送信            │
  └──────────────────────────────────────┘
```

## 🚀 セットアップ手順

### Step 1 — リポジトリをクローン & 依存関係インストール

```bash
git clone https://github.com/YOUR_USERNAME/sns-post-generator.git
cd sns-post-generator
npm install
```

### Step 2 — 環境変数の設定

`.env.local.example` を `.env.local` にコピーして各値を設定します。

```bash
cp .env.local.example .env.local
```

#### 必要なキーの取得方法

**OpenAI APIキー**
1. https://platform.openai.com にアクセス
2. API Keys → Create new secret key
3. `OPENAI_API_KEY` に設定

**Google Sheets（サービスアカウント）**
1. https://console.cloud.google.com でプロジェクト作成
2. APIとサービス → Google Sheets API を有効化
3. 認証情報 → サービスアカウント作成 → JSON キーをダウンロード
4. JSONファイルをBase64エンコード:
   ```bash
   base64 -i your-service-account.json | tr -d '\n'
   ```
5. 出力を `GOOGLE_SERVICE_ACCOUNT_JSON` に設定
6. スプレッドシートを作成し、サービスアカウントのメールアドレスを「編集者」として共有
7. スプレッドシートIDを `GOOGLE_SHEET_ID` に設定（URLの `/d/XXXX/edit` のXXXX部分）

**スプレッドシートの初期設定**（1行目にヘッダーを追加）
| A: 実行日時 | B: 投稿テーマ | C: プラットフォーム | D: 文体 | E: 生成投稿文 | F: 承認ステータス |

**Slack Bot Token**
1. https://api.slack.com/apps でApp作成
2. OAuth & Permissions → Bot Token Scopes に `chat:write` を追加
3. Install to Workspace → Bot User OAuth Token をコピー
4. `SLACK_BOT_TOKEN` に設定
5. 通知先チャンネルのID（チャンネル名を右クリック→リンクをコピー→末尾の英数字）を `SLACK_CHANNEL_ID` に設定
6. チャンネルにBotを招待: `/invite @your-app-name`

**Gmail アプリパスワード**
1. Googleアカウント → セキュリティ → 2段階認証を有効化
2. アプリパスワード → 「メール」「デバイス」を選択 → 生成
3. `GMAIL_USER` にGmailアドレス、`GMAIL_APP_PASSWORD` にアプリパスワードを設定

### Step 3 — ローカル起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

---

## ☁️ Vercelへのデプロイ

### GitHubにプッシュ

```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sns-post-generator.git
git push -u origin main
```

### Vercelでデプロイ

1. https://vercel.com にアクセス → New Project
2. GitHubリポジトリをインポート
3. **Environment Variables** に `.env.local` の全キーを入力
4. Deploy ボタンをクリック

**⚠️ 重要**: `.env.local` ファイルは `.gitignore` に含まれており、GitHubにはpushされません。  
環境変数は必ずVercelのダッシュボードから設定してください。

---

## 📁 ディレクトリ構成

```
sns-post-generator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts     # メインAPIエンドポイント
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx             # メインUI
│   │   └── page.module.css
│   └── lib/
│       ├── sheets.ts            # Google Sheets連携
│       ├── slack.ts             # Slack通知
│       └── gmail.ts             # Gmail通知
├── .env.local.example           # 環境変数テンプレート
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🔧 カスタマイズ

- **プロンプトの変更**: `src/app/api/generate/route.ts` の `systemPrompt` / `userPrompt` を編集
- **対応プラットフォームの追加**: `src/app/page.tsx` の `PLATFORMS` 配列に追記
- **使用モデルの変更**: 環境変数 `OPENAI_MODEL` を `gpt-4o` に変更（高品質・高コスト）

## 💰 コスト目安（gpt-4o-mini使用時）

| 利用頻度 | 月間コスト |
|---------|-----------|
| 30回/月 | 約 $0.02〜$0.05 |
| 300回/月 | 約 $0.20〜$0.50 |

## 📄 ライセンス

MIT
