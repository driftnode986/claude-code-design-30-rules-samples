# コードスタイル

> このファイルは CLAUDE.md から @rules/code-style.md として参照される。
> **起動時に CLAUDE.md と一緒に展開される。**

## TypeScript

- `strict: true` 必須 (tsconfig.json)
- `noUncheckedIndexedAccess: true` 必須
- `noImplicitAny: true` 必須
- `any` の使用は ESLint で禁止 (`@typescript-eslint/no-explicit-any`)
- `as` 型アサーションは原則禁止、必要な場合は理由をコメント
- `unknown` を優先し、型ガードで絞り込む

## 命名規則

- 変数・関数: camelCase (`getUserById`, `userName`)
- 型・インターフェース: PascalCase (`User`, `UserPreferences`)
- 定数: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS`)
- ファイル: kebab-case (`user-service.ts`, `auth-middleware.ts`)
- React コンポーネントファイル: PascalCase (`UserProfile.tsx`)

## インポート順序

1. Node.js builtins (`fs`, `path`)
2. 外部パッケージ (`react`, `lodash`)
3. 内部パッケージ (`@myorg/shared`)
4. 相対インポート (`./utils`, `../types`)

各グループ間は空行 1 行。ESLint の `import/order` で自動修正。

## 関数

- アロー関数を優先 (`const foo = () => { ... }`)
- 例外: クラスメソッド、generator (`function*`)
- 引数 4 つ以上はオブジェクト引数に変更
- デフォルト引数を活用 (`function foo({ retries = 3 } = {}) { ... }`)
- 副作用のある関数名は動詞で開始 (`fetchUser`, `updatePassword`)
- 純粋関数 (getter) は名詞 + 形容詞 (`isValid`, `userId`)

## クラス vs 関数

- ステートを持たない処理は関数で
- ステートを持つ + ライフサイクルがある → クラス (Service クラスなど)
- DI は constructor injection を優先

## エラーハンドリング

- カスタムエラークラスを使う (`class ValidationError extends Error`)
- エラーには `code` プロパティを持たせる (`new ValidationError({ code: 'INVALID_EMAIL' })`)
- `try-catch` で握りつぶさない (再 throw or ログ + 構造化レスポンス)
- 期待される失敗は Result 型で表現 (`Result<T, E>`)

## async/await

- Promise チェーンより async/await を優先
- 並列実行は `Promise.all` を活用
- エラー処理が必要な並列は `Promise.allSettled`
- ループ内の await は意図的にのみ使用 (順序保証が必要な場合)

## React

- 関数コンポーネントのみ (クラスコンポーネント禁止)
- カスタムフックは `use` プレフィックス必須 (`useAuth`, `useDebounce`)
- `useEffect` の依存配列を省略しない
- props は型を必ず定義 (`type Props = { ... }`)
- 1 コンポーネント 1 ファイル

## CSS

- Tailwind CSS を優先
- カスタム CSS は CSS Modules (`*.module.css`)
- 色は Tailwind の theme で定義 (`tailwind.config.ts`)
- レスポンシブは Tailwind breakpoints (`sm:`, `md:`, `lg:`)

## コメント

- WHY を書く (WHAT は型名・関数名で表現)
- 公開 API には JSDoc コメント
- TODO/FIXME には Jira チケット番号を付ける (`// TODO(PROJ-123): refactor`)
- コミット前に古いコメントを削除

## フォーマッタ

- Prettier (`.prettierrc` で設定共有)
- ESLint (`@typescript-eslint/recommended` + 内部ルール)
- pre-commit で lint-staged 実行
