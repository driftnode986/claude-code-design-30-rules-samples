# CLAUDE.md (cms-platform)

## コーディング原則

- クリーンなコードを書く
- DRY (Don't Repeat Yourself) を守る
- KISS (Keep It Simple, Stupid) を守る
- YAGNI (You Aren't Gonna Need It) を意識する
- SOLID 原則に従う
- 単一責任の原則を守る
- 関数は小さく保つ
- 命名は明確にする
- マジックナンバーを避ける
- グローバル変数を避ける
- 副作用を最小化する
- 早期 return を活用する
- if-else のネストを避ける
- コメントは「なぜ」を書く

## TypeScript

- 型を活用する
- any を避ける
- strict モードを使う
- 型推論に頼りすぎない
- ジェネリクスを活用する
- ユニオン型と交差型を理解する
- type と interface を使い分ける

## React

- 関数コンポーネントを使う
- フックを使う
- props drilling を避ける
- 状態管理を整理する
- Composition で組み立てる
- key prop を正しく使う
- useEffect の依存配列を正しく書く

## テスト

- テストを書く
- ユニットテストを書く
- 統合テストを書く
- E2E テストを書く
- TDD を実践する
- カバレッジを意識する

## Git

- main にマージする前にレビューを受ける
- コミットメッセージは分かりやすく書く
- 小さく頻繁にコミットする
- ブランチを切って作業する
- conflict を解決してから push する

## プロジェクト固有の設定

- パッケージマネージャは pnpm を使う (npm/yarn ではない)
- テストランナは `pnpm vitest run` (Jest ではない)
- DB マイグレーションは `pnpm drizzle-kit push` で実行する
- 画像は `next/image` で扱い、`<img>` タグは使わない
- 認証は `lib/auth.ts` の `verifySession()` を経由する

## 重要な注意事項

- セキュリティに気をつける
- パフォーマンスに気をつける
- アクセシビリティに気をつける
- 国際化に気をつける
- SEO に気をつける

## デプロイ

- 本番デプロイは慎重に行う
- 環境変数を正しく設定する
- ログを適切に出力する
- エラー監視を行う
- バックアップを取る
