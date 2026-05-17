# Rule 14: Hook で絶対実行を書け

本 Rule のサンプル: 「commit 前に必ず lint を走らせる」というニーズを CLAUDE.md (advisory) と Hook (deterministic) の両方で実装し、挙動の差を示す。

## 構成

- `antipattern/CLAUDE.md`: 「commit 前に必ず lint を走らせろ」を文章で書いた例。Claude は確率的に従う/従わないため、忘れることがある
- `fixed/CLAUDE.md`: advisory な lint 指示を削除した最小 CLAUDE.md
- `fixed/.claude/settings.json`: `PreToolUse(Bash)` hook で git commit を捕まえて lint を自動実行
- `fixed/.claude/hooks/commit-lint.sh`: git commit コマンドを検出し、`npm run lint` を実行。失敗時は `exit 2` でブロック

## 公式根拠

- Anthropic Engineering Blog "Best practices for Claude Code"
  - "Use hooks for actions that must happen every time with zero exceptions."
  - "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens."
  - "Ruthlessly prune. If Claude already does something correctly without the instruction, delete it or convert it to a hook."
  - URL: https://www.anthropic.com/engineering/claude-code-best-practices
- Claude Code 公式ドキュメント「Hooks リファレンス」
  - イベントは 3 つのケイデンス (セッションごと / ターンごと / ツール呼び出しごと) に分類される
  - Hook の 5 タイプ: `command` / `http` / `mcp_tool` / `prompt` / `agent`
  - URL: https://code.claude.com/docs/ja/hooks
