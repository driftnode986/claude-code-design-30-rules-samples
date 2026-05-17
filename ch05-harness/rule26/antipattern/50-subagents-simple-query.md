# アンチパターン: Simple なクエリに 20+ subagent を並列起動する

## 状況

「日本の AI スタートアップ企業 100 社の最新ファンディング情報を集めたい」という
リクエストに対して、lead agent が 25 subagent を並列起動した例。

## 失敗した orchestrator-prompt.md

```markdown
You are a lead orchestrator. The user wants funding information for 100
Japanese AI startups.

Spawn 25 subagents in parallel, each handling 4 startups:

- subagent-1: 株式会社 A, B, C, D
- subagent-2: 株式会社 E, F, G, H
- subagent-3: 株式会社 I, J, K, L
... (25 entries)

各 subagent は担当 4 社の funding round / amount / lead investor を調べて
JSON で返すこと。
```

## 何が起こるか

1. **25 subagent 同時起動** — token 消費が一気に 75× (5 subagent 並列の 5 倍) に
   膨張。Rule 25 の 15× は 5 subagent 規模の数値で、25 subagent では実測 50-80×
2. **同期実行ボトルネック** — lead agent は 25 subagent 全ての完了を待ってから
   集約処理に入る。最も遅い 1 subagent が全体を塞ぐ
3. **Coordination 破綻** — 25 subagent の戻り値を context window に集約しようと
   すると、lead agent の context window が破綻 (200,000 トークン上限を突破)
4. **重複作業** — 別の subagent が同じ企業を別名 (英名・日本語名・略称) で
   重複調査するケース多発 (Anthropic L47 が指摘する duplication パターン)
5. **エラー時の復旧不能** — 25 のうち 1 つが失敗しても、lead agent は他の 24 を
   再起動するか諦めるかの選択を迫られる

## なぜ失敗するのか

Anthropic Engineering Blog L43 が示す古典的失敗パターン:

> Multi-agent systems have key differences from single-agent systems,
> including a rapid growth in coordination complexity. **Early agents made
> errors like spawning 50 subagents for simple queries**, scouring the web
> endlessly for nonexistent sources, and distracting each other with
> excessive updates.

(著者訳) Multi-agent システムは single-agent システムと重要な違いがあり、調整の
複雑さが急速に増大します。初期のエージェントは「単純なクエリに 50 subagent を
spawn する」「存在しない情報源を延々と探し回る」「過剰なアップデートで互いに
注意散漫にする」といった失敗を繰り返しました。

Anthropic 自身が「50 subagents 暴走」を体験し、ここから「3-5 上限」を
経験的に発見した経緯です。

## 修正方針

`fixed/3-5-parallel-orchestrator.md` の 5 subagent 構成 + 1 subagent が
20 社担当する分担に置き換える。

```
5 subagents × 20 社 = 100 社カバー
```

各 subagent は内部で 3+ ツール並列 (Amazon API / GitHub API / Crunchbase 等) を
使うので、5 subagent でも実質 15+ 並列の探索効率を確保できる
(Anthropic L59 の 2 段並列化)。

token コスト試算:

- 25 subagent: 約 75× (調整失敗で更に膨張、実測 100×+)
- **5 subagent: 約 15×** (Rule 25 の標準コスト、調整 OK)

時間も実際には 5 subagent の方が速い (同期ボトルネックの分)。
