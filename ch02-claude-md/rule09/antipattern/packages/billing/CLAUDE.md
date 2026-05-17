# CLAUDE.md (packages/billing)

billing サービスです。Stripe の決済処理を担当します。

## コーディング規約

- import は CommonJS (`const x = require('y')`) を使う
- TypeScript は使わない (JavaScript ES2020)
- パッケージマネージャは npm
- テストは `npm test` (Vitest)
- 本番に影響するため main 直接 push 禁止
- コミットメッセージは Conventional Commits 必須

## レビュー

- PR レビュー必須 (2 名以上)
- セキュリティチームの承認も必要
