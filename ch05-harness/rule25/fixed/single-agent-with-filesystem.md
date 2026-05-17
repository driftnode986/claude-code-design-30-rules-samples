# 修正後: Single agent + filesystem 永続化

## 状況

Multi-agent の代替として、1 agent + filesystem (Rule 24 の handoff レイヤ +
Rule 20 の code execution パターン) を使う構成。コーディングタスクの大半に
適用可能で、Multi-agent の 15× コストを払わずに済む。

## prompt.md

```markdown
You are a coding agent working on the project.

## 起動シーケンス (Rule 24)

1. `pwd` で現在地確認
2. `cat claude-progress.txt` で直近セッションの Next を確認
3. `cat feature_list.json` で `passes: false` の未完了 feature を確認
4. `git log --oneline -20` + `git status` でコード state 確認

## 作業中の戦略 (Rule 20 接続)

大量出力を発生させる操作 (テスト実行、ログ解析、ファイル列挙) は MCP tool を
**直接呼ぶ代わりに、Bash で実行してファイルに書き出し、必要な部分だけ Read** する。

例: 100 個のテストファイルを並列実行する場合
\`\`\`bash
npm test --silent > /tmp/test-results.log 2>&1
grep -E '✗|FAIL' /tmp/test-results.log | head -20
\`\`\`

これにより context window への混入は失敗箇所のみ。`code execution with MCP`
パターン (Rule 20) と同型の発想で、Multi-agent を立てる必要がなくなる。

## セッション終了 (Rule 24)

`claude-progress.txt` の末尾に Status / Done / Next の 3 ブロックエントリを追加。
git commit してセッション終了。
```

## このパターンが Multi-agent に勝る場面

| 観点 | Single + filesystem | Multi-agent |
|------|---------------------|-------------|
| トークン消費 | 通常 chat の 4× | chat の 15× |
| 大量出力対応 | filesystem に逃がす | subagent context で吸収 |
| 設計判断の整合性 | 1 agent が全責任 | 4-5 agent の合議が必要 |
| 並列化 | なし (順次) | あり (3-5 並列) |
| 適性タスク | コーディング・実装 | リサーチ・調査・横断分析 |

## いつ Single agent から Multi-agent へ移行すべきか

以下 3 条件すべてを満たすときのみ移行を検討する (Anthropic Engineering Blog L27):

1. **heavy parallelization 可能** — 真に並列化できるサブタスクが 3+ ある
2. **single context window 不足** — 1 つのセッションで持ち切れない情報量
3. **多数の複雑ツール** — 各 subagent が独立したツールセットを使う

3 つ揃わないなら Single agent + filesystem の方が安価で予測可能。
