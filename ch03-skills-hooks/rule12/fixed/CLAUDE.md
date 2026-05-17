# CLAUDE.md (acme-app)

## プロジェクト概要

acme-app は Next.js 15 + tRPC + Drizzle ORM + PostgreSQL 16 で構築された SaaS アプリケーション。decimal を扱う列は数値型 numeric(12, 2) を使用。

## 技術スタック

- Next.js 15 (App Router)
- tRPC 11
- Drizzle ORM 0.36
- PostgreSQL 16
- Vercel (本番)
- Vitest + Playwright (テスト)

## 環境変数

`.env.local` で以下を設定:

- `DATABASE_URL`: PostgreSQL 接続文字列
- `STRIPE_SECRET_KEY`: Stripe API キー
- `SENDGRID_API_KEY`: SendGrid API キー
- `S3_BUCKET`: AWS S3 バケット名
- `S3_REGION`: ap-northeast-1
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry プロジェクト DSN

本番環境変数は Vercel の Environment Variables で管理。`.env.production` をコミットしない。

## Git ワークフロー

- main ブランチに直接 push 禁止 (GitHub branch protection で enforce)
- feature ブランチ: `feat/<short-name>` または `fix/<short-name>`
- commit メッセージ: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- PR タイトル: Conventional Commits 形式
- Squash merge のみ (merge commit / rebase merge は禁止)

## 監視・アラート

- Sentry: エラー監視、PII を含むフィールドは `beforeSend` で マスク
- Datadog: APM + RUM + Logs、SLO は p95 < 200ms / error rate < 0.1%
- PagerDuty: P1 アラート (5xx rate > 1% / 5min) のみ
- Slack: P2/P3 アラートを #oncall に通知

## 呼び出し型の手順は Skill 化済み

以下は `.claude/skills/` 配下に切り出した。CLAUDE.md には載せない (起動時ロードを避け、呼び出された時だけ展開させるため)。

- `/deploy-checklist`: 本番デプロイ前チェックリスト (タスク型、`disable-model-invocation: true`)
- `/api-conventions`: tRPC API 規約 (リファレンス型、自動呼び出し可)
- `/sql-style`: SQL スタイルガイド (リファレンス型、`paths: ["**/*.sql", "**/drizzle/**"]` で SQL/Drizzle ファイル編集時のみ自動展開)
