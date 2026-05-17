---
name: lint-check
description: Run ESLint and Prettier after editing files. Use after writing or modifying TypeScript.
---

# Lint Check (anti-pattern: 副作用なのに Skill 化)

> ファイル編集後に必ず走るべき lint を Skill にしている。
> Claude が「これは小さい変更だから lint いらない」と判断して呼ばないケースが頻発する。
> **正解は: PostToolUse Hook で `matcher: "Edit|Write"` を指定して自動発火させる**。

## 手順

```bash
pnpm lint
pnpm format
```

(これは「Claude の判断」に依存させていい工程ではない。`settings.json` の hooks で確実発火させる)
