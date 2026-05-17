# Rule 29: 「ハーネス」の黙った最適化を信用するな (effort 明示)

Claude Code の `effort` は Adaptive reasoning を制御する 5 段階 (`low` / `medium` /
`high` / `xhigh` / `max`)。`xhigh` は Opus 4.7 のみ、`max` は全モデルにあるが session
限定。Opus 4.7 は v2.1.117 から `xhigh` がデフォルトになった。

このデフォルト値の変更や、`CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` の Opus 4.6/Sonnet 4.6
のみサポート、`ultrathink` キーワードが effort 値を変えない (in-context instruction
として送られるだけ) といった「ハーネス」の最適化挙動は黙って変わる。

明示的に固定するパターンを提示する。

## ファイル

- `antipattern/CLAUDE-no-effort.md` — effort 未指定の CLAUDE.md (「最近 Claude が深く考えなくなった」と書いた例)
- `antipattern/settings-max-thinking-tokens-opus47.json` — Opus 4.7 で `MAX_THINKING_TOKENS` を設定 (無効)
- `fixed/settings-effort-explicit.json` — `effortLevel: xhigh` を明示
- `fixed/.env-org-default-high.sh` — `CLAUDE_CODE_EFFORT_LEVEL=high` を組織レベルで指定
- `fixed/skill-heavy-refactor.md` — Skill frontmatter で `effort: max` を一時タスク用に指定
