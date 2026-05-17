# Rule 11: Skills / Hooks / Subagents を 3 軸で選ぶ

本 Rule のサンプル: 「全部 Skill にする」誤りと、3 軸 (コンテキスト分離 / 副作用 / 再利用) で振り分けた例。

## 3 軸

- **コンテキスト分離** (問い: この作業の中間出力をメインウィンドウに残したくないか?) → Subagent
- **副作用 (確実実行)** (問い: Claude の判断に関係なく必ず実行されるべきか?) → Hook
- **再利用 (知識注入)** (問い: 同じ手順/知識を別タイミングで呼び出したいか?) → Skill

どれも当てはまらないなら CLAUDE.md (静的事実) または `.claude/rules/<topic>.md` (paths スコープ)。

## 構成

- `antipattern/`: 「全部 Skill にしてしまった」例
  - `deploy/SKILL.md`: 副作用なのに Skill 化 (Claude が呼び忘れる可能性)
  - `lint-check/SKILL.md`: 副作用なのに Skill 化 (PostToolUse Hook が正解)
  - `codebase-survey/SKILL.md`: コンテキスト分離が目的なのに Skill 化 (親ウィンドウを汚染)
- `fixed/`: 3 軸で正しく振り分けた例
  - `skills/deploy-checklist/SKILL.md`: 知識注入 (デプロイ前チェックリスト) → Skill が正解
  - `agents/codebase-explorer.md`: 大規模コードベース調査 → Subagent が正解
  - `settings.json`: PostToolUse Hook で Edit/Write 後に lint 自動実行 → Hook が正解
