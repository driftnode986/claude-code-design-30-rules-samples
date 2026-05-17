# Rule 15: PreToolUse hook で最後の砦を実装

本 Rule のサンプル: 「`.env` / `package-lock.json` / `.git/` を絶対に編集させない」というニーズを、CLAUDE.md (advisory) と PreToolUse hook (deterministic) の両方で実装し、bypassPermissions モード下でも生き残る Hook の特殊地位を示す。

## 構成

- `antipattern/CLAUDE.md`: 「絶対に編集禁止」を文章で書いた例 (advisory なので Claude が必要と判断すれば編集してしまう。`bypassPermissions` モードでは確認すら出ない)
- `fixed/CLAUDE.md`: advisory な禁止記述を削除した最小 CLAUDE.md
- `fixed/.claude/settings.json`: `PreToolUse(Edit|Write)` hook を登録
- `fixed/.claude/hooks/protect-files.sh`: 保護パスを検出して `hookSpecificOutput` 形式で `permissionDecision: "deny"` を返す

## 公式根拠

- Claude Code 公式ドキュメント「Hooks リファレンス」
  - `PreToolUse` は唯一「ツール呼び出し前」に発火するブロック可能イベント
  - `permissionDecision: "deny"` を `hookSpecificOutput` で返すと、構造化された理由 (`permissionDecisionReason`) と共に Claude にフィードバックできる
  - URL: https://code.claude.com/docs/ja/hooks
- Claude Code 公式ドキュメント「パーミッションモード」
  - "Hooks: PreToolUse および PermissionRequest フック経由のカスタムパーミッションロジック"
  - "bypassPermissions モードはパーミッションプロンプトと安全チェックを無効にするため、ツール呼び出しは即座に実行されます。v2.1.126 以降、これには保護されたパスへの書き込みが含まれます"
  - URL: https://code.claude.com/docs/ja/permission-modes

## 設計判断

- `exit 2` (シンプル) vs `permissionDecision: "deny"` (構造化フィードバック) の使い分け
  - 防御目的では後者 (Claude が次ターンで理由を理解しやすい)
- `bypassPermissions` モード (v2.1.126+) は保護パス自動承認も無効化する → 唯一残るガードレールが PreToolUse Hook
- PostToolUse 等の事後イベントは「実行済み」のため防御に使えない (PreToolUse のみが事前ブロック点)
