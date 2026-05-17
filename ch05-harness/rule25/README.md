# Rule 25: Multi-agent は通常チャットの 15 倍トークンを消費する

> Anthropic Engineering Blog "How we built our multi-agent research system"
> (2025-06-13) L27 が主柱。数値: agent 4× / multi-agent 15× / token usage explains 80%

## 中心命題

Multi-agent (lead + subagents) アーキテクチャは普通のチャットの **約 15 倍** の
トークンを消費する。これは削減すべきコストではなく **アーキテクチャ内在の特性** で、
コストに見合うタスクを選ぶことが本質。

## 数値整理

| 指標 | 値 | 出典 (L) |
|------|---|---------|
| agent vs chat | **4×** | L27 |
| multi-agent vs chat | **15×** | L27 |
| multi-agent vs single agent | 約 3.75× (= 15÷4) | 計算 |
| BrowseComp パフォーマンス分散の説明 (3 要素計) | **95%** | L25 |
| token usage 単独の説明率 | **80%** | L25 |
| multi-agent (Opus 4 + Sonnet 4) vs single (Opus 4) パフォーマンス向上 | **90.2%** | L23 |
| 並列ツール呼び出しによる時間短縮 | **最大 90%** | L59 |

## 適用判断 (L27 から導出)

### Multi-agent に向くタスク 3 条件

1. **heavy parallelization** (真に並列可能なサブタスクが 3+)
2. **single context window を超える情報量** (例: S&P 500 の取締役全員)
3. **多数の複雑ツール** (各 subagent が異なるツールセットを担当)

### Multi-agent に向かないタスク 3 条件 (L27 直接引用)

1. **共有 context が必要** (all agents to share the same context)
2. **agent 間の依存が多い** (many dependencies between agents)
3. **リアルタイム調整が必要** (LLM agents are not yet great at coordinating and
   delegating to other agents in real time)

**most coding tasks involve fewer truly parallelizable tasks than research**
(L27) — コーディングタスクは多くが 2 番目・3 番目に該当し Multi-agent 不向き。

## 関連 Rule

- Rule 01 (有限予算): 15× は context だけでなく金銭予算にも適用
- Rule 13 (Subagent コンテキスト分離 vs Skill 知識注入): Rule 25 はその選択のコスト面
- Rule 16 (Subagent は他の Subagent を生成できない): 15× が 100× に膨らむのを防ぐ構造ガード
- Rule 20 (MCP は code で呼べ 98.7% 削減): 並列化より code execution + filesystem が効率良いケース
- Rule 22-24: Single agent でも実用可能な代替 (compaction / handoff)
- Rule 26 (次): 並列起動の上限 (3-5 subagent)

## サンプル構成

```
rule25/
├── README.md
├── antipattern/
│   ├── multi-agent-for-simple-coding.md  # 簡単なリファクタリングに 5 subagent → 15× 浪費
│   └── shared-context-multi-agent.md     # 同一ファイル編集 agent 並列 → 競合 + コスト爆発
└── fixed/
    ├── single-agent-with-filesystem.md    # 1 agent + filesystem 永続化 (Rule 20/24 接続)
    ├── multi-agent-research-task.md       # 並列リサーチ (適用例)
    └── cost-fit-checklist.md              # 15× が割に合うかの 5 質問
```
