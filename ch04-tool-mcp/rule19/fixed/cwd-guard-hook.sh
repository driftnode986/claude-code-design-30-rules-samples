#!/usr/bin/env bash
# CwdChanged hook: 予期せぬ cwd 変更を検出して警告する
#
# settings.json への登録例:
# {
#   "hooks": {
#     "CwdChanged": [
#       {
#         "hooks": [
#           {
#             "type": "command",
#             "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/cwd-guard-hook.sh"
#           }
#         ]
#       }
#     ]
#   }
# }

set -euo pipefail

# CwdChanged event の JSON は stdin で渡される
INPUT_JSON=$(cat)

OLD_CWD=$(echo "$INPUT_JSON" | jq -r '.old_cwd // empty')
NEW_CWD=$(echo "$INPUT_JSON" | jq -r '.new_cwd // .cwd // empty')
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-}"

if [[ -z "$NEW_CWD" ]]; then
  exit 0
fi

# プロジェクト外への cd を警告 (ハードブロックではない、観察ログ)
if [[ -n "$PROJECT_DIR" && "$NEW_CWD" != "$PROJECT_DIR"* ]]; then
  echo "⚠️  cwd changed outside project: $OLD_CWD → $NEW_CWD" >&2
  echo "    Project root: $PROJECT_DIR" >&2
  echo "    Tool calls that resolve relative paths may behave unexpectedly." >&2
fi

exit 0
