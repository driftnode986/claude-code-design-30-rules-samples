---
name: heavy-refactor
description: Use when the user wants a large structural refactor across multiple modules
effort: max
---

# Heavy Refactor

このスキルは、複数モジュールにまたがる大きな構造変更 (クラス階層の再設計、
state 管理の置換、3 ファイル以上にまたがる責務再配置) のときだけ使ってください。

`effort: max` フロントマターで一時的に最高 effort に切り替わります。スキルが終わると
セッションの effort に戻ります。`max` は overthinking 傾向があるので、簡単な変更には
使わないでください。

## 進め方

1. 影響範囲を `grep -rn` で全件洗い出す
2. 各箇所の現行設計の意図を 1 行ずつメモ
3. 新設計を提示してユーザー確認
4. 確認後に MultiEdit で一括適用
