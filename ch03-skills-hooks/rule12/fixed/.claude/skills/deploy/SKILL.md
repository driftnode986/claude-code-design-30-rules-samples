---
name: deploy-checklist
description: Pre-deployment safety checklist for acme-app production releases. Use before tagging v1.X.Y and pushing to trigger GitHub Actions.
disable-model-invocation: true
---

# Deploy Checklist (acme-app)

本番デプロイ前に毎回確認するチェックリスト。`disable-model-invocation: true` のため、Claude は自動呼び出ししない。ユーザーが `/deploy-checklist` で明示的に呼び出した時のみ展開される。

## 事前確認

- [ ] main ブランチが green (CI 全 PASS)
- [ ] ステージング (staging.acme.example.com) で QA 担当が動作確認済み
- [ ] DB マイグレーションが必要なら、ロールバック SQL を事前作成済み
- [ ] 関連 PR がすべて squash merge されている
- [ ] リリースノートのドラフトを `docs/releases/v1.X.Y.md` に作成済み
- [ ] oncall (Slack #oncall) に連絡し、デプロイウィンドウを確保
- [ ] 金曜 17 時以降、または大型キャンペーン期間中ではない (緊急時は CTO 承認必須)

## デプロイ実行

```bash
git tag v1.X.Y
git push origin v1.X.Y
```

タグ push をトリガーに GitHub Actions の deploy ワークフローが Hook 的に発火する (Rule 14 で扱う「副作用の確実実行」)。Claude が手動で `vercel deploy` を実行する設計にはしない。

## デプロイ後

- [ ] smoke テスト (`npm run smoke:production`) PASS
- [ ] Datadog dashboard (acme-app-prod) を 30 分間観測
- [ ] 異常があれば `npm run rollback -- --to=v1.X.(Y-1)` で即時ロールバック
