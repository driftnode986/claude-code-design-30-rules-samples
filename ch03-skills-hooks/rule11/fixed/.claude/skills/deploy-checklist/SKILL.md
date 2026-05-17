---
name: deploy-checklist
description: Pre-deployment safety checklist. Use when the user is about to deploy and needs to verify prerequisites.
disable-model-invocation: true
---

# Deploy Checklist (Skill が正解: 知識注入)

> Skill は **呼び出された時だけ** 親ウィンドウに展開される知識注入の仕組み。
> 「デプロイ前に毎回参照したいチェックリスト」のような **静的な手順書** に最適。
> 3 軸での判定: **再利用 (知識注入)** に該当 → Skill 正解。

## デプロイ前チェックリスト

- [ ] main ブランチが green (CI 全 PASS)
- [ ] ステージングで QA 完了 (本番の場合)
- [ ] DB マイグレーションが必要な場合、ロールバック手順を確認した
- [ ] 関連 PR がすべて squash merge されている
- [ ] リリースノートのドラフトを準備した
- [ ] oncall に連絡済み (本番の場合)
- [ ] 金曜 17 時以降 / 大型キャンペーン期間中でない (緊急時除く)

実際のデプロイ自体は `git push origin v1.X.Y` をトリガーに GitHub Actions が **Hook 的に確実発火** する設計になっている。
このスキルは「人間が判断する」部分のチェックだけを扱う。
