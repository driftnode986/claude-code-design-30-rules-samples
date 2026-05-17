---
name: deploy
description: Deploy the application. Use this when the user wants to deploy.
---

# Deploy (anti-pattern: 副作用なのに Skill 化)

> 副作用 (本番デプロイ) なのに Skill にしている。
> Claude が呼び忘れる・誤って呼ぶ可能性がある。
> **正解は: 重要な副作用は Hook で発火条件を明示する** (例: タグ push を契機に GitHub Actions が走る)。
> Skill にしてよいのは「呼び出し型のチェックリスト・知識注入」だけ。

## 手順

1. main ブランチが green か確認
2. `npm run build` 実行
3. `npm run deploy:production` 実行
4. Smoke テスト実行

(Claude が「3 を飛ばす」「4 を飛ばす」可能性がある。確実実行が必要な工程は Hook で固める)
