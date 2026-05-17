#!/bin/bash
# commit-lint.sh
# PreToolUse(Bash) で git commit を検出したときに npm run lint を実行する。
# lint が失敗したら exit 2 でツール呼び出し (git commit) をブロックする。

set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

if ! npm run lint >/tmp/lint.log 2>&1; then
  echo "Blocked: npm run lint failed. Fix lint errors before committing." >&2
  cat /tmp/lint.log >&2
  exit 2
fi

exit 0
