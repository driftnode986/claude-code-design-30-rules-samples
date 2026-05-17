# Rule 16: サブエージェントは他のサブエージェントを生成できない

本 Rule のサンプル: 「大規模リファクタリングを Subagent オーケストレーションで進めたい」というニーズに対して、ネストした Subagent ツリー (公式に禁止されていて動かない) と、フラットな単方向ツリー + Skill 化 (公式推奨) の二つを並べて、運用上の判断軸を示す。

## 構成

- `antipattern/.claude/agents/orchestrator.md`: 配下に researcher / implementer / reviewer を起動する想定の Subagent (`tools: [Agent(researcher), ...]` を書いているが、公式仕様により Subagent 定義内の `Agent(agent_type)` は無効)
- `antipattern/.claude/agents/researcher.md`: orchestrator から委譲され、さらに api-explorer / db-explorer を委譲する想定 (これも動かない)
- `antipattern/.claude/agents/api-explorer.md`: researcher から起動される想定の深い専門 Subagent
- `fixed/.claude/agents/researcher.md`: 単独で完結する調査 Subagent。深い探索は自コンテキスト内で完結させ、メイン会話に「次に api-explorer を呼んで」と提案するに留める
- `fixed/.claude/agents/api-explorer.md`: メイン会話から researcher の結果を受けて起動される並列 Subagent
- `fixed/.claude/agents/implementer.md`: メイン会話から researcher の後に起動される実装 Subagent (レビューは起動しない)
- `fixed/.claude/skills/parallel-research/SKILL.md`: メイン会話・Subagent の両方から呼べる定型手順 Skill。Subagent ネスト禁止の代替として機能する

## 公式根拠

- Claude Code 公式ドキュメント「カスタムサブエージェントを作成する」
  - 「サブエージェントは他のサブエージェントを生成できません。ワークフローがネストされた委譲を必要とする場合は、スキルを使用するか、メイン会話からサブエージェントをチェーンします」
  - 「Subagents cannot spawn other subagents, so `Agent(agent_type)` has no effect in subagent definitions」(フロントマター仕様レベルで無効)
  - 「This prevents infinite nesting (subagents cannot spawn other subagents) while still gathering necessary context」(Plan サブエージェントの解説)
  - URL: https://code.claude.com/docs/ja/sub-agents

- Anthropic Engineering Blog「How we built our multi-agent research system」(2025-06-13)
  - "the lead agent analyzes it, develops a strategy, and spawns subagents to explore different aspects simultaneously"
  - "Early agents made errors like spawning 50 subagents for simple queries"
  - URL: https://www.anthropic.com/engineering/multi-agent-research-system

## 設計判断

- メイン会話 (lead) → サブエージェント (workers) の単方向ツリー (depth=1) を強制
- ネストしたい動機 ≒ コンテキスト爆発の回避 → Skills 化 で同コンテキスト再利用 / chain で main から順次起動 の二択
- `Agent(agent_type)` 制限構文はメインスレッド (`claude --agent`) 用。Subagent 定義内では無効
- `antipattern/orchestrator.md` の `tools: [Agent(researcher), ...]` は Claude Code が読み込み時に無視する。明示エラーは出ないが、Subagent 内で `Agent` ツールが利用可能になることはない
