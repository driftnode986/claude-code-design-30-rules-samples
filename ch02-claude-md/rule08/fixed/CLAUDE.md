# CLAUDE.md (analytics-platform)

Node.js + TypeScript + PostgreSQL の分析基盤。pnpm + Vercel。

## プロジェクト固有のコマンド

- 起動: `pnpm dev` (Postgres は `docker compose up -d db` が前提)
- テスト: `pnpm vitest run` (Jest ではない)
- 型チェック: `pnpm typecheck` (PR 前に必ず実行)

## プロジェクト固有の罠

### 1. Postgres の `event_log` テーブルは TRUNCATE 禁止

- **症状**: `event_log` を `TRUNCATE` または `DELETE` するとイベント
  ストリーミング先 (BigQuery sink) のチェックポイントが壊れ、
  過去 24 時間ぶんのデータが二重取り込みされる
- **原因**: CDC コネクタが `event_log.id` の連番に依存している
- **回避策**: テストでもダミーデータ削除は `DELETE FROM event_log
  WHERE created_at < now() - interval '1 day'` に限定する

### 2. `lib/clock.ts` の `now()` を直接使うな

- **症状**: 集計バッチが「最後に成功した実行時刻」を見失う
- **原因**: テストで時刻をモックするために `lib/clock.ts` のラッパ
  経由で時刻を取得する規約がある。`Date.now()` を直接呼ぶとモック
  が効かず、テストは通るが本番でだけ集計区間がずれる
- **回避策**: 時刻参照は必ず `import { now } from "@/lib/clock"` 経由

### 3. Vercel の `preview` 環境では DB がリードオンリー

- **症状**: preview デプロイで「マイグレーションを試したのにテーブル
  が変わらない」
- **原因**: preview ブランチは本番 DB に接続し、Vercel 側で書き込み
  を遮断している (コスト対策)
- **回避策**: スキーマ変更は `DATABASE_URL=postgresql://localhost/dev`
  でローカル実行する。preview で確認できるのは読み取りパスだけ

### 4. Stripe webhook の `id` は不変ではない

- **症状**: webhook 受信側で `event.id` を主キー扱いした結果、
  Stripe の retry で重複行が増えた
- **原因**: Stripe は同じイベントに対して `evt_xxx` を新規発番する
  ことがある (公式仕様)
- **回避策**: 冪等性は `event.data.object.id` + `event.type` の
  複合キーで担保する。`lib/stripe-webhook.ts` にヘルパーあり

### 5. `pnpm install` は CI でだけ `--frozen-lockfile`

- **症状**: ローカルで `pnpm install` した直後に lockfile が変わり、
  CI が落ちる
- **原因**: ローカルでは `--frozen-lockfile` なし、CI でだけ on
- **回避策**: lockfile を更新したいときは明示的に `pnpm install
  --lockfile-only` を実行してコミットに含める
