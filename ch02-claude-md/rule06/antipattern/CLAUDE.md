# CLAUDE.md (next-shop)

## プロジェクト概要

next-shop は Next.js 14 (App Router) と Prisma で構築された
EC サイトです。フロントエンドは Tailwind CSS と shadcn/ui を使用し、
バックエンドは Vercel Postgres にデプロイされています。
画像は Cloudinary に保存され、決済は Stripe で処理されます。
ユーザー認証は NextAuth.js の Email Provider を使用します。
セッションは JWT 方式で 7 日間有効です。
カートデータは LocalStorage に保存され、注文時に DB に同期されます。

## コーディング標準

- TypeScript の strict モードを有効にする
- ESLint と Prettier を使用してコードをフォーマットする
- import は ES Modules を使用する (require は使わない)
- 関数は const アロー関数で定義する
- React コンポーネントは関数コンポーネントで書く
- props には interface を使用する (type ではなく)
- variable は camelCase、コンポーネントは PascalCase
- ファイル名は kebab-case
- 1 ファイル 1 コンポーネントの原則
- 関数の長さは 50 行以内を目安にする
- ネストは 3 段以下に抑える
- マジックナンバーは定数に切り出す
- 早期 return パターンを使用する
- if-else より switch-case を優先する
- async/await を使い Promise.then は避ける
- try-catch でエラーをハンドリングする
- console.log は本番環境では使用しない
- 変数は const で宣言する、let は最後の手段
- var は絶対に使用しない
- 関数は単一責任の原則に従う
- DRY 原則を守る
- KISS 原則を守る
- YAGNI を意識する

## React のベストプラクティス

- useState は最小限に使用する
- useEffect の依存配列を正しく書く
- useCallback でメモ化する
- useMemo で計算結果をキャッシュする
- Context API でグローバル状態を管理する
- カスタムフックでロジックを抽出する
- コンポーネントは Composition で組み立てる
- props drilling を避ける
- key prop を必ず指定する
- インデックスを key にしない
- ref は forwardRef で扱う
- Suspense でローディング状態を管理する
- Error Boundary でエラーを catch する
- Server Components と Client Components を使い分ける
- "use client" ディレクティブを適切に配置する

## TypeScript のベストプラクティス

- any 型は使用しない
- unknown を使って型を絞り込む
- ジェネリクスで再利用性を高める
- ユニオン型と交差型を活用する
- 型ガードを書く
- satisfies 演算子を使う
- as による型アサーションは最小限に
- enum より const assertion を優先する
- Readonly で immutability を保証する
- Pick / Omit で型を派生させる

## Git ワークフロー

- feature ブランチで作業する
- コミットメッセージは Conventional Commits に従う
- PR を作成してレビューを受ける
- main にマージする前にテストを通す
- rebase より merge を使う
- squash merge でコミット履歴を整理する

## テスト

- Jest と React Testing Library を使用する
- ユニットテストを書く
- 統合テストを書く
- E2E テストは Playwright を使用する
- カバレッジ 80% 以上を目指す
- TDD を実践する

## API ハンドラー

- API ルートは src/app/api/ に配置する
- HTTP メソッドごとに関数をエクスポートする
- リクエストボディは zod でバリデーションする
- レスポンスは Next.js の NextResponse を使う
- エラーは適切な HTTP ステータスコードで返す

## デプロイ

- Vercel にデプロイする
- 環境変数は Vercel の Dashboard で管理する
- preview デプロイで動作確認する
- main へのマージで自動デプロイする
