# Rule 13: Subagent はコンテキスト分離が目的、Skill は知識注入が目的

本 Rule のサンプル: 「コンテキスト分離 vs 知識注入」の二項対立で 2 つのアンチパターンを示し、それぞれの正解と、公式パターン (Subagent への Skill プリロード) を示す。

## 構成

- `antipattern/subagent-for-injection/.claude/agents/api-conventions.md`: 知識注入を Subagent で実装した失敗例
- `antipattern/skill-for-isolation/.claude/skills/test-runner/SKILL.md`: コンテキスト分離を Skill で実装した失敗例
- `fixed/.claude/skills/api-conventions/SKILL.md`: API 規約は Skill (知識注入) が正解
- `fixed/.claude/agents/test-runner.md`: テスト実行は Subagent (コンテキスト分離) が正解
- `fixed/.claude/agents/api-developer.md`: Subagent に Skill をプリロードする公式パターン (両者の組み合わせ)

## 公式根拠

- Claude Code 公式「サブエージェント」: https://code.claude.com/docs/ja/sub-agents
  - 「各サブエージェントは、カスタムシステムプロンプト、特定のツールアクセス、および独立した権限を備えた独自のコンテキストウィンドウで実行されます」
  - 「サブエージェントの最も効果的な用途の 1 つは、大量の出力を生成する操作を分離することです」
  - 「代わりにスキルを検討してください。メイン会話コンテキストで実行される再利用可能なプロンプトまたはワークフローが必要な場合、分離されたサブエージェントコンテキストではなく」
  - 「サブエージェントは他のサブエージェントを生成できません」
  - 「skills フィールドを使用して、スキルコンテンツをスタートアップ時にサブエージェントのコンテキストに注入します」
- Anthropic Engineering Blog "Effective context engineering for AI agents" (2025-09-29)
  - "Each subagent might explore extensively, using tens of thousands of tokens or more, but returns only a condensed, distilled summary of its work (often 1,000-2,000 tokens)"
- Anthropic Engineering Blog "How we built our multi-agent research system" (2025-06-13)
  - "Subagents facilitate compression by operating in parallel with their own context windows"
  - "multi-agent systems use about 15× more tokens than chats"
