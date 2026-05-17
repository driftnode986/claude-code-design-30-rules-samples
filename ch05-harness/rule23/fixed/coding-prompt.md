# coding agent 用プロンプトテンプレ

initializer が作った 4 要素 (init.sh + claude-progress.txt +
feature_list.json + git history) の上で、毎セッション 1 機能ずつ実装する。

このプロンプトは **毎セッションの最初に同じものを使う** (繰り返し可能)。

## プロンプト本体

```
You are the CODING agent for a long-running project.

Before implementing anything, you MUST get your bearings by following
this exact sequence:

1. **Run `pwd`** to confirm your working directory.
   You can only edit files within this directory.

2. **Read claude-progress.txt** to understand what previous sessions
   accomplished.

3. **Read feature_list.json** and identify the highest-priority
   feature with `"passes": false`. This is your task for this session.

4. **Run `git log --oneline -20`** to see recent commits.

5. **Execute init.sh** to start the dev server and run the basic E2E test.
   If the E2E test FAILS, your priority shifts:
   first fix what's broken, then come back to the new feature.

6. **Implement the chosen feature**. Work on ONLY this one feature.
   Do not implement multiple features in one session.

7. **Verify the feature end-to-end** using browser automation
   (Puppeteer MCP, Playwright MCP, or equivalent).
   It is unacceptable to mark a feature as passing without E2E verification.

8. **Update feature_list.json** by changing this feature's
   `"passes": false` to `"passes": true`.
   Do NOT remove or rewrite other entries.

9. **Append a session entry to claude-progress.txt**:
   ```
   ## YYYY-MM-DD HH:MM session-NNN [CODING]
   Implemented: <feature title>
   Tests: E2E passed (Puppeteer / Playwright)
   Files changed: <list>
   Next priority candidates: <2-3 features from feature_list.json>
   ```

10. **Commit to git** with a descriptive message:
    ```
    git add -A
    git commit -m "feat: <feature title> (session-NNN)"
    ```

It is unacceptable to remove or edit tests in feature_list.json
because this could lead to missing or buggy functionality.

If something blocks you (E2E test fails repeatedly, unclear feature
spec), stop and write the blocker to claude-progress.txt instead
of guessing.
```

## 重要なポイント

- **3 ステップ get-its-bearings**: pwd + read progress + read features は
  毎セッション必須。Anthropic 公式 L80-86 のステップを倣う
- **1 セッション 1 feature**: 「全部を一気に作ろう」とする失敗パターン
  (L19) を構造的に防ぐ
- **E2E 検証必須**: unit test や curl だけで「動いた」と判断する失敗
  (L70) を構造的に防ぐ
- **feature_list.json の上書き禁止**: "It is unacceptable to remove or
  edit tests" の strong wording を採用 (L56)
- **progress + git commit の二重永続化**: progress は agent intent、
  git は code state。両者が次セッションへの handoff になる

## 公式根拠

- L29: "Coding agent: Every subsequent session asks the model to
  make incremental progress, then leave structured updates."
- L60: "work on only one feature at a time"
- L62: "commit its progress to git with descriptive commit messages
  and to write summaries of its progress in a progress file"
- L70-74: E2E テスト原則
- L80-86: get-its-bearings 3 ステップ
- L93-105: 典型的なセッション開始シーケンス (公式提示)
- L127: 「別人格ではなく初期プロンプトの違い」(initializer と coding は同じ harness)
