# Rule 28: 自動モードの Conversational boundary を活用する

Claude Code v2.1.83 以降の auto モードは、別の分類器モデルがアクション実行前にレビューする「半自走」モード。Pro 不可、Haiku 不可、Bedrock/Vertex/Foundry 不可という強い要件付き。

公式 docs `permission-modes.md` L82-84 は本 Rule の核心を述べる。

> 分類器は会話で述べる境界をブロック信号として扱います。Claude に「プッシュしないで」または「デプロイ前にレビューを待って」と言う場合、分類器はデフォルトルールが許可する場合でも一致するアクションをブロックします。境界は後のメッセージで解除するまで有効です。

つまり「設定ファイルを書き換えなくても、会話で『〜しないで』と言えばその場で deny ルールが成立する」。動的境界が auto モードの最大の価値。

ただし境界はトランスクリプトから再読み込みされるため、コンパクションで述べたメッセージが消えると失われる。ハード保証なら `permissions.deny` を使う。

## ファイル

- `antipattern/CLAUDE-no-boundary.md` — Conversational boundary を活用しない CLAUDE.md (「全部やって」)
- `antipattern/settings-permissive-allow.json` — `Bash(*)` allow + auto モード入時の挙動誤解
- `fixed/CLAUDE-with-boundary.md` — 開発開始時に述べる Conversational boundary テンプレート
- `fixed/settings-managed-disable-auto.json` — 組織レベルで auto モード禁止
- `fixed/settings-hard-deny-rules.json` — コンパクション耐性のあるハード保証
