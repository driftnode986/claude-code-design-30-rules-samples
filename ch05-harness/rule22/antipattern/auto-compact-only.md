# アンチパターン: /compact 一段階運用

`/context` で 80% 超を検知 → 即座に `/compact` (引数なし) を打つ。
これだけが context 管理の唯一の手段になっている運用。

## 観測される失敗パターン

### パターン 1: subtle context の喪失

セッション前半で議論した「なぜこの実装を選んだか」という設計判断が
compaction 後に消える。後段で別のメンバー (または別の Claude Code セッション) が
同じ問題に当たり、議論をゼロからやり直す。

Anthropic Engineering Blog "Effective context engineering for AI agents"
L91 が指摘するリスクそのもの。

```
過剰な compaction は subtle but critical context の損失を招き、
その重要性は後になって初めて明らかになる。
```

### パターン 2: tool 呼び出しメタデータの喪失

セッション中盤で `MultiEdit` を 10 ファイルに適用したが、
compaction でその引数 (どのファイルにどう適用したか) が削られる。
次のターンで「直前の編集をロールバックして」と頼んでも、
Claude Code は何を編集したか思い出せない。

### パターン 3: tool result clearing を知らない

「context window 上限近接 = `/compact`」しか選択肢を知らないため、
Anthropic Developer Platform 側で提供されている tool result clearing
(`/compact` よりはるかに軽い operation) を一度も試さない。

## なぜこれが起きるか

- ベストプラクティスの `/clear` `/compact` `/rewind` 4 階層が
  Claude Code 公式ドキュメント (best-practices.md L191-203) には書かれているが、
  「侵襲度順のエスカレーションラダー」として整理されていない
- tool result clearing は Engineering Blog (2025-09-29 公開) で初めて言及された
  概念で、Claude Code 公式ドキュメントの本文には未だ反映されていない
- Claude Code ユーザーは `/compact` を最初に学ぶため、それが唯一の手段だと思い込む

## 修正方針

`fixed/escalation-ladder.md` を参照。4 階層を侵襲度順に並べ、
context 圧迫率 (`/context` の出力) と運用状況で使い分ける。
