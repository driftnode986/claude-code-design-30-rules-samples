# CLAUDE.md (monorepo root)

monorepo (packages/ 配下に各サービス)。各サービス固有の規約は
`packages/<service>/CLAUDE.md` に書く。本ファイルは「全サービス共通
かつ、サービス側で上書き禁止」の規約だけを書く。

## 全サービス共通の絶対規約 (上書き禁止)

- パッケージマネージャ: pnpm (`pnpm-workspace.yaml` 管理)
  - 各サービスで npm/yarn を使うことは禁止する
- main 直接 push 禁止 (CODEOWNERS 必須)
- コミットメッセージ: Conventional Commits

## サービス側で決めてよい事項 (各 packages/<svc>/CLAUDE.md 参照)

- TypeScript / JavaScript の選択
- import スタイル (ES Modules / CommonJS)
- テストランナの選択
- レビュー要件 (人数、承認者)
