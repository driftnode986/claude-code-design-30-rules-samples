# CLAUDE.md (packages/billing)

billing サービス。Stripe 決済処理を担当する。

ルート CLAUDE.md の「全サービス共通の絶対規約」を継承する
(pnpm / main 直接 push 禁止 / Conventional Commits)。本ファイルは
billing 固有の規約だけを書く。

## billing 固有のコーディング

- 言語: JavaScript ES2020 (TypeScript への移行は別 RFC で検討中)
- import: CommonJS (本サービスは v1 当時の選択を維持)
- テスト: Vitest (`pnpm vitest run`)
  - 注意: `npm test` ではない (ルートの pnpm に統一)

## billing 固有のレビュー要件

- PR レビュー必須 (2 名以上)
- セキュリティチームの承認も必要 (決済コードのため)
- main マージは `release/billing-v*` タグ作成と同時に行う
