# CLAUDE.md (cms-platform)

## プロジェクト固有のコマンド

- パッケージマネージャ: pnpm (npm/yarn は使わない)
- テスト: `pnpm vitest run` (単一ファイル指定推奨)
- DB マイグレーション: `pnpm drizzle-kit push`

## プロジェクト固有の罠

- 画像は `next/image` で扱う。`<img>` タグは Vercel 帯域が跳ねる
- 認証は `lib/auth.ts` の `verifySession()` を経由する。
  `headers().get('cookie')` を直接読むコードは過去の遺物
- `drizzle-kit push` は破壊的変更を生成しうる。
  本番 DB には必ず `pnpm drizzle-kit generate` でマイグレーション
  ファイルを作ってからレビューを通すこと

## 詳細ルール

- コーディング規約: `.claude/rules/code-style.md`
- テスト方針: `.claude/rules/testing.md`
