# Rule 19: Tool は絶対パスを要求しろ

本 Rule のサンプル: ファイルバックアップ Tool を題材に、相対パスを受け取って内部で `resolve()` するアンチパターンと、絶対パスを `inputSchema` で required + 先頭 `/` チェックで強制する修正後の対比を示す。

## 構成

- `antipattern/backup-tool.yaml`: 相対パスを受け取り、サーバー内部で `process.cwd()` 起点に resolve する Tool 定義。`SubagentStart` 後の cwd 不一致で意図しないディレクトリを backup する事故が起きる
- `fixed/backup-tool.yaml`: 絶対パスを `pattern: "^/"` で強制し、相対パスを受け取った場合は明示エラーを返す Tool 定義
- `fixed/cwd-guard-hook.sh`: `CwdChanged` hook で予期せぬ cwd 変更を検出し、警告を出すサンプル

## 公式根拠

- Claude Code 公式ドキュメント (tools-reference.md, Read tool behavior)
  - "The Read tool takes a file path and returns the contents with line numbers. **Claude is instructed to always pass absolute paths**."
  - URL: https://code.claude.com/docs/tools-reference

- Claude Code 公式ドキュメント (hooks.md, ツール入力 schema)
  - Write/Edit/Read の `file_path` は「絶対パス」と明示 (L582-588)
  - URL: https://code.claude.com/docs/ja/hooks

- Claude Code 公式ドキュメント (hooks-guide.md L554)
  - 「`command not found` が表示される場合は、絶対パスを使用するか、スクリプトを参照するために `$CLAUDE_PROJECT_DIR` を使用します」

## 設計判断

- 絶対パス要求は Rule 17 の判別可能性原則を path 引数に展開したもの
- cwd は Claude のセッション中に変動しうる (Subagent 起動、Bash subshell、`cd` コマンド、`CwdChanged` hook の発火を伴う変更)
- Tool description で「絶対パスを渡してください」と書くだけでは弱い。`inputSchema` で `pattern: "^/"` 検証 + サーバー側で `path.isAbsolute()` チェックを二重に置く
- `$CLAUDE_PROJECT_DIR` は Hook script からプロジェクトルートを取得する手段として公式が提供。Tool 引数を組み立てるときの基準点として使える
