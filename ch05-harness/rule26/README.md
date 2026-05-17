# Rule 26: サブエージェントの並列起動は 3-5 が上限

> Anthropic Engineering Blog "How we built our multi-agent research system"
> (2025-06-13) L43 (50 subagents 暴走) + L49 (3 段階スケーリング) + L59
> (3-5 並列、90% 時短) + L85 (同期実行ボトルネック) が主柱。

## 中心命題

Multi-agent を採用するときの並列起動は **3-5 subagent** が上限。
これは Anthropic 自身が「50 subagents spawn して暴走」した失敗から経験的に
発見した実務上限であり、3 重ルートで根拠付けられる:

1. **Coordination complexity**: 5 を超えると同期実行で破綻
2. **Token budget**: 15× コスト (Rule 25) が指数的に膨張
3. **Synchronous bottleneck**: lead agent が steer できなくなる

## 複雑性スケーリングルール (L49 から)

タスク複雑度に応じた並列度設定。

- **Simple fact-finding**: 1 agent × 3-10 tool calls
- **Direct comparisons**: 2-4 subagents × 10-15 tool calls each
- **Complex research**: 10+ subagents with clearly divided responsibilities
  (リサーチ専用、コーディングは Rule 25 のとおり不向き)

普通の業務では 10+ には到達しない。研究レベルの大規模調査でのみ
10+ を検討する。

## なぜ 3-5 か (10 ではなく)

| 並列度 | 観点 |
|--------|------|
| 1-2 | Simple で十分、Multi-agent 不要 |
| **3-5** | 標準推奨レンジ。並列化の利得が調整コストを上回る |
| 6-10 | Coordination complexity 急増、Synchronous bottleneck 顕在化 |
| 10+ | Clearly divided responsibilities 前提のみ可、L49 |
| 50+ | Anthropic 初期の暴走パターン (L43)、避ける |

## フラットツリー (構造的ガードレール)

Claude Code 公式 sub-agents.md L167 の制限:

> サブエージェントは他のサブエージェントを生成できないため、
> Agent(agent_type) はサブエージェント定義では効果がありません。

この制限により Claude Code は **3-5 並列 × 1 階層** のフラットツリーを強制し、
3 × 3 × 3 = 27 subagent のような爆発を構造的に防ぐ。Rule 16 と接続する
本書の重要鉄則。

## サンプル構成

```
rule26/
├── README.md
├── antipattern/
│   ├── 50-subagents-simple-query.md     # 20+ subagent 並列起動 → 暴走
│   └── nested-subagents-attempt.md      # Subagent から Subagent 生成 (Rule 16 違反)
└── fixed/
    ├── 3-5-parallel-orchestrator.md      # 3-5 subagent 並列の lead agent prompt
    ├── complexity-scaling-rules.md       # L49 の 3 段階スケーリング実務適用
    └── orchestrator-delegation-template.md  # L47「objective + output format + tool guidance + task boundaries」
```

## 関連 Rule

- Rule 16: Subagent は他の Subagent を生成できない (構造的ガードレール)
- Rule 22-24: 単一エージェントでの代替パス
- Rule 25: 経済合理性 (15× コスト + 5 質問チェックリスト)
- Part 5 全体: Rule 22-26 で Multi-agent と長期セッションを完結
