# CLAUDE.md (next-shop)

## プロジェクト固有のコマンド

- 依存追加: `pnpm add <pkg>` (npm/yarn は使わない)
- 開発サーバー起動: `pnpm dev`
- テスト実行: `pnpm vitest run --reporter=verbose`
  - 単一ファイル: `pnpm vitest run src/lib/cart.test.ts`
- DB マイグレーション: `pnpm prisma migrate dev --name <slug>`
- 型チェック: `pnpm typecheck` (push 前に必ず実行)

## プロジェクト固有のレイアウト

- API ハンドラ: `src/app/api/<resource>/route.ts`
- DB スキーマ: `prisma/schema.prisma` (1 ファイル運用)
- 共通ロジック: `src/lib/`、UI 部品: `src/components/`
- カート同期は `src/lib/cart-sync.ts` のみで行う (他から書き換え禁止)

## プロジェクト固有の罠

- Stripe webhook の署名検証は `src/app/api/stripe/webhook/route.ts` で
  `req.text()` のままで実行すること。`req.json()` で読むと署名が壊れる
- NextAuth セッションは `auth()` ヘルパー経由で取得する。
  `getServerSession()` は v5 で deprecated
- Cloudinary 画像は `next/image` の `loader` を必ず使う。
  デフォルトの `<img>` だと Vercel の帯域課金が跳ねる

## 詳細ルール (paths スコープ)

- TypeScript / React コーディングルール: `.claude/rules/code-style.md`
- API ハンドラ規約: `.claude/rules/api-handlers.md`
- テスト規約: `.claude/rules/testing.md`

## Git とデプロイ

- ブランチ: `feature/<slug>` (main 直接 push 禁止)
- コミット: Conventional Commits (`feat:` `fix:` `chore:` 等)
- main マージで Vercel が自動デプロイ。preview URL でレビューする
