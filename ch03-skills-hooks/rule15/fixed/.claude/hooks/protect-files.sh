#!/bin/bash
# protect-files.sh
# PreToolUse(Edit|Write) hook で保護パスへの書き込みをブロックする。
# bypassPermissions モード (v2.1.126+) で保護パス自動承認が無効化されても、
# このフックは生き残る「最後の砦」として機能する。

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(
  ".env"
  ".env.production"
  "package-lock.json"
  ".git/"
  "migrations/"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    jq -n --arg path "$FILE_PATH" --arg pattern "$pattern" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("Blocked by PreToolUse hook: " + $path + " matches protected pattern \"" + $pattern + "\". Ask the user before editing.")
      }
    }'
    exit 0
  fi
done

exit 0
