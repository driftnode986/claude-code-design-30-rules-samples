# CLAUDE.md (analytics-platform)

Node.js + TypeScript + PostgreSQL の分析基盤です。

## 開発

- パッケージマネージャ: pnpm
- テスト: `pnpm test`
- ビルド: `pnpm build`

## コーディング

- TypeScript strict モード
- async/await を使う
- 早期 return を活用
- エラーは適切にハンドリング

## デプロイ

- main マージで Vercel に自動デプロイ
- 環境変数は Vercel Dashboard で管理
- preview デプロイで確認

## レビュー

- PR は最低 1 名のレビューを受ける
- 大きな変更は事前に Slack で共有

## ドキュメント

- README を最新に保つ
- API の変更はドキュメントも更新
