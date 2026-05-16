# CLAUDE.md (example-saas-app)

このリポジトリは弊社の SaaS バックエンド (TypeScript + Express + PostgreSQL) です。Claude Code で作業するときは以下を必ず守ってください。

## 会社情報

- 社名: 株式会社サンプル (Sample Inc.)
- 設立: 2018 年 4 月
- 本社: 東京都渋谷区
- 従業員数: 約 80 名
- 主要事業: B2B SaaS の開発・運用
- 主要プロダクト: example-saas-app (本リポジトリ) / example-mobile-app (別リポジトリ)
- 親会社: なし
- 上場: 未上場
- 決算月: 3 月

## 開発チーム体制

- バックエンドチーム: 12 名 (うちシニア 4 名)
- フロントエンドチーム: 8 名
- SRE チーム: 3 名
- QA チーム: 2 名
- マネージャー: 田中 (Slack: @tanaka)
- テックリード: 佐藤 (Slack: @sato)
- アーキテクト: 鈴木 (Slack: @suzuki)
- セキュリティ担当: 高橋 (Slack: @takahashi)

## 過去の主要決定 (Architecture Decision Records 抜粋)

### ADR-001: TypeScript 採用 (2018-06)
JavaScript ではなく TypeScript を採用。型による保守性を優先。

### ADR-002: Express 採用 (2018-07)
Koa / Hapi / Fastify を検討した結果、Express を採用。エコシステムの厚みを重視。

### ADR-003: PostgreSQL 採用 (2018-08)
MySQL / DynamoDB / MongoDB と比較。トランザクション・JSON 型・全文検索の総合点で PostgreSQL を採用。

### ADR-004: ORM に Prisma 採用 (2020-03)
当初 TypeORM を使っていたが、マイグレーション体験と型生成の質で Prisma に移行。

### ADR-005: Jest 採用 (2018-09)
Mocha / Jasmine と比較し、Jest を採用。snapshot テスト・並列実行・mock 機能の充実が決め手。

### ADR-006: ESLint 設定 (2018-10)
Airbnb スタイルガイドをベースに、社内で 15 個のルールを追加。

### ADR-007: Docker Compose 採用 (2019-01)
ローカル開発環境は docker-compose で統一。

### ADR-008: GitHub Actions 採用 (2020-06)
CircleCI から GitHub Actions に移行。料金とリポジトリとの統合性で決定。

### ADR-009: AWS 採用 (2018-04)
GCP / Azure と比較し、AWS を採用。

### ADR-010: ECS Fargate 採用 (2019-08)
EKS と比較し、運用負荷の低さから Fargate を選択。

## コーディング規約 (全 87 項目)

1. インデントはスペース 2 個
2. セミコロン必須
3. シングルクォート使用
4. アロー関数は引数 1 個でも括弧をつける
5. 文字列リテラルにテンプレートリテラルを優先
6. const を default、let は再代入時のみ
7. var は完全禁止
8. any 型は ESLint で警告
9. 関数の戻り値型は明示
10. interface は I プレフィックスをつけない
11. 型エイリアスは PascalCase
12. enum は使わず const assertion を使う
13. async 関数の戻り値は Promise<T> で型注記
14. Promise.all を積極的に使う
15. for-of は OK、for-in は禁止
16. == は禁止、=== のみ
17. null と undefined は区別する
18. オブジェクト分割代入を優先
19. 関数の引数は 3 個まで
20. 引数が 4 個以上なら options オブジェクトに
21. 関数は 50 行以内
22. ファイルは 300 行以内
23. クラスは extends を 1 段までに
24. 継承より composition
25. interface の prop は readonly を default
26. 配列型は T[] ではなく Array<T>
27. switch には必ず default
28. try-catch でキャッチしたら必ずログ
29. console.log は禁止、logger を使う
30. magic number は const に
(続く 87 項目...)

## Git ワークフロー

- main ブランチへの直接 push 禁止
- feature ブランチ命名: `feature/JIRA-XXX-description`
- bugfix ブランチ命名: `bugfix/JIRA-XXX-description`
- hotfix ブランチ命名: `hotfix/JIRA-XXX-description`
- PR テンプレートを使用 (`.github/PULL_REQUEST_TEMPLATE.md` 参照)
- レビュアー 2 名以上の approve が必要
- main へのマージは squash merge
- PR タイトルは Conventional Commits 準拠
- PR description には背景・変更内容・テスト方法を必ず書く
- WIP PR は draft 状態に
- リベース戦略: feature ブランチは main から rebase
- マージ前に CI が全 green であること
- マージ後、ブランチは自動削除

## 過去の障害事例 (postmortem サマリー)

### 障害-001: 2022-03-15 認証 API のレイテンシ悪化
原因: bcrypt のラウンド数を 10 → 14 に変更したことで CPU 負荷増
対応: ラウンド数を 12 に戻し、PBKDF2 への段階移行を計画

### 障害-002: 2022-07-22 決済処理の二重課金
原因: Idempotency Key の検証漏れ
対応: 全決済 API に Idempotency Key を必須化

### 障害-003: 2022-11-08 DB コネクションプール枯渇
原因: 長時間トランザクション + connection pool 設定が小さい
対応: pool max を 20 → 50、長時間 tx の検知 alert 追加

### 障害-004: 2023-02-10 S3 へのアップロード失敗
原因: IAM ロールのポリシー更新ミス
対応: terraform で IAM 管理を一元化

### 障害-005: 2023-05-19 ログイン失敗多発
原因: Redis のメモリ上限到達でセッション lost
対応: ElastiCache のインスタンスサイズを upgrade

(障害 #006 〜 #047 続く)

## デプロイ手順

1. main ブランチに PR をマージ
2. GitHub Actions の build ジョブが成功するのを待つ (約 8 分)
3. staging 環境に自動デプロイ (build ジョブ完了 1 分後)
4. staging で smoke test (手動、約 15 分)
5. QA チームに連絡 (Slack #qa-deploy)
6. QA OK 後、本番デプロイ承認 PR を作成
7. 承認 PR には SRE 1 名・テックリード 1 名の approve 必要
8. 承認後、release タグを切る (例: v1.234.5)
9. 本番デプロイ Action が release タグ作成で自動起動
10. デプロイ完了通知が #deploy-prod に来るのを待つ
11. 本番 smoke test (手動)
12. 監視ダッシュボード 30 分張り付き
13. 異常なければ Slack #release-log に完了報告
14. JIRA チケットを Done に
15. Confluence にリリースノート追記

## モニタリング・アラート

- Datadog ダッシュボード: prod-overview / api-latency / db-health / queue-depth
- PagerDuty オンコール: 平日昼は SRE チーム、夜間休日は当番制
- アラート閾値:
  - API p95 レイテンシ > 500ms (5 分継続) → Slack
  - API エラー率 > 1% (5 分継続) → PagerDuty
  - DB CPU > 80% (10 分継続) → Slack
  - DB connection 残り < 20 → PagerDuty
  - キュー積み残り > 10000 → Slack
  - キュー積み残り > 50000 → PagerDuty

## 社内ツール一覧

- Slack: コミュニケーション
- JIRA: タスク管理
- Confluence: ドキュメント
- GitHub: ソースコード
- 1Password: パスワード
- AWS Console: インフラ
- Datadog: 監視
- PagerDuty: オンコール
- Sentry: エラー追跡
- LaunchDarkly: フィーチャーフラグ
- Stripe: 決済
- SendGrid: メール送信
- Twilio: SMS / 通話
- Cloudflare: CDN / WAF
- Auth0: 認証 (一部のレガシー API のみ)

## 開発環境セットアップ (新人向け)

1. 1Password に招待される
2. GitHub Organization に招待される
3. AWS の SSO アカウント発行
4. Slack に招待
5. JIRA / Confluence のアカウント発行
6. ローカルマシンに以下をインストール:
   - Node.js 20.x (nvm 推奨)
   - Docker Desktop
   - PostgreSQL クライアント (psql)
   - AWS CLI v2
   - direnv
7. リポジトリ clone
8. `.env.example` をコピーして `.env` を作成
9. `npm install`
10. `docker-compose up -d` で DB / Redis 起動
11. `npm run db:migrate` でマイグレーション
12. `npm run db:seed` でテストデータ投入
13. `npm run dev` で起動
14. http://localhost:3000/health で 200 が返れば OK

## 主要 npm scripts

- `npm run dev` — 開発サーバー起動 (ts-node-dev)
- `npm run build` — TypeScript ビルド
- `npm run start` — 本番起動 (build 後)
- `npm run test` — Jest テスト全件
- `npm run test:watch` — Jest watch モード
- `npm run test:coverage` — カバレッジ計測
- `npm run lint` — ESLint
- `npm run lint:fix` — ESLint auto-fix
- `npm run format` — Prettier 整形
- `npm run typecheck` — tsc --noEmit
- `npm run db:migrate` — Prisma migrate
- `npm run db:seed` — テストデータ投入
- `npm run db:reset` — DB リセット
- `npm run docker:up` — docker-compose up
- `npm run docker:down` — docker-compose down

## ディレクトリ構成

```
src/
├── controllers/   # HTTP ハンドラ
├── services/      # ビジネスロジック
├── repositories/  # DB アクセス層
├── models/        # 型定義
├── middlewares/   # Express ミドルウェア
├── utils/         # ユーティリティ
├── config/        # 設定
├── jobs/          # キューワーカー
├── events/        # ドメインイベント
└── index.ts       # エントリポイント

tests/
├── unit/
├── integration/
└── e2e/

prisma/
├── schema.prisma
└── migrations/

scripts/
├── deploy/
└── maintenance/
```

## チームの暗黙ルール

- PR レビューは原則 24 時間以内に返す
- 緊急時は Slack で「:fire:」リアクション
- 朝会は毎日 10:00 から 15 分
- 振り返りは隔週金曜 16:00 から 1 時間
- リリースは原則木曜
- 金曜午後のリリースは禁止
- 連休前日のリリースは禁止
- ペアプロは推奨だが必須ではない
- ドキュメントは Confluence、コードコメントは英語
- TODO コメントには JIRA チケット番号を必須
- FIXME コメントは PR で必ず潰す
- ログには PII (個人情報) を絶対に出さない
- secret は GitHub Secrets / AWS Secrets Manager 以外に置かない

## 過去の社内勉強会まとめ (一部)

- 2023-Q1: TypeScript 型パズル入門
- 2023-Q2: PostgreSQL クエリ最適化
- 2023-Q3: React Server Components
- 2023-Q4: AWS コスト最適化
- 2024-Q1: マイクロサービス入門
- 2024-Q2: GraphQL vs REST
- 2024-Q3: Kubernetes 入門
- 2024-Q4: Observability 入門
- 2025-Q1: AI Coding ツール比較
- 2025-Q2: Claude Code 導入記
- 2025-Q3: マルチエージェントシステム
- 2025-Q4: Effective context engineering

## 関連リポジトリ

- example-mobile-app (React Native)
- example-admin (Next.js)
- example-terraform (IaC)
- example-shared-types (型定義の monorepo パッケージ)
- example-data-pipeline (ETL ジョブ)

## ライセンス情報

社内コードのため非公開。利用には NDA が必要。
