# CLAUDE.md (monorepo root)

monorepo です。packages/ 配下に各サービスが入っています。

## コーディング規約

- import は ES Modules (`import x from 'y'`) を使う
- TypeScript strict モード
- パッケージマネージャは pnpm
- テストは `pnpm test` (Jest)
- main ブランチに直接 push してよい
- コミットメッセージは自由形式で OK

## レビュー

- レビューなしでマージしてよい
- 動けば OK
