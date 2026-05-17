# デプロイ手順

> このファイルは CLAUDE.md から @docs/deployment-notes.md として参照される。
> **起動時に CLAUDE.md と一緒に展開される。**

## デプロイフロー全体

1. PR を main にマージ
2. GitHub Actions が CI を実行 (lint / test / build)
3. CI 成功でステージングに自動デプロイ (Vercel)
4. ステージングで手動 QA
5. リリースタグ作成 (`v1.2.3` 形式)
6. 本番デプロイ承認 (Slack で oncall に確認依頼)
7. 本番デプロイ (Vercel)
8. Smoke テスト (Playwright で 5 分以内)
9. リリースノート公開 (GitHub Releases)

## 環境

- **dev**: 各開発者のローカル (Docker Compose)
- **staging**: PR マージで自動デプロイ、QA 用
- **production**: タグプッシュ + 手動承認

## 環境変数

`Vercel` のダッシュボードで環境ごとに設定。secrets は 1Password から手動コピー。

```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
JWT_PRIVATE_KEY=-----BEGIN...
JWT_PUBLIC_KEY=-----BEGIN...
SENTRY_DSN=https://...
STRIPE_SECRET_KEY=sk_live_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## DB マイグレーション

- Prisma Migrate を使用
- マイグレーションファイルは `prisma/migrations/` に commit
- ステージング: PR マージ後の CI で自動実行
- 本番: タグプッシュ後の CI で手動承認後に実行
- ロールバック: 前バージョンの migration を手動で実行 + アプリも前バージョンに戻す

## ロールバック手順

1. Vercel ダッシュボードで前回のデプロイメントに rollback
2. DB スキーマが変わっている場合は migration もロールバック
3. Sentry でエラーが収まったか確認
4. ポストモーテム記入 (`/docs/postmortems/YYYY-MM-DD.md`)

## 監視

- Sentry: エラー監視 (5xx は即 Slack 通知)
- Datadog: APM (レスポンスタイム / DB クエリ / 外部 API 呼び出し)
- Better Uptime: 死活監視 (1 分間隔、3 連続失敗で oncall に電話)
- Logflare: 構造化ログ集約

## アラート閾値

- 5xx エラー率: 1% 超で warning, 5% 超で critical
- p95 レスポンスタイム: 500ms 超で warning, 1000ms 超で critical
- DB 接続プール枯渇: 90% 超で warning, 100% で critical
- Redis レイテンシ: 50ms 超で warning, 200ms 超で critical

## オンコール

- 平日 9-18: backend-team の輪番
- それ以外: ops-team の輪番
- PagerDuty で割り当て・通知
- インシデント発生時は #incident チャンネルで宣言

## デプロイブロック条件

- main ブランチで CI が red
- ステージングで QA 未完了
- DB マイグレーションがレビュー未完
- 金曜 17 時以降 (緊急時を除く)
- 大型キャンペーン期間中 (リスクが高い変更は事前に計画)

## キャッシュ無効化

- CloudFront キャッシュ: デプロイ時に自動 invalidate (`/*`)
- アプリ側 Redis キャッシュ: 必要に応じて手動 (`FLUSHDB` または特定キー削除)
- ブラウザキャッシュ: アセットに hash 付与で自動

## 機密情報の取り扱い

- 1Password 経由で共有 (Slack/メール禁止)
- ローテーション: JWT 鍵は 90 日、DB パスワードは 180 日、外部 API キーはサービス指定に従う
- ローテーション後は全環境の Vercel に反映 + アプリ再デプロイ

## デプロイ後チェックリスト

- [ ] Sentry でエラー急増していないか
- [ ] Datadog で p95 レスポンスタイム劣化していないか
- [ ] Smoke テストが全 PASS か
- [ ] Slack の #releases にリリースノート投稿したか
- [ ] Jira チケットを "Done" に移動したか
