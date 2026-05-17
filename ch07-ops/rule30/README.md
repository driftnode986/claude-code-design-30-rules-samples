# Rule 30: Fail twice rule — 同じ修正を2回繰り返したら /clear

Anthropic 公式 `claude-code-best-practices.md` "Avoid common failure patterns"
セクションが定める閾値ルール: **2 回の失敗修正の後、`/clear` を実行し、学んだ
ことを組み込んだより良い初期プロンプトを書く**。

このルールを CLAUDE.md に明示せずに長時間セッションを続けると、コンテキストが
失敗アプローチで汚染され (context rot)、解像度がさらに下がる悪循環に入る。
3 回目以降の修正は通常、ハーネス (Claude Code) の問題ではなく**プロンプトの
解像度問題**である。

`/clear` / `/rewind` / `/compact` / `/btw` の使い分け階段を提示する。

## ファイル

- `antipattern/CLAUDE-no-fail-twice.md` — Fail twice rule を書いていない CLAUDE.md
- `antipattern/session-log-cluttered.txt` — 6 回連続修正で context が汚染された対話履歴例
- `fixed/CLAUDE-fail-twice-rule.md` — Fail twice rule を明示した CLAUDE.md
- `fixed/clear-vs-rewind-decision-tree.md` — `/clear` / `/rewind` / `/compact` / `/btw` の階段運用
- `fixed/better-initial-prompt-template.md` — 「学んだことを組み込んだ」再起動プロンプトのテンプレート

## 出典

- https://www.anthropic.com/engineering/claude-code-best-practices
  - "Tight feedback loops" (Manage your session セクション)
  - "Avoid common failure patterns" / "Correcting over and over" — Fail twice rule の核心
- https://code.claude.com/docs/ja/checkpointing — `/rewind` の挙動
- https://code.claude.com/docs/ja/interactive-mode — `/clear` / `/compact` / `/btw`
