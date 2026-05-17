---
name: deploy
description: Deploy the application to staging or production. Use when the user asks to deploy, release, or push to staging/production.
disable-model-invocation: true
---

# Deploy

> Skill。**呼び出した時 (`/deploy` または該当する依頼) だけ** コンテキストに読み込まれる。
> 起動時には読まれない (公式 docs `skills.md` の「使うときだけ読まれる」)。
> `disable-model-invocation: true` で自動呼び出しを禁止し、ユーザーの明示的な指示時のみ実行。

## 前提

- main ブランチが green (CI 全 PASS)
- ステージングで QA 完了 (本番デプロイの場合)
- 金曜 17 時以降 / 大型キャンペーン期間中でないこと (緊急時を除く)

## ステージングデプロイ (自動)

1. PR を main にマージ
2. GitHub Actions が自動でステージング (Vercel) にデプロイ
3. デプロイ完了後、Slack `#staging-deploys` に通知が来る
4. ステージング URL で動作確認

## 本番デプロイ手順

1. **タグ作成**:
   ```bash
   git checkout main && git pull
   git tag -a v1.X.Y -m "Release v1.X.Y"
   git push origin v1.X.Y
   ```

2. **本番デプロイ承認**:
   - Slack `#releases` で `@oncall` に「v1.X.Y を本番デプロイ可」と確認
   - 承認後、GitHub Actions の workflow_dispatch から `production-deploy` を手動実行

3. **DB マイグレーション (該当時のみ)**:
   - migration が含まれる場合は CI 上で承認ダイアログが出る
   - 「Approve」を押すと migration が流れた後にアプリがデプロイされる

4. **Smoke テスト** (5 分以内):
   ```bash
   pnpm test:e2e:smoke
   ```

5. **監視確認** (デプロイ後 30 分):
   - [ ] Sentry でエラー急増していないか
   - [ ] Datadog で p95 レスポンスタイム劣化していないか
   - [ ] Better Uptime の死活監視 OK

6. **リリースノート公開**:
   - GitHub Releases で自動生成 + 手動編集
   - `#releases` に投稿

## ロールバック

エラー急増・p95 劣化が観測された場合:

1. Vercel ダッシュボードで前回のデプロイメントに rollback
2. DB スキーマが変わっている場合は migration もロールバック (`pnpm db:migrate:down`)
3. `#incident` チャンネルでインシデント宣言
4. Sentry でエラーが収まったか確認
5. 後日ポストモーテム (`docs/postmortems/YYYY-MM-DD.md`)

## デプロイブロック条件

以下のいずれかに該当する場合、デプロイを中止する:

- main ブランチで CI が red
- ステージングで QA 未完了
- DB マイグレーションのレビュー未完
- 金曜 17 時以降 (緊急時除く)
- 大型キャンペーン期間中で oncall の事前承認なし
