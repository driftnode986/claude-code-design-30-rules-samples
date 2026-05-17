---
name: sql-style
description: SQL style guide for acme-app. Use when writing migrations, analytical queries, or reviewing Drizzle schema definitions.
paths:
  - "**/*.sql"
  - "drizzle/**"
  - "src/server/db/**"
---

# SQL Style Guide (acme-app)

Drizzle ORM を使うが、生 SQL を書く局面 (移行スクリプト・分析クエリ) では本ガイドに従う。

## 命名

- テーブル名: snake_case, 複数形 (例: `user_accounts`, `order_items`)
- カラム名: snake_case (例: `created_at`, `is_active`)
- 主キー: `id` (UUID v7)
- 外部キー: `[parent_table_singular]_id` (例: `user_id`, `order_id`)
- 真偽値: `is_*` または `has_*` プレフィックス
- タイムスタンプ: `_at` サフィックス (`created_at`, `updated_at`, `deleted_at`)

## 型

- 文字列: `varchar(255)` または `text`
- 整数: `integer` または `bigint`
- 浮動小数: 使用禁止
- 通貨: `numeric(12, 2)`
- 日時: `timestamptz` (always with timezone)
- JSON: `jsonb` (`json` ではなく)

## インデックス

- 外部キーには必ず index を貼る
- 検索カラムには `WHERE deleted_at IS NULL` 条件付き index を検討
- 複合 index は selectivity の高いカラムから順に
- index 名: `idx_[table]_[col1]_[col2]` (例: `idx_orders_user_id_created_at`)

## マイグレーション

- 1 マイグレーションで 1 つの変更 (テーブル追加、index 追加、データ補正、etc.)
- NOT NULL カラム追加: NULL 許可で追加 → backfill → ALTER TABLE で NOT NULL 化、の 3 ステップに分割
- DROP COLUMN / DROP TABLE は別 PR に分離 (revert しやすくするため)
- 大量 UPDATE は `LIMIT` + ループ + `pg_sleep(0.1)` で leak しないように
