# CLAUDE.md (example-saas-app)

TypeScript + Express + PostgreSQL の B2B SaaS バックエンド。

## 開発フロー

- ローカル起動: `docker-compose up -d && npm run dev`
- テスト: `npm test` (全件) / `npm test -- path/to/file` (個別)
- 型チェック: `npm run typecheck`
- マイグレーション作成: `npx prisma migrate dev --name <name>`

## 命名・スタイル

- ESLint + Prettier 設定済み。`npm run lint:fix` で自動整形
- TypeScript strict mode。`any` は禁止、`unknown` から narrowing する
- 関数 50 行 / ファイル 300 行を超えたら分割を検討

## 本リポジトリ固有の罠

- **Prisma 生成型と DB スキーマがずれる**: migrate 後は必ず `npx prisma generate` を走らせる。CI では generate を含めて検証している
- **テストの DB はトランザクションで rollback**: `tests/setup.ts` の `beforeEach` で `BEGIN`、`afterEach` で `ROLLBACK`。テスト内で `commit()` を呼ぶと他テストを汚染する
- **タイムゾーンは UTC で扱う**: PostgreSQL に書き込む `Date` は必ず UTC。ローカルタイムを混ぜると `created_at` の比較がずれる
- **金額は number ではなく `Decimal` (Prisma) を使う**: 浮動小数で扱うと丸め誤差。`src/utils/money.ts` の helper を使う

## ディレクトリ

```
src/controllers   # HTTP ハンドラ (薄く)
src/services      # ビジネスロジック
src/repositories  # Prisma 経由の DB アクセス
src/jobs          # BullMQ ワーカー
tests/{unit,integration,e2e}
prisma/{schema.prisma,migrations}
```

## Git

- main への直接 push 禁止。feature ブランチで PR
- PR タイトルは Conventional Commits (`feat:` `fix:` `chore:` 等)
- squash merge

## ログ・PII

- `console.log` 禁止。`src/utils/logger.ts` を使う
- メールアドレス・電話番号・カード番号はログに出さない (`logger.redact` を経由する)
- secret は `.env` でなく AWS Secrets Manager から取る (`src/config/secrets.ts`)

## 障害対応で参照する場所

- 監視: Datadog `prod-overview` ダッシュボード
- エラー: Sentry
- オンコール手順: Confluence の Runbook (URL は社内 wiki)

Confluence・JIRA・社内 Slack の詳細はここに書かない。コード作業に必要な範囲だけを置く。
