# CLAUDE.md

このプロジェクトは Web アプリケーションです。Next.js + PostgreSQL を使っています。

`npm test` でテストを実行できます。`npm run deploy` で本番デプロイです。

## 自動モード運用ルール

このセッションは auto モードで進めますが、以下は守ってください。

- 本番デプロイ (`npm run deploy` 含む) は、毎回明示的に確認を求めてください。
- `git push` する前に、push 先ブランチを必ず宣言してください。`main` への直接 push は禁止。
- データベースのマイグレーションは、確認なしに実行しないでください。
- `.env` ファイルの内容を読むときは、その目的を明示してください。

これらは Anthropic Engineering Blog "permission-modes.md" L82-84 の Conversational
boundary として機能します。auto モードの分類器はこの会話の境界をブロック信号として
扱います。
