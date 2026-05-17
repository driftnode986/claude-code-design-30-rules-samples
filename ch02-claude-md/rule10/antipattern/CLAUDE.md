# CLAUDE.md (rule10-antipattern)

> 「短くしたつもり」の CLAUDE.md。実体は @import で 6 ファイル合計 589 行が起動時に展開される。

## プロジェクト概要

このリポジトリは Next.js + TypeScript の SaaS バックエンド。

詳細は以下の分割ファイルを参照:

- API 規約: @docs/api-conventions.md
- Git ワークフロー: @docs/git-workflow.md
- テスト規約: @docs/testing-rules.md
- デプロイ手順: @docs/deployment-notes.md
- コードスタイル: @rules/code-style.md
- セキュリティ チェックリスト: @rules/security-checklist.md

## 補足

- TypeScript strict mode 必須
- ESLint + Prettier 適用
- PR は squash merge
