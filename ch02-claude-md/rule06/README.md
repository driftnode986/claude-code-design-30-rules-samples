# Rule 06: CLAUDE.md は 200 行以内に保て

書籍『Claude Code 設計の30の鉄則』 Rule 06 のサンプルです。

## ファイル

- `antipattern/CLAUDE.md`: 約 120 行に肥大化した CLAUDE.md。
  Claude が当然知っているコーディング標準、自明な good practice、
  コードから推測可能な情報が大量に並んでいる
- `fixed/CLAUDE.md`: 約 40 行に絞り込んだ版。
  プロジェクト固有のコマンド・レイアウト・罠だけを残す
- `fixed/.claude/rules/code-style.md`: 詳細な TypeScript/React 規約は
  `paths` スコープルールに切り出した。`src/**/*.{ts,tsx}` を読む
  ときだけ Claude のコンテキストに注入される

## 検証

```
# CLAUDE.md の行数を数える (空行・コメント除く)
grep -c -v -E '^\s*(#|$)' antipattern/CLAUDE.md
grep -c -v -E '^\s*(#|$)' fixed/CLAUDE.md
```

- antipattern: 80 行超
- fixed: 30 行前後 (paths スコープルールを除く)

## 検証バージョン

Claude Code CLI v2.x

## 関連

- Rule 07: 削除自問テストでプルーニングする (具体的な剪定テクニック)

- Rule 09: 矛盾する指示を書くな
- Rule 10: @import は起動時コンテキストを減らさない
