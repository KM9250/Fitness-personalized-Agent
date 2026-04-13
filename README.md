# FitCoach AI - パーソナライズドフィットネスコーチ

AIフィットネスコーチがあなたのトレーニングをサポートするWebアプリケーション。

## 機能

- **ワークアウト管理**: 筋トレ・有酸素運動・ヨガ・HIIT・ストレッチのメニューから選択、タイマー付きセッション管理
- **AIコーチ**: 複数のAIコーチ（熱血トレーナー、ヨガインストラクター、データ分析コーチ）が切替可能。ワークアウト評価とフリー会話対応
- **マルチLLM対応**: OpenAI (GPT)、Anthropic (Claude)、Google (Gemini)、Ollama (Gemma等ローカルSLM) に対応
- **自発的発言**: トレーニング中にAIコーチが定期的に励ましやアドバイスを発言（オン/オフ可能）
- **データ可視化**: 消費カロリー・体重推移・ワークアウト頻度をRechartsグラフで表示
- **Obsidian連携**: ワークアウトログをYAMLフロントマター付きMarkdownファイルとしてエクスポート
- **PWA対応**: スマートフォンにインストールしてアプリライクに使用可能
- **レスポンシブ**: モバイル（画面下部タブ）/ デスクトップ（サイドバー）両対応

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) + TypeScript |
| スタイル | Tailwind CSS |
| データベース | SQLite + Drizzle ORM |
| LLM統合 | Vercel AI SDK (ai) |
| チャート | Recharts |
| バリデーション | Zod |

## セットアップ

```bash
# 依存関係インストール
npm install

# データベースセットアップ（マイグレーション + シードデータ）
npm run db:setup

# 開発サーバー起動
npm run dev
```

### LLM APIキーの設定

設定画面（/settings）からAPIキーを入力するか、`.env.local` に設定:

```bash
cp .env.local.example .env.local
# .env.local を編集してAPIキーを設定
```

## NPMスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 (localhost:3000) |
| `npm run build` | プロダクションビルド |
| `npm start` | プロダクションサーバー起動 |
| `npm run db:setup` | DB初期化（マイグレーション + シード） |
| `npm run db:generate` | Drizzleマイグレーション生成 |
| `npm run db:studio` | Drizzle Studio起動 |

## プロジェクト構造

```
src/
├── app/          # Next.js App Routerページ & APIルート
├── components/   # UIコンポーネント（ui, layout, workout, chat, coaches, stats, profile）
├── lib/          # DB、LLMプロバイダー、カロリー計算、エクスポート
├── hooks/        # カスタムReactフック
├── i18n/         # 国際化メッセージ (ja/en)
└── types/        # TypeScript型定義
```

## ライセンス

MIT
