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

## デプロイ手順

本番デプロイは以下の手順で実施する。

1. main ブランチが green (CI 全 PASS) であることを確認
2. ステージング (staging.acme.example.com) で QA 担当が動作確認済みであることを確認
3. DB マイグレーション (drizzle/migrations 配下に新規ファイルがある場合) が必要なら、ロールバック SQL を事前に作成
4. 関連 PR がすべて squash merge されていることを確認
5. リリースノートのドラフトを `docs/releases/v1.X.Y.md` に作成
6. oncall (Slack #oncall チャンネル) に連絡し、デプロイウィンドウを確保
7. 金曜 17 時以降、または大型キャンペーン期間中はデプロイ禁止 (緊急時は CTO 承認必須)
8. `git tag v1.X.Y && git push origin v1.X.Y` でタグ push し、GitHub Actions の deploy ワークフローを発火
9. デプロイ完了後、smoke テスト (`npm run smoke:production`) を実行
10. エラーメトリクス (Datadog dashboard / acme-app-prod) を 30 分間観測
11. 問題があれば `npm run rollback -- --to=v1.X.(Y-1)` で即時ロールバック

## API 規約

すべての API エンドポイントは tRPC で実装する。

### 命名規則

- Query (read): `[resource].list`, `[resource].get`
- Mutation (write): `[resource].create`, `[resource].update`, `[resource].delete`
- Action (副作用): `[resource].[verb]` (例: `order.refund`, `user.invite`)

### 入力バリデーション

- Zod スキーマで必ず入力をバリデート
- email は `z.string().email()`
- 金額は `z.number().multipleOf(0.01).positive()`
- UUID は `z.string().uuid()`

### エラーハンドリング

- ビジネスエラーは `TRPCError({ code: "BAD_REQUEST", message: "..." })`
- 認可エラーは `TRPCError({ code: "FORBIDDEN" })`
- 予期せぬエラーは throw せず `Result<T, E>` 型で返す (`@/lib/result` 参照)
- 監査ログが必要なミューテーションは `audit.log()` を必ず呼ぶ

### レート制限

- すべての mutation に `rateLimit({ window: "1m", max: 60 })` を適用
- 認証系 (`auth.login`, `auth.signup`) は `{ window: "1m", max: 5 }` に強化

## SQL スタイル

Drizzle ORM を使うが、生 SQL を書く局面 (移行スクリプト・分析クエリ) では以下の規約に従う。

### 命名

- テーブル名: snake_case, 複数形 (例: `user_accounts`, `order_items`)
- カラム名: snake_case (例: `created_at`, `is_active`)
- 主キー: `id` (UUID v7)
- 外部キー: `[parent_table_singular]_id` (例: `user_id`, `order_id`)
- 真偽値: `is_*` または `has_*` プレフィックス
- タイムスタンプ: `_at` サフィックス (`created_at`, `updated_at`, `deleted_at`)

### 型

- 文字列: `varchar(255)` または `text`
- 整数: `integer` または `bigint`
- 浮動小数: 使用禁止
- 通貨: `numeric(12, 2)`
- 日時: `timestamptz` (always with timezone)
- JSON: `jsonb` (`json` ではなく)

### インデックス

- 外部キーには必ず index を貼る
- 検索カラムには `WHERE deleted_at IS NULL` 条件付き index を検討
- 複合 index は selectivity の高いカラムから順に
- index 名: `idx_[table]_[col1]_[col2]` (例: `idx_orders_user_id_created_at`)

### マイグレーション

- 1 マイグレーションで 1 つの変更 (テーブル追加、index 追加、データ補正、etc.)
- 既存テーブルに NOT NULL カラムを追加する場合は、まず NULL 許可で追加 → backfill → ALTER TABLE で NOT NULL 化、の 3 ステップに分割
- DROP COLUMN / DROP TABLE は別 PR に分離 (revert しやすくするため)
- 大量 UPDATE は `LIMIT` + ループ + `pg_sleep(0.1)` で leak しないように

## コードレビュー基準

PR をレビューする時の観点 (priority 順):

### Priority 1 (必ず指摘)

- セキュリティ: 認可漏れ、SQL injection、XSS、CSRF
- データ整合性: トランザクション境界、N+1、race condition
- 互換性: API breaking change (TypeScript 型変更を含む)

### Priority 2 (強く推奨)

- パフォーマンス: 不要な SELECT、不適切な index 使用
- 可読性: 命名、関数の責務分離、コメント
- テスト: 新機能には integration test 必須、bug fix には regression test 必須

### Priority 3 (改善提案)

- リファクタリング機会
- 命名のさらなる改善
- TypeScript 型の精度向上

## テスト戦略

### Unit (Vitest)

- 純粋関数 (utils/lib 配下) は 100% カバレッジ目標
- 副作用なしの純粋ロジックのみ
- file 命名: `*.test.ts`、対象ファイルと同じディレクトリ

### Integration (Vitest + testcontainers)

- tRPC エンドポイント単位でテスト
- PostgreSQL は testcontainers で本物を起動
- 認証・認可は本番と同じパスを通す (mock しない)
- file 命名: `*.integration.test.ts`、`tests/integration/` 配下

### E2E (Playwright)

- 主要ユーザージャーニーのみ (sign up → 初回購入 → リファンド の 1 フロー)
- 5 ブラウザ (Chromium/Firefox/Webkit/Edge/Mobile Chrome) で並列実行
- CI では PR ごと、main push 時、毎日 03:00 UTC に実行

## 環境変数

`.env.local` で以下を設定:

- `DATABASE_URL`: PostgreSQL 接続文字列
- `STRIPE_SECRET_KEY`: Stripe API キー
- `SENDGRID_API_KEY`: SendGrid API キー
- `S3_BUCKET`: AWS S3 バケット名
- `S3_REGION`: ap-northeast-1
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry プロジェクト DSN

本番環境変数は Vercel の Environment Variables で管理。`.env.production` をコミットしない。

## トラブルシューティング FAQ

### Q: ローカル開発で DB に繋がらない

A: `docker compose up -d postgres` で local PostgreSQL を起動。`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/acme_dev` を `.env.local` に設定。

### Q: drizzle-kit generate が動かない

A: `pnpm drizzle-kit generate --config drizzle.config.ts` を root で実行。schema の TypeScript 型エラーがあると失敗するので、まず `pnpm tsc --noEmit` を通す。

### Q: Vercel デプロイで build エラー

A: `next.config.ts` の `experimental.serverActions.bodySizeLimit` を確認。デフォルト 1MB だが、ファイルアップロード機能を含む build では 10MB に拡張が必要。

### Q: Stripe webhook が来ない

A: ローカル開発では `stripe listen --forward-to localhost:3000/api/stripe/webhook` を別ターミナルで実行。Stripe CLI が出力する webhook secret を `STRIPE_WEBHOOK_SECRET` に設定。

### Q: テストが flaky

A: testcontainers の PostgreSQL 起動待ちを `await waitFor(() => ...)` で囲む。Playwright は `page.waitForLoadState("networkidle")` を多用しない (遅い・flaky)、代わりに `page.waitForResponse` で特定のレスポンスを待つ。

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
