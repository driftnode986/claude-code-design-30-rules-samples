# Decision Tree: `/clear` vs `/rewind` vs `/compact` vs `/btw`

Anthropic 公式 `Best practices for Claude Code` "Manage your session" の階段運用。
4 つのコマンドを「コンテキストにどれだけ手を入れるか」の段階で使い分ける。

## 判定フロー

```
直前の修正で何が起きたか?
├── 1 回目の失敗 (context まだ健全)
│   └── /rewind (Esc + Esc) で巻き戻し
│       → 元のプロンプトを具体化して再依頼
│
├── 2 回目以降の失敗 (Fail twice rule 発動)
│   └── /clear でセッション完全リセット
│       → 学んだことを組み込んだ初期プロンプトで再起動
│
├── 関連のないタスクに切り替える
│   └── /clear でコンテキストを完全リセット
│
├── コンテキストが膨らんだが情報は捨てたくない
│   └── /compact <instructions> で要約
│       例: /compact Focus on the API changes
│
├── トランスクリプトの途中まで巻き戻して要約したい
│   └── Esc + Esc で巻き戻しメニューを開く
│       → "Summarize from here" を選択
│
└── 確認したい一問一答 (履歴に残したくない)
    └── /btw でオーバーレイ回答 (履歴非保存)
```

## コマンド早見

- **`/rewind`** (or `Esc + Esc`): チェックポイント巻き戻し。会話とコード状態を
  以前の点に復元。失敗が 1 回目で context が健全な場合の第一選択
- **`/clear`**: コンテキスト完全リセット。Fail twice rule の発動時、関連のない
  タスクへの切り替え時。**「学んだことを組み込んだ初期プロンプトで再起動」が
  必須** (元のプロンプト再投入は同じ失敗を再生産する)
- **`/compact <instructions>`**: 会話を要約して圧縮。重要な決定とコードを残し
  つつ context window を空ける。Fail twice rule とは別軸の context 管理手段
- **`/btw`**: 一問一答のオーバーレイ。回答は履歴に入らない。「ちょっと聞きたい
  だけ」の確認で context を膨らませない

## Fail twice rule との関係

Fail twice rule (= 2 回連続失敗で `/clear`) は、上のフローの**「2 回目以降の失敗」
分岐の閾値**を定めるルールである。1 回目までは `/rewind` で十分、3 回目以降は
context rot が臨界点を超えている可能性が高い。

出典:
- https://www.anthropic.com/engineering/claude-code-best-practices
- https://code.claude.com/docs/ja/checkpointing
- https://code.claude.com/docs/ja/interactive-mode
