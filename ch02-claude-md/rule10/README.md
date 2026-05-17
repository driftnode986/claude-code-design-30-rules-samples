# Rule 10: @import は起動時コンテキストを減らさない

本 Rule のサンプル: 「`@import` で分割すれば軽くなる」という誤解を解く実物。

## 構成

- `antipattern/` — CLAUDE.md 60 行 + `@import` 6 本で「軽くなった」と誤解した例
  - 実体は **6 ファイル合計 870 行が起動時に展開される**
  - 公式 docs (`memory.md` の Size セクション) に明記: `"imported files still load and enter the context window at launch"`
- `fixed/` — 同じ知識を **コンテキスト読み込みタイミング** で振り分けた例
  - 静的事実 → CLAUDE.md (200 行以内に圧縮)
  - パス固有のルール → `.claude/rules/<topic>.md` の `paths:` frontmatter
  - 呼び出し型手順 → `.claude/skills/<name>/SKILL.md`

## 検証コマンド

```bash
# antipattern: 起動時に読まれる総行数
wc -l antipattern/CLAUDE.md antipattern/docs/*.md antipattern/rules/*.md

# fixed: 起動時に読まれる総行数 (CLAUDE.md のみ + frontmatter なし rules)
wc -l fixed/CLAUDE.md
# .claude/rules/*.md は paths: 付きなので、該当ファイル開いた時だけ読まれる
# .claude/skills/deploy/SKILL.md は呼び出し時のみ読まれる
```

## 根拠

- 公式 docs: https://code.claude.com/docs/ja/memory (追加ファイルをインポートする / 効果的な指示を書く - Size)
- Anthropic Engineering Blog: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents (CLAUDE.md は naively dropped into context up front)
