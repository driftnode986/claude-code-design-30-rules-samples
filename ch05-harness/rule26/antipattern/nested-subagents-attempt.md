# アンチパターン: Subagent から更に Subagent を生成しようとする

## 状況

リサーチタスクで「lead agent が 3 subagent を spawn、各 subagent が更に
4 subagent を spawn して合計 12 並列にしたい」と Subagent 定義に
`Agent(agent_type)` を含めた例。

## 失敗した subagent 定義

`.claude/agents/researcher.md`:

```yaml
---
name: researcher
description: Conduct deep research on a topic
tools:
  - WebSearch
  - WebFetch
  - Read
  - Write
  - Agent(deep_researcher)  # ← 子 subagent を spawn しようとする
---

You are a research agent. For deeper analysis, spawn 4 deep_researcher
subagents in parallel to investigate sub-topics.
```

`.claude/agents/deep_researcher.md`:

```yaml
---
name: deep_researcher
description: Conduct in-depth analysis on a sub-topic
tools:
  - WebSearch
  - WebFetch
  - Read
---

You are a deep research agent on a sub-topic.
```

## 何が起こるか

1. **Agent(agent_type) が無視される** — Claude Code 公式仕様 (sub-agents.md L167)
   により、「サブエージェントは他のサブエージェントを生成できないため、
   Agent(agent_type) はサブエージェント定義では効果がありません」
2. **researcher subagent は `Agent` ツールを呼ぼうとして失敗** —
   ランタイムエラーまたは無視される
3. **lead agent の意図 (12 並列) が達成されない** — researcher subagent は
   結局自分の context window で逐次調査せざるを得ない
4. **3 × 4 = 12 並列を期待した設計が崩壊** — 想定の 1/4 のスループット

## なぜ Claude Code がこの制限を設けているか

Anthropic Engineering Blog L43 の「50 subagents 暴走」を構造的に防ぐためです。
仮に Subagent が更に Subagent を生成できれば、3 (lead) × 5 (子) × 5 (孫) = **75
並列** となり、L43 の失敗パターンが容易に再現します。

公式仕様の制約はトップダウンで設計されたフラットツリー (3-5 並列 × 1 階層) を
強制し、ツリー深さの暴走を防いでいます。Rule 16 で扱った構造的ガードレールが
ここで Rule 26 (並列度上限) と接続します。

## 修正方針

`fixed/3-5-parallel-orchestrator.md` の lead agent + 3-5 subagent フラット構成
+ 各 subagent 内での 3+ ツール並列に置き換える。

- lead agent: 3 subagent を並列起動 (1 階層)
- 各 subagent: 内部で 3+ ツールを並列実行

合計の並列度: 3 subagent × 3 ツール = **9 並列** (lead agent 含めて 10 並列前後)

ツリー深さ 1 階層、並列度 3-5 subagent、各 subagent 内 3+ ツール並列が
Claude Code が公式に最適化したパターンです。

## 「設計フェーズと実装フェーズ分離」の応用

Rule 25 で示した「設計フェーズと実装フェーズの分離」も同型の発想。

- 設計フェーズ: 1 lead agent が ADR を書き、subagent への分担を決定
- 実装フェーズ: 3-5 subagent が並列実装

これは Rule 23 の二段「ハーネス」(initializer + coding) とも同型で、
**1 階層フラットツリー** + **時系列の段階分割** の組み合わせが
Multi-agent 運用の標準形になります。
