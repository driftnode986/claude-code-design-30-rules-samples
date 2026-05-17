# CLAUDE.md (rule10-fixed)

> 同じ知識を「コンテキスト読み込みタイミング」で 3 層に振り分けた版。
> 起動時に読まれるのはこのファイル (約 90 行) のみ。

## プロジェクト概要

Next.js + TypeScript の SaaS バックエンド。API 規約・テスト規約・デプロイ手順は **常時注入が不要** なため、CLAUDE.md には書かない。

## 全セッション共通の最重要ルール

- **TypeScript strict mode 必須** (`tsconfig.json` で `strict: true` `noUncheckedIndexedAccess: true` を維持)
- **PR は squash merge のみ** (history を線形に保つ)
- **`.env` は絶対に commit しない** (誤って commit したら git filter-repo + secret rotation)
- **main ブランチへの force push 禁止**
- **本番 DB に直接アクセス禁止** (必ず PR 経由で migration を流す)
- **金曜 17 時以降は緊急時のみデプロイ**

## ディレクトリ規約

- `src/api/handlers/<resource>.ts` — REST エンドポイント
- `src/api/schemas/<resource>.ts` — Zod 検証スキーマ
- `src/services/<domain>.ts` — ビジネスロジック
- `prisma/migrations/` — DB マイグレーション (commit 必須)
- `tests/integration/<resource>.test.ts` — 統合テスト
- `tests/e2e/<flow>.spec.ts` — E2E テスト

## コマンド

- `pnpm dev` — 開発サーバー (port 3000)
- `pnpm test` — 単体 + 統合テスト
- `pnpm test:e2e` — E2E テスト (Playwright)
- `pnpm db:migrate` — 開発 DB にマイグレーション適用
- `pnpm db:reset` — 開発 DB をリセット (seed データ込み)
- `pnpm lint` — ESLint + Prettier チェック (pre-commit でも走る)

## コンテキスト読み込み方針

このプロジェクトは「常時必要な事実」と「特定の場面で必要な手順」を分けて管理する。

- **常時必要な事実** → このファイル (CLAUDE.md) に書く
- **特定のファイル種別で必要なルール** → `.claude/rules/<topic>.md` に書く (`paths:` frontmatter 付き、該当ファイル開いた時だけ読まれる)
- **呼び出し型の手順** → `.claude/skills/<name>/SKILL.md` に書く (呼び出した時だけ読まれる)

詳細:

- API 規約 → `.claude/rules/api.md` (paths: `src/api/**`)
- テスト規約 → `.claude/rules/tests.md` (paths: `**/*.test.ts`)
- セキュリティ規約 → `.claude/rules/security.md` (paths: `src/api/handlers/auth/**`)
- デプロイ手順 → `/deploy` Skill で呼び出す
- DB マイグレーション手順 → `/migrate` Skill で呼び出す

## CLAUDE.md のメンテナンス

このファイルは **200 行以下** を維持する。

- 新しい規約を追加するとき: まず「常時必要か?」を問う
  - YES → このファイルに追記 (10 行以内に圧縮)
  - NO → `.claude/rules/<topic>.md` か `.claude/skills/<name>/SKILL.md` に書く
- 既存項目を見直すとき: 「直近 1 ヶ月でこの規約が原因で Claude が間違えたか?」を問う
  - YES → 残す
  - NO → 削除候補 (`.claude/rules/` に降格 or 完全削除)

`@import` での分割は **管理単位を整理する目的のみ** で使う。コンテキスト削減目的では使わない (展開後の合計トークンは変わらない)。
