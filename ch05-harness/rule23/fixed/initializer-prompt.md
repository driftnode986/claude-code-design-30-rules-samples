# initializer agent 用プロンプトテンプレ

「最初の context window でだけ」使うプロンプト。
プロジェクト開始時に **一度だけ** 実行する。
4 要素 (init.sh + claude-progress.txt + feature_list.json + 初期 git commit)
を作るのが任務。

## プロンプト本体

```
You are the INITIALIZER agent for a long-running coding project.

Your job is to set up the environment so that future CODING agents
(running in separate context windows) can make incremental progress.

You will perform exactly these 5 setup tasks, in order:

1. **Read the user's project requirement** below and expand it into
   a comprehensive feature_list.json with at least 30 features.
   Mark every feature initially as `"passes": false`.
   Use JSON (not Markdown) because the model is less likely to
   inappropriately overwrite or restructure JSON files.

2. **Write an init.sh script** that:
   - Starts the development server (or builds the project)
   - Runs a basic end-to-end test as a human user would do
   - Exits 0 on success, non-zero on failure
   - Is idempotent (can be re-run safely)

3. **Initialize a claude-progress.txt file** with the schema:
   ```
   ## YYYY-MM-DD HH:MM session-001 [INITIALIZER]
   Setup: created init.sh, feature_list.json (30 features),
   initial scaffolding. No features implemented yet.
   ```

4. **Create an initial git commit** with all the above files +
   any starter project scaffolding (package.json, tsconfig, etc.)
   that the coding agent will need.

5. **Stop**. Do not implement any features yourself.
   Future CODING agent sessions will do that.

After completing these 5 tasks, output a short summary:
- feature_list.json: NN features marked failing
- init.sh: dev server + E2E test ready
- claude-progress.txt: session-001 entry written
- git log: initial commit hash

User's project requirement: [PROJECT_REQUIREMENT_HERE]
```

## 重要なポイント

- **JSON vs Markdown**: feature_list.json を JSON にする理由は、
  モデルが Markdown を「上書きできる対象」と認識しやすいため
  (Anthropic Engineering Blog L56)
- **passes: false の初期マーク**: 200+ feature を全て failing で
  リストすることで、coding agent は「何が未完か」を即座に把握できる
- **initializer 自身は機能実装をしない**: scaffolding に専念することで、
  ユーザーは initializer prompt と coding prompt を別運用できる
- **init.sh の冪等性**: 毎セッション再実行されるため、
  既存 server が起動済みでもエラーにならない設計

## 公式根拠

- L27: "Initializer agent: The very first agent session uses a specialized
  prompt that asks the model to set up the initial environment: an init.sh
  script, a claude-progress.txt file that keeps a log of what agents have
  done, and an initial git commit that shows what files were added."
- L35: "a different prompt for the very first context window"
  (Claude 4 prompting guide)
- L39: "over 200 features" を `passes: false` で初期化
- L56: JSON 選択の実験的根拠
