# compact 指示テンプレ (CLAUDE.md に追記する例)

`/compact` を打つときに毎回 instructions を手入力するのではなく、
プロジェクトの `CLAUDE.md` に compaction ポリシーを書いておく。
Claude Code は compaction 時にこの指示を参照する。

## CLAUDE.md 追記例

```markdown
## Compaction Policy

When compacting, always preserve:

1. **Architectural decisions**: なぜこの技術を選んだか、代替案と却下理由
2. **Unresolved bugs**: 再現条件、エラーメッセージ、試したアプローチ
3. **Modified files list**: このセッションで編集した全ファイルのパス
4. **Test commands**: 直近で走らせたテストコマンドと結果
5. **External dependencies**: 追加した npm/pip パッケージ、API キーの所在

Discard freely:

- 過去の Read tool 結果 (最新版が必要なら再 Read する)
- 同じ grep / find の繰り返し結果
- 試行錯誤の中間出力 (最終結論は残す)
- 既にコミットされた diff
```

## 使い方

1. 上記を `CLAUDE.md` の末尾に追記する
2. `/compact` を引数なしで打っても、Claude Code はこのポリシーに従う
3. 一時的にポリシーを上書きしたい場合は `/compact Focus on X` で
   その session 限りの追加指示を渡す

## 根拠

Anthropic 公式ドキュメント (best-practices.md L203):

> `CLAUDE.md` でコンパクション動作をカスタマイズします。
> "When compacting, always preserve the full list of modified files and
> any test commands" のような指示を使用して、重要なコンテキストが
> 要約を生き残ることを確認します
