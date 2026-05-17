#!/usr/bin/env bash
# context 圧迫率を SessionStart hook で表示するスクリプト例。
# UserPromptSubmit hook で context 80% 超を検知して警告も出せる。
#
# .claude/settings.json:
#   {
#     "hooks": {
#       "SessionStart": [
#         {
#           "type": "command",
#           "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/context-monitor.sh"
#         }
#       ]
#     }
#   }

set -euo pipefail

# Claude Code は SessionStart hook の標準出力を additionalContext として注入する。
# 以下はセッション開始時に「context 4 階層エスカレーションラダー」を毎回表示する例。

cat <<'CTX_REMINDER'
[Context Management Reminder]

context 圧迫時のエスカレーション:

  60-80% → Level 0: tool result clearing (待つ、自動)
  80-85% → Level 1: /rewind 局所要約
  85%+   → Level 2: /compact + instructions (CLAUDE.md ポリシー参照)
  同じ問題で 2 回失敗 → Level 3: /clear + 詳細プロンプト書き直し

`/context` で圧迫率を可視化できる。
CTX_REMINDER
